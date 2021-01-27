"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var IntervalScheduler_1 = require("../scheduler/IntervalScheduler");
var DefaultActiveSpeakerDetector = /** @class */ (function () {
    function DefaultActiveSpeakerDetector(realtimeController, selfAttendeeId, hasBandwidthPriorityCallback, waitIntervalMs, updateIntervalMs) {
        if (waitIntervalMs === void 0) { waitIntervalMs = 1000; }
        if (updateIntervalMs === void 0) { updateIntervalMs = 200; }
        this.realtimeController = realtimeController;
        this.selfAttendeeId = selfAttendeeId;
        this.hasBandwidthPriorityCallback = hasBandwidthPriorityCallback;
        this.waitIntervalMs = waitIntervalMs;
        this.updateIntervalMs = updateIntervalMs;
        this.speakerScores = {};
        this.speakerMuteState = {};
        this.detectorCallbackToHandler = new Map();
        this.detectorCallbackToScoresTimer = new Map();
        this.detectorCallbackToActivityTimer = new Map();
        this.hasBandwidthPriority = false;
        this.mostRecentUpdateTimestamp = {};
    }
    DefaultActiveSpeakerDetector.prototype.needUpdate = function (attendeeId) {
        if (!this.activeSpeakers) {
            return true;
        }
        return ((this.speakerScores[attendeeId] === 0 && this.activeSpeakers.includes(attendeeId)) ||
            (this.speakerScores[attendeeId] > 0 && !this.activeSpeakers.includes(attendeeId)));
    };
    DefaultActiveSpeakerDetector.prototype.updateActiveSpeakers = function (policy, callback, attendeeId) {
        if (!this.needUpdate(attendeeId)) {
            return;
        }
        var sortedSpeakers = [];
        var attendeeIds = Object.keys(this.speakerScores);
        for (var i = 0; i < attendeeIds.length; i++) {
            var attendeeId_1 = attendeeIds[i];
            sortedSpeakers.push({ attendeeId: attendeeId_1, activeScore: this.speakerScores[attendeeId_1] });
        }
        var sortedAttendeeIds = sortedSpeakers
            .sort(function (s1, s2) { return s2.activeScore - s1.activeScore; })
            .filter(function (s) {
            return s.activeScore > 0;
        })
            .map(function (s) {
            return s.attendeeId;
        });
        this.activeSpeakers = sortedAttendeeIds;
        callback(sortedAttendeeIds);
        var selfIsActive = sortedAttendeeIds.length > 0 && sortedAttendeeIds[0] === this.selfAttendeeId;
        var hasBandwidthPriority = selfIsActive && policy.prioritizeVideoSendBandwidthForActiveSpeaker();
        var hasBandwidthPriorityDidChange = this.hasBandwidthPriority !== hasBandwidthPriority;
        if (hasBandwidthPriorityDidChange) {
            this.hasBandwidthPriority = hasBandwidthPriority;
            this.hasBandwidthPriorityCallback(hasBandwidthPriority);
        }
    };
    DefaultActiveSpeakerDetector.prototype.updateScore = function (policy, callback, attendeeId, volume, muted) {
        var activeScore = policy.calculateScore(attendeeId, volume, muted);
        if (this.speakerScores[attendeeId] !== activeScore) {
            this.speakerScores[attendeeId] = activeScore;
            this.mostRecentUpdateTimestamp[attendeeId] = Date.now();
            this.updateActiveSpeakers(policy, callback, attendeeId);
        }
    };
    DefaultActiveSpeakerDetector.prototype.subscribe = function (policy, callback, scoresCallback, scoresCallbackIntervalMs) {
        var _this = this;
        var handler = function (attendeeId, present) {
            if (!present) {
                _this.speakerScores[attendeeId] = 0;
                _this.mostRecentUpdateTimestamp[attendeeId] = Date.now();
                _this.updateActiveSpeakers(policy, callback, attendeeId);
                return;
            }
            _this.realtimeController.realtimeSubscribeToVolumeIndicator(attendeeId, function (attendeeId, volume, muted, _signalStrength) {
                _this.mostRecentUpdateTimestamp[attendeeId] = Date.now();
                if (muted !== null) {
                    _this.speakerMuteState[attendeeId] = muted;
                }
                _this.updateScore(policy, callback, attendeeId, volume, muted);
            });
        };
        this.detectorCallbackToHandler.set(callback, handler);
        var activityTimer = new IntervalScheduler_1.default(this.updateIntervalMs);
        activityTimer.start(function () {
            for (var attendeeId in _this.speakerScores) {
                if (Date.now() - _this.mostRecentUpdateTimestamp[attendeeId] > _this.waitIntervalMs) {
                    _this.updateScore(policy, callback, attendeeId, 0, _this.speakerMuteState[attendeeId]);
                }
            }
        });
        this.detectorCallbackToActivityTimer.set(callback, activityTimer);
        if (scoresCallback && scoresCallbackIntervalMs) {
            var scoresTimer = new IntervalScheduler_1.default(scoresCallbackIntervalMs);
            scoresTimer.start(function () {
                scoresCallback(_this.speakerScores);
            });
            this.detectorCallbackToScoresTimer.set(callback, scoresTimer);
        }
        this.realtimeController.realtimeSubscribeToAttendeeIdPresence(handler);
    };
    DefaultActiveSpeakerDetector.prototype.unsubscribe = function (callback) {
        var handler = this.detectorCallbackToHandler.get(callback);
        this.detectorCallbackToHandler.delete(callback);
        this.realtimeController.realtimeUnsubscribeToAttendeeIdPresence(handler);
        var activityTimer = this.detectorCallbackToActivityTimer.get(callback);
        if (activityTimer) {
            activityTimer.stop();
            this.detectorCallbackToActivityTimer.delete(callback);
        }
        var scoresTimer = this.detectorCallbackToScoresTimer.get(callback);
        if (scoresTimer) {
            scoresTimer.stop();
            this.detectorCallbackToHandler.delete(callback);
        }
    };
    return DefaultActiveSpeakerDetector;
}());
exports.default = DefaultActiveSpeakerDetector;
//# sourceMappingURL=DefaultActiveSpeakerDetector.js.map