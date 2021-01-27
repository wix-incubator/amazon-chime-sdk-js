"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var Maybe_1 = require("../maybe/Maybe");
var AsyncScheduler_1 = require("../scheduler/AsyncScheduler");
var SimulcastLayers_1 = require("../simulcastlayers/SimulcastLayers");
var SimulcastTransceiverController_1 = require("../transceivercontroller/SimulcastTransceiverController");
var DefaultVideoCaptureAndEncodeParameter_1 = require("../videocaptureandencodeparameter/DefaultVideoCaptureAndEncodeParameter");
var BitrateParameters_1 = require("./BitrateParameters");
/**
 * [[DefaultSimulcastUplinkPolicy]] determines capture and encode
 *  parameters that reacts to estimated uplink bandwidth
 */
var DefaultSimulcastUplinkPolicy = /** @class */ (function () {
    function DefaultSimulcastUplinkPolicy(selfAttendeeId, logger) {
        this.selfAttendeeId = selfAttendeeId;
        this.logger = logger;
        this.numSenders = 0;
        this.numParticipants = -1;
        this.newQualityMap = new Map();
        this.currentQualityMap = new Map();
        this.newActiveStreams = 1 /* kHiAndLow */;
        this.currentActiveStreams = 1 /* kHiAndLow */;
        this.lastUplinkBandwidthKbps = DefaultSimulcastUplinkPolicy.defaultUplinkBandwidthKbps;
        this.startTimeMs = 0;
        this.lastUpdatedMs = Date.now();
        this.videoIndex = null;
        this.currLocalDescriptions = [];
        this.nextLocalDescriptions = [];
        this.observerQueue = new Set();
        this.optimalParameters = new DefaultVideoCaptureAndEncodeParameter_1.default(0, 0, 0, 0, true);
        this.parametersInEffect = new DefaultVideoCaptureAndEncodeParameter_1.default(0, 0, 0, 0, true);
        this.lastUplinkBandwidthKbps = DefaultSimulcastUplinkPolicy.defaultUplinkBandwidthKbps;
        this.currentQualityMap = this.fillEncodingParamWithBitrates([300, 0, 1200]);
        this.newQualityMap = this.fillEncodingParamWithBitrates([300, 0, 1200]);
    }
    DefaultSimulcastUplinkPolicy.prototype.updateConnectionMetric = function (_b) {
        var _this = this;
        var _c = _b.uplinkKbps, uplinkKbps = _c === void 0 ? 0 : _c;
        if (isNaN(uplinkKbps)) {
            return;
        }
        // Check if startup period in order to ignore estimate when video first enabled.
        // If only audio was active then the estimate will be very low
        if (this.startTimeMs === 0) {
            this.startTimeMs = Date.now();
        }
        if (Date.now() - this.startTimeMs < DefaultSimulcastUplinkPolicy.startupDurationMs) {
            this.lastUplinkBandwidthKbps = DefaultSimulcastUplinkPolicy.defaultUplinkBandwidthKbps;
        }
        else {
            this.lastUplinkBandwidthKbps = uplinkKbps;
        }
        this.logger.debug(function () {
            return "simulcast: uplink policy update metrics " + _this.lastUplinkBandwidthKbps;
        });
        var holdTime = DefaultSimulcastUplinkPolicy.holdDownDurationMs;
        if (this.currentActiveStreams === 3 /* kLow */) {
            holdTime = DefaultSimulcastUplinkPolicy.holdDownDurationMs * 2;
        }
        else if ((this.currentActiveStreams === 2 /* kMidAndLow */ &&
            uplinkKbps <= DefaultSimulcastUplinkPolicy.kMidDisabledRate) ||
            (this.currentActiveStreams === 1 /* kHiAndLow */ &&
                uplinkKbps <= DefaultSimulcastUplinkPolicy.kHiDisabledRate)) {
            holdTime = DefaultSimulcastUplinkPolicy.holdDownDurationMs / 2;
        }
        if (Date.now() < this.lastUpdatedMs + holdTime) {
            return;
        }
        this.newQualityMap = this.calculateEncodingParameters(false);
    };
    DefaultSimulcastUplinkPolicy.prototype.calculateEncodingParameters = function (numSendersChanged) {
        // bitrates parameter min is not used for now
        var newBitrates = [
            new BitrateParameters_1.default(),
            new BitrateParameters_1.default(),
            new BitrateParameters_1.default(),
        ];
        var hysteresisIncrease = 0, hysteresisDecrease = 0;
        if (this.currentActiveStreams === 0 /* kHi */) {
            // Don't trigger redetermination based on rate if only one simulcast stream
            hysteresisIncrease = this.lastUplinkBandwidthKbps + 1;
            hysteresisDecrease = 0;
        }
        else if (this.currentActiveStreams === 1 /* kHiAndLow */) {
            hysteresisIncrease = 2400;
            hysteresisDecrease = DefaultSimulcastUplinkPolicy.kHiDisabledRate;
        }
        else if (this.currentActiveStreams === 2 /* kMidAndLow */) {
            hysteresisIncrease = 1000;
            hysteresisDecrease = DefaultSimulcastUplinkPolicy.kMidDisabledRate;
        }
        else {
            hysteresisIncrease = 300;
            hysteresisDecrease = 0;
        }
        if (numSendersChanged ||
            this.lastUplinkBandwidthKbps >= hysteresisIncrease ||
            this.lastUplinkBandwidthKbps <= hysteresisDecrease) {
            if (this.numParticipants >= 0 && this.numParticipants <= 2) {
                // Simulcast disabled
                this.newActiveStreams = 0 /* kHi */;
                newBitrates[0].maxBitrateKbps = 0;
                newBitrates[1].maxBitrateKbps = 0;
                newBitrates[2].maxBitrateKbps = 1200;
            }
            else if (this.numSenders <= 4 &&
                this.lastUplinkBandwidthKbps >= DefaultSimulcastUplinkPolicy.kHiDisabledRate) {
                // 320x192+ (640x384)  + 1280x768
                this.newActiveStreams = 1 /* kHiAndLow */;
                newBitrates[0].maxBitrateKbps = 300;
                newBitrates[1].maxBitrateKbps = 0;
                newBitrates[2].maxBitrateKbps = 1200;
            }
            else if (this.lastUplinkBandwidthKbps >= DefaultSimulcastUplinkPolicy.kMidDisabledRate) {
                // 320x192 + 640x384 + (1280x768)
                this.newActiveStreams = 2 /* kMidAndLow */;
                newBitrates[0].maxBitrateKbps = this.lastUplinkBandwidthKbps >= 350 ? 200 : 150;
                newBitrates[1].maxBitrateKbps = this.numSenders <= 6 ? 600 : 350;
                newBitrates[2].maxBitrateKbps = 0;
            }
            else {
                // 320x192 + 640x384 + (1280x768)
                this.newActiveStreams = 3 /* kLow */;
                newBitrates[0].maxBitrateKbps = 300;
                newBitrates[1].maxBitrateKbps = 0;
                newBitrates[2].maxBitrateKbps = 0;
            }
            var bitrates = newBitrates.map(function (v, _i, _a) {
                return v.maxBitrateKbps;
            });
            this.newQualityMap = this.fillEncodingParamWithBitrates(bitrates);
            if (!this.encodingParametersEqual()) {
                this.logger.info("simulcast: policy:calculateEncodingParameters bw:" + this.lastUplinkBandwidthKbps + " numSources:" + this.numSenders + " numClients:" + this.numParticipants + " newQualityMap: " + this.getQualityMapString(this.newQualityMap));
            }
        }
        return this.newQualityMap;
    };
    DefaultSimulcastUplinkPolicy.prototype.chooseMediaTrackConstraints = function () {
        // Changing MediaTrackConstraints causes a restart of video input and possible small
        // scaling changes.  Always use 720p for now
        var trackConstraint = {
            width: { ideal: 1280 },
            height: { ideal: 768 },
            frameRate: { ideal: 15 },
        };
        return trackConstraint;
    };
    DefaultSimulcastUplinkPolicy.prototype.chooseEncodingParameters = function () {
        this.currentQualityMap = this.newQualityMap;
        this.currentActiveStreams = this.newActiveStreams;
        if (this.activeStreamsToPublish !== this.newActiveStreams) {
            this.activeStreamsToPublish = this.newActiveStreams;
            this.publishEncodingSimulcastLayer();
        }
        return this.currentQualityMap;
    };
    DefaultSimulcastUplinkPolicy.prototype.updateIndex = function (videoIndex) {
        // the +1 for self is assuming that we intend to send video, since
        // the context here is VideoUplinkBandwidthPolicy
        var numSenders = videoIndex.numberOfVideoPublishingParticipantsExcludingSelf(this.selfAttendeeId) + 1;
        var numParticipants = videoIndex.numberOfParticipants();
        var numSendersChanged = numSenders !== this.numSenders;
        var numParticipantsChanged = (numParticipants > 2 && this.numParticipants <= 2) ||
            (numParticipants <= 2 && this.numParticipants > 2);
        this.numSenders = numSenders;
        this.numParticipants = numParticipants;
        this.optimalParameters = new DefaultVideoCaptureAndEncodeParameter_1.default(this.captureWidth(), this.captureHeight(), this.captureFrameRate(), this.maxBandwidthKbps(), false);
        this.videoIndex = videoIndex;
        this.newQualityMap = this.calculateEncodingParameters(numSendersChanged || numParticipantsChanged);
    };
    DefaultSimulcastUplinkPolicy.prototype.wantsResubscribe = function () {
        var constraintDiff = !this.encodingParametersEqual();
        this.nextLocalDescriptions = this.videoIndex.localStreamDescriptions();
        var _loop_1 = function (i) {
            var streamId = this_1.nextLocalDescriptions[i].streamId;
            if (streamId !== 0 && !!streamId) {
                var prevIndex = this_1.currLocalDescriptions.findIndex(function (val) {
                    return val.streamId === streamId;
                });
                if (prevIndex !== -1) {
                    if (this_1.nextLocalDescriptions[i].disabledByWebRTC !==
                        this_1.currLocalDescriptions[prevIndex].disabledByWebRTC) {
                        constraintDiff = true;
                    }
                }
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.nextLocalDescriptions.length; i++) {
            _loop_1(i);
        }
        if (constraintDiff) {
            this.lastUpdatedMs = Date.now();
        }
        this.currLocalDescriptions = this.nextLocalDescriptions;
        return constraintDiff;
    };
    DefaultSimulcastUplinkPolicy.prototype.compareEncodingParameter = function (encoding1, encoding2) {
        return JSON.stringify(encoding1) === JSON.stringify(encoding2);
    };
    DefaultSimulcastUplinkPolicy.prototype.encodingParametersEqual = function () {
        var e_1, _b;
        var different = false;
        try {
            for (var _c = __values(SimulcastTransceiverController_1.default.NAME_ARR_ASCENDING), _d = _c.next(); !_d.done; _d = _c.next()) {
                var ridName = _d.value;
                different =
                    different ||
                        !this.compareEncodingParameter(this.newQualityMap.get(ridName), this.currentQualityMap.get(ridName));
                if (different) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return !different;
    };
    DefaultSimulcastUplinkPolicy.prototype.chooseCaptureAndEncodeParameters = function () {
        // should deprecate in this policy
        this.parametersInEffect = this.optimalParameters.clone();
        return this.parametersInEffect.clone();
    };
    DefaultSimulcastUplinkPolicy.prototype.captureWidth = function () {
        // should deprecate in this policy
        var width = 1280;
        return width;
    };
    DefaultSimulcastUplinkPolicy.prototype.captureHeight = function () {
        // should deprecate in this policy
        var height = 768;
        return height;
    };
    DefaultSimulcastUplinkPolicy.prototype.captureFrameRate = function () {
        // should deprecate in this policy
        return 15;
    };
    DefaultSimulcastUplinkPolicy.prototype.maxBandwidthKbps = function () {
        // should deprecate in this policy
        return 1400;
    };
    DefaultSimulcastUplinkPolicy.prototype.setIdealMaxBandwidthKbps = function (_idealMaxBandwidthKbps) {
        // should deprecate in this policy
    };
    DefaultSimulcastUplinkPolicy.prototype.setHasBandwidthPriority = function (_hasBandwidthPriority) {
        // should deprecate in this policy
    };
    DefaultSimulcastUplinkPolicy.prototype.fillEncodingParamWithBitrates = function (bitratesKbps) {
        var newMap = new Map();
        var toBps = 1000;
        var nameArr = SimulcastTransceiverController_1.default.NAME_ARR_ASCENDING;
        var bitrateArr = bitratesKbps;
        var scale = 4;
        for (var i = 0; i < nameArr.length; i++) {
            var ridName = nameArr[i];
            newMap.set(ridName, {
                rid: ridName,
                active: bitrateArr[i] > 0 ? true : false,
                scaleResolutionDownBy: scale,
                maxBitrate: bitrateArr[i] * toBps,
            });
            scale = scale / 2;
        }
        return newMap;
    };
    DefaultSimulcastUplinkPolicy.prototype.getQualityMapString = function (params) {
        var qualityString = '';
        var localDescriptions = this.videoIndex.localStreamDescriptions();
        if (localDescriptions.length === 3) {
            params.forEach(function (value) {
                var disabledByWebRTC = false;
                if (value.rid === 'low')
                    disabledByWebRTC = localDescriptions[0].disabledByWebRTC;
                else if (value.rid === 'mid')
                    disabledByWebRTC = localDescriptions[1].disabledByWebRTC;
                else
                    disabledByWebRTC = localDescriptions[2].disabledByWebRTC;
                qualityString += "{ rid: " + value.rid + " active:" + value.active + " disabledByWebRTC: " + disabledByWebRTC + " maxBitrate:" + value.maxBitrate + "}";
            });
        }
        return qualityString;
    };
    DefaultSimulcastUplinkPolicy.prototype.getEncodingSimulcastLayer = function (activeStreams) {
        switch (activeStreams) {
            case 0 /* kHi */:
                return SimulcastLayers_1.default.High;
            case 1 /* kHiAndLow */:
                return SimulcastLayers_1.default.LowAndHigh;
            case 2 /* kMidAndLow */:
                return SimulcastLayers_1.default.LowAndMedium;
            case 3 /* kLow */:
                return SimulcastLayers_1.default.Low;
        }
    };
    DefaultSimulcastUplinkPolicy.prototype.publishEncodingSimulcastLayer = function () {
        var simulcastLayers = this.getEncodingSimulcastLayer(this.activeStreamsToPublish);
        this.forEachObserver(function (observer) {
            Maybe_1.default.of(observer.encodingSimulcastLayersDidChange).map(function (f) {
                return f.bind(observer)(simulcastLayers);
            });
        });
    };
    DefaultSimulcastUplinkPolicy.prototype.addObserver = function (observer) {
        this.logger.info('adding simulcast uplink observer');
        this.observerQueue.add(observer);
    };
    DefaultSimulcastUplinkPolicy.prototype.removeObserver = function (observer) {
        this.logger.info('removing simulcast uplink observer');
        this.observerQueue.delete(observer);
    };
    DefaultSimulcastUplinkPolicy.prototype.forEachObserver = function (observerFunc) {
        var e_2, _b;
        var _this = this;
        var _loop_2 = function (observer) {
            new AsyncScheduler_1.default().start(function () {
                if (_this.observerQueue.has(observer)) {
                    observerFunc(observer);
                }
            });
        };
        try {
            for (var _c = __values(this.observerQueue), _d = _c.next(); !_d.done; _d = _c.next()) {
                var observer = _d.value;
                _loop_2(observer);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    DefaultSimulcastUplinkPolicy.defaultUplinkBandwidthKbps = 1200;
    DefaultSimulcastUplinkPolicy.startupDurationMs = 6000;
    DefaultSimulcastUplinkPolicy.holdDownDurationMs = 4000;
    DefaultSimulcastUplinkPolicy.defaultMaxFrameRate = 15;
    // Current rough estimates where webrtc disables streams
    DefaultSimulcastUplinkPolicy.kHiDisabledRate = 700;
    DefaultSimulcastUplinkPolicy.kMidDisabledRate = 240;
    return DefaultSimulcastUplinkPolicy;
}());
exports.default = DefaultSimulcastUplinkPolicy;
//# sourceMappingURL=DefaultSimulcastUplinkPolicy.js.map