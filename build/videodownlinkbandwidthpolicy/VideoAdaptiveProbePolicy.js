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
var ClientMetricReportDirection_1 = require("../clientmetricreport/ClientMetricReportDirection");
var ContentShareConstants_1 = require("../contentsharecontroller/ContentShareConstants");
var DefaultVideoStreamIdSet_1 = require("../videostreamidset/DefaultVideoStreamIdSet");
var LinkMediaStats = /** @class */ (function () {
    function LinkMediaStats() {
        this.bandwidthEstimateKbps = 0;
        this.usedBandwidthKbps = 0;
        this.packetsLost = 0;
        this.nackCount = 0;
        this.rttMs = 0;
    }
    return LinkMediaStats;
}());
var VideoAdaptiveProbePolicy = /** @class */ (function () {
    function VideoAdaptiveProbePolicy(logger, tileController) {
        this.logger = logger;
        this.tileController = tileController;
        this.reset();
    }
    VideoAdaptiveProbePolicy.prototype.reset = function () {
        this.optimalReceiveSet = new DefaultVideoStreamIdSet_1.default();
        this.subscribedReceiveSet = new DefaultVideoStreamIdSet_1.default();
        this.logCount = 0;
        this.startupPeriod = true;
        this.usingPrevTargetRate = false;
        this.rateProbeState = "Not Probing" /* kNotProbing */;
        this.timeFirstEstimate = 0;
        this.lastUpgradeRateKbps = 0;
        this.timeBeforeAllowSubscribeMs = VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_SUBSCRIBE;
        this.timeLastProbe = Date.now();
        this.timeBeforeAllowProbeMs = VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_PROBE;
        this.downlinkStats = new LinkMediaStats();
        this.prevDownlinkStats = new LinkMediaStats();
    };
    VideoAdaptiveProbePolicy.prototype.updateIndex = function (videoIndex) {
        this.videoIndex = videoIndex;
    };
    VideoAdaptiveProbePolicy.prototype.updateMetrics = function (clientMetricReport) {
        if (this.videoIndex.allStreams().empty()) {
            return;
        }
        this.prevDownlinkStats = this.downlinkStats;
        this.downlinkStats = new LinkMediaStats();
        var metricReport = clientMetricReport.getObservableMetrics();
        this.downlinkStats.bandwidthEstimateKbps = metricReport.availableReceiveBandwidth / 1000;
        for (var ssrcStr in clientMetricReport.streamMetricReports) {
            var ssrc = Number(ssrcStr);
            if (clientMetricReport.streamMetricReports[ssrc].direction === ClientMetricReportDirection_1.default.DOWNSTREAM) {
                // Only use video stream metrics
                if (clientMetricReport.streamMetricReports[ssrc].currentMetrics.hasOwnProperty('googNacksSent') &&
                    clientMetricReport.streamMetricReports[ssrc].currentMetrics.hasOwnProperty('googFrameRateReceived')) {
                    this.downlinkStats.nackCount += clientMetricReport.countPerSecond('googNacksSent', ssrc);
                }
                if (clientMetricReport.streamMetricReports[ssrc].currentMetrics.hasOwnProperty('packetsLost') &&
                    clientMetricReport.streamMetricReports[ssrc].currentMetrics.hasOwnProperty('googFrameRateReceived')) {
                    this.downlinkStats.packetsLost += clientMetricReport.countPerSecond('packetsLost', ssrc);
                }
                if (clientMetricReport.streamMetricReports[ssrc].currentMetrics.hasOwnProperty('bytesReceived')) {
                    this.downlinkStats.usedBandwidthKbps +=
                        clientMetricReport.bitsPerSecond('bytesReceived', ssrc) / 1000;
                }
            }
        }
    };
    VideoAdaptiveProbePolicy.prototype.wantsResubscribe = function () {
        this.optimalReceiveSet = this.calculateOptimalReceiveSet();
        return !this.subscribedReceiveSet.equal(this.optimalReceiveSet);
    };
    VideoAdaptiveProbePolicy.prototype.chooseSubscriptions = function () {
        if (!this.subscribedReceiveSet.equal(this.optimalReceiveSet)) {
            this.timeLastSubscribe = Date.now();
        }
        this.subscribedReceiveSet = this.optimalReceiveSet.clone();
        this.logger.info('bwe: chooseSubscriptions ' + JSON.stringify(this.subscribedReceiveSet));
        return this.subscribedReceiveSet.clone();
    };
    VideoAdaptiveProbePolicy.prototype.calculateOptimalReceiveSet = function () {
        var e_1, _a, e_2, _b, e_3, _c;
        var streamSelectionSet = new DefaultVideoStreamIdSet_1.default();
        var lastProbeState = this.rateProbeState;
        var remoteInfos = this.videoIndex.remoteStreamDescriptions();
        if (remoteInfos.length === 0) {
            return streamSelectionSet;
        }
        var pausedStreamIds = new DefaultVideoStreamIdSet_1.default();
        this.handlePausedStreams(streamSelectionSet, pausedStreamIds, remoteInfos);
        var sameStreamChoices = this.availStreamsSameAsLast(remoteInfos);
        // If no major changes then don't allow subscribes for the allowed amount of time
        if (!this.startupPeriod &&
            sameStreamChoices &&
            Date.now() - this.timeLastSubscribe < this.timeBeforeAllowSubscribeMs) {
            return this.optimalReceiveSet;
        }
        // reset time before allow subscribe to default
        this.timeBeforeAllowSubscribeMs = VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_SUBSCRIBE;
        var chosenStreams = [];
        // Sort streams by bitrate asceending.
        remoteInfos.sort(function (a, b) {
            if (a.maxBitrateKbps === b.maxBitrateKbps) {
                return a.streamId - b.streamId;
            }
            return a.maxBitrateKbps - b.maxBitrateKbps;
        });
        try {
            // Convert 0 avg bitrates to max and handle special cases
            for (var remoteInfos_1 = __values(remoteInfos), remoteInfos_1_1 = remoteInfos_1.next(); !remoteInfos_1_1.done; remoteInfos_1_1 = remoteInfos_1.next()) {
                var info = remoteInfos_1_1.value;
                if (info.avgBitrateKbps === 0 || info.avgBitrateKbps > info.maxBitrateKbps) {
                    // Content can be a special case
                    if (info.attendeeId.endsWith(ContentShareConstants_1.default.Modality) && info.maxBitrateKbps < 100) {
                        info.maxBitrateKbps = info.avgBitrateKbps;
                    }
                    else {
                        info.avgBitrateKbps = info.maxBitrateKbps;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (remoteInfos_1_1 && !remoteInfos_1_1.done && (_a = remoteInfos_1.return)) _a.call(remoteInfos_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var targetDownlinkBitrate = this.determineTargetRate(remoteInfos);
        var deltaToNextUpgrade = 0;
        var chosenTotalBitrate = 0;
        var upgradeStream;
        // If screen share is available, then subscribe to that first before anything else
        chosenTotalBitrate += this.chooseContent(chosenStreams, remoteInfos);
        var _loop_1 = function (info) {
            if (info.avgBitrateKbps === 0) {
                return "continue";
            }
            if (chosenStreams.findIndex(function (stream) { return stream.groupId === info.groupId; }) === -1) {
                if (chosenTotalBitrate + info.avgBitrateKbps <= targetDownlinkBitrate) {
                    chosenStreams.push(info);
                    chosenTotalBitrate += info.avgBitrateKbps;
                }
                else if (deltaToNextUpgrade === 0) {
                    // Keep track of step to next upgrade
                    deltaToNextUpgrade = info.avgBitrateKbps;
                    upgradeStream = info;
                }
            }
        };
        try {
            // Try to have at least one stream from every group first
            // Since the streams are sorted this will pick the lowest bitrates first
            for (var remoteInfos_2 = __values(remoteInfos), remoteInfos_2_1 = remoteInfos_2.next(); !remoteInfos_2_1.done; remoteInfos_2_1 = remoteInfos_2.next()) {
                var info = remoteInfos_2_1.value;
                _loop_1(info);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (remoteInfos_2_1 && !remoteInfos_2_1.done && (_b = remoteInfos_2.return)) _b.call(remoteInfos_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Look for upgrades until we run out of bandwidth
        var lookForUpgrades = true;
        while (lookForUpgrades) {
            // We will set this to true if we find any new upgrades during the loop over the
            // chosen streams (i.e. when we do a full loop without an upgrade we will give up)
            lookForUpgrades = false;
            chosenStreams.forEach(function (chosenStream, index) {
                var e_4, _a;
                try {
                    for (var remoteInfos_3 = (e_4 = void 0, __values(remoteInfos)), remoteInfos_3_1 = remoteInfos_3.next(); !remoteInfos_3_1.done; remoteInfos_3_1 = remoteInfos_3.next()) {
                        var info = remoteInfos_3_1.value;
                        if (info.groupId === chosenStream.groupId &&
                            info.streamId !== chosenStream.streamId &&
                            info.avgBitrateKbps > chosenStream.avgBitrateKbps) {
                            var increaseKbps = info.avgBitrateKbps - chosenStream.avgBitrateKbps;
                            if (chosenTotalBitrate + increaseKbps <= targetDownlinkBitrate) {
                                chosenTotalBitrate += increaseKbps;
                                chosenStreams[index] = info;
                                lookForUpgrades = true;
                            }
                            else if (deltaToNextUpgrade === 0) {
                                // Keep track of step to next upgrade
                                deltaToNextUpgrade = increaseKbps;
                                upgradeStream = info;
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (remoteInfos_3_1 && !remoteInfos_3_1.done && (_a = remoteInfos_3.return)) _a.call(remoteInfos_3);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            });
        }
        var subscriptionChoice = 0 /* kNewOptimal */;
        // Look for probing or override opportunities
        if (!this.startupPeriod && sameStreamChoices && deltaToNextUpgrade !== 0) {
            if (this.rateProbeState === "Probing" /* kProbing */) {
                subscriptionChoice = this.handleProbe(chosenStreams, pausedStreamIds, targetDownlinkBitrate, remoteInfos);
            }
            else {
                subscriptionChoice = this.maybeOverrideOrProbe(chosenStreams, pausedStreamIds, targetDownlinkBitrate, chosenTotalBitrate, deltaToNextUpgrade, upgradeStream);
            }
        }
        else {
            // If there was a change in streams to choose from, then cancel any probing or upgrades
            this.setProbeState("Not Probing" /* kNotProbing */);
            this.lastUpgradeRateKbps = 0;
        }
        var decisionLogStr = this.policyStateLogStr(remoteInfos, targetDownlinkBitrate);
        if (this.logCount % 15 === 0 || this.rateProbeState !== lastProbeState) {
            this.logger.info(decisionLogStr);
            this.logCount = 0;
            decisionLogStr = '';
        }
        this.logCount++;
        this.prevTargetRateKbps = targetDownlinkBitrate;
        this.prevRemoteInfos = remoteInfos;
        if (subscriptionChoice === 1 /* kPreviousOptimal */) {
            this.logger.info('bwe: keepSameSubscriptions');
            if (decisionLogStr.length > 0) {
                this.logger.info(decisionLogStr);
            }
            return this.optimalReceiveSet;
        }
        else if (subscriptionChoice === 2 /* kPreProbe */) {
            var subscribedRate = this.calculateSubscribeRate(remoteInfos, this.preProbeReceiveSet);
            this.logger.info('bwe: Use Pre-Probe subscription subscribedRate:' + subscribedRate);
            return this.preProbeReceiveSet;
        }
        try {
            for (var chosenStreams_1 = __values(chosenStreams), chosenStreams_1_1 = chosenStreams_1.next(); !chosenStreams_1_1.done; chosenStreams_1_1 = chosenStreams_1.next()) {
                var chosenStream = chosenStreams_1_1.value;
                streamSelectionSet.add(chosenStream.streamId);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (chosenStreams_1_1 && !chosenStreams_1_1.done && (_c = chosenStreams_1.return)) _c.call(chosenStreams_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (!this.optimalReceiveSet.equal(streamSelectionSet)) {
            if (decisionLogStr.length > 0) {
                this.logger.info(decisionLogStr);
            }
            var subscribedRate = this.calculateSubscribeRate(remoteInfos, streamSelectionSet);
            this.logger.info("bwe: new streamSelection: " + JSON.stringify(streamSelectionSet) + " subscribedRate:" + subscribedRate);
        }
        return streamSelectionSet;
    };
    VideoAdaptiveProbePolicy.prototype.determineTargetRate = function (remoteInfos) {
        var e_5, _a;
        var _this = this;
        var targetBitrate = 0;
        // Estimated downlink bandwidth from WebRTC is dependent on actually receiving data, so if it ever got driven below the bitrate of the lowest
        // stream (a simulcast stream), and it stops receiving, it will get stuck never being able to resubscribe (as is implemented).
        var minTargetDownlinkBitrate = Number.MAX_VALUE;
        try {
            for (var remoteInfos_4 = __values(remoteInfos), remoteInfos_4_1 = remoteInfos_4.next(); !remoteInfos_4_1.done; remoteInfos_4_1 = remoteInfos_4.next()) {
                var info = remoteInfos_4_1.value;
                if (info.avgBitrateKbps !== 0 && info.avgBitrateKbps < minTargetDownlinkBitrate) {
                    minTargetDownlinkBitrate = info.avgBitrateKbps;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (remoteInfos_4_1 && !remoteInfos_4_1.done && (_a = remoteInfos_4.return)) _a.call(remoteInfos_4);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var now = Date.now();
        // Startup phase handling.  During this period the estimate can be 0 or
        // could still be slowly hunting for a steady state.  This startup ramp up
        // can cause a series of subscribes which can be distracting. During this
        // time just use our configured default value
        if (this.downlinkStats.bandwidthEstimateKbps !== 0) {
            if (this.timeFirstEstimate === 0) {
                this.timeFirstEstimate = now;
            }
            // handle startup state where estimator is still converging.
            if (this.startupPeriod) {
                // Drop out of startup period if
                // - estimate is above default
                // - get packet loss and have a valid estimate
                // - startup period has expired and rate is not still increasing
                if (this.downlinkStats.bandwidthEstimateKbps >
                    VideoAdaptiveProbePolicy.DEFAULT_BANDWIDTH_KBPS ||
                    this.downlinkStats.packetsLost > 0 ||
                    (now - this.timeFirstEstimate > VideoAdaptiveProbePolicy.STARTUP_PERIOD_MS &&
                        this.downlinkStats.bandwidthEstimateKbps <=
                            this.prevDownlinkStats.bandwidthEstimateKbps)) {
                    this.startupPeriod = false;
                    this.prevTargetRateKbps = this.downlinkStats.bandwidthEstimateKbps;
                }
            }
            // If we are in the startup period and we haven't detected any packet loss, then
            // keep it at the default to let the estimation get to a steady state
            if (this.startupPeriod) {
                targetBitrate = VideoAdaptiveProbePolicy.DEFAULT_BANDWIDTH_KBPS;
            }
            else {
                targetBitrate = this.downlinkStats.bandwidthEstimateKbps;
            }
        }
        else {
            if (this.timeFirstEstimate === 0) {
                targetBitrate = VideoAdaptiveProbePolicy.DEFAULT_BANDWIDTH_KBPS;
            }
            else {
                targetBitrate = this.prevTargetRateKbps;
            }
        }
        targetBitrate = Math.max(minTargetDownlinkBitrate, targetBitrate);
        // Estimated downlink rate can follow actual bandwidth or fall for a short period of time
        // due to the absolute send time estimator incorrectly thinking that a delay in packets is
        // a precursor to packet loss.  We have seen too many false positives on this, so we
        // will ignore largish drops in the estimate if there is no packet loss
        if (!this.startupPeriod &&
            ((this.usingPrevTargetRate &&
                this.downlinkStats.bandwidthEstimateKbps < this.prevTargetRateKbps) ||
                this.downlinkStats.bandwidthEstimateKbps <
                    (this.prevTargetRateKbps *
                        (100 - VideoAdaptiveProbePolicy.LARGE_RATE_CHANGE_TRIGGER_PERCENT)) /
                        100 ||
                this.downlinkStats.bandwidthEstimateKbps <
                    (this.downlinkStats.usedBandwidthKbps *
                        VideoAdaptiveProbePolicy.LARGE_RATE_CHANGE_TRIGGER_PERCENT) /
                        100) &&
            this.downlinkStats.packetsLost === 0) {
            // Set target to be the same as last
            this.logger.debug(function () {
                return 'bwe: ValidateRate: Using Previous rate ' + _this.prevTargetRateKbps;
            });
            this.usingPrevTargetRate = true;
            targetBitrate = this.prevTargetRateKbps;
        }
        else {
            this.usingPrevTargetRate = false;
        }
        return targetBitrate;
    };
    VideoAdaptiveProbePolicy.prototype.setProbeState = function (newState) {
        if (this.rateProbeState === newState)
            return;
        var now = Date.now();
        switch (newState) {
            case "Not Probing" /* kNotProbing */:
                this.timeProbePendingStart = 0;
                break;
            case "Probe Pending" /* kProbePending */:
                if (this.timeLastProbe === 0 ||
                    now - this.timeLastProbe > VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_PROBE) {
                    this.timeProbePendingStart = now;
                }
                else {
                    // Too soon to do a probe again
                    return false;
                }
                break;
            case "Probing" /* kProbing */:
                if (now - this.timeProbePendingStart > this.timeBeforeAllowProbeMs) {
                    this.timeLastProbe = now;
                    this.preProbeReceiveSet = this.subscribedReceiveSet;
                    // Increase the time allowed until the next probe
                    this.timeBeforeAllowProbeMs = Math.min(this.timeBeforeAllowProbeMs * 2, VideoAdaptiveProbePolicy.MAX_HOLD_MS_BEFORE_PROBE);
                }
                else {
                    // Too soon to do probe
                    return false;
                }
                break;
            default:
                break;
        }
        this.logger.info('bwe: setProbeState to ' + newState + ' from ' + this.rateProbeState);
        this.rateProbeState = newState;
        return true;
    };
    // Upgrade the stream id from the appropriate group or add it if it wasn't already in the list.
    // Return the added amount of bandwidth
    VideoAdaptiveProbePolicy.prototype.upgradeToStream = function (chosenStreams, upgradeStream) {
        for (var i = 0; i < chosenStreams.length; i++) {
            if (chosenStreams[i].groupId === upgradeStream.groupId) {
                var diffRate = upgradeStream.avgBitrateKbps - chosenStreams[i].avgBitrateKbps;
                this.logger.info('bwe: upgradeStream from ' +
                    JSON.stringify(chosenStreams[i]) +
                    ' to ' +
                    JSON.stringify(upgradeStream));
                this.lastUpgradeRateKbps = diffRate;
                chosenStreams[i] = upgradeStream;
                return diffRate;
            }
        }
        // We are adding a stream and not upgrading.
        chosenStreams.push(upgradeStream);
        this.lastUpgradeRateKbps = upgradeStream.avgBitrateKbps;
        return this.lastUpgradeRateKbps;
    };
    // Do specific behavior while we are currently in probing state and metrics
    // indicate environment is still valid to do probing.
    // Return true if the caller should not change from the previous subscriptions.
    VideoAdaptiveProbePolicy.prototype.handleProbe = function (chosenStreams, pausedStreamIds, targetDownlinkBitrate, remoteInfos) {
        var e_6, _a;
        if (this.rateProbeState !== "Probing" /* kProbing */) {
            return 0 /* kNewOptimal */;
        }
        // Don't allow probe to happen indefinitely
        if (Date.now() - this.timeLastProbe > VideoAdaptiveProbePolicy.MAX_ALLOWED_PROBE_TIME_MS) {
            this.logger.info("bwe: Canceling probe due to timeout");
            this.setProbeState("Not Probing" /* kNotProbing */);
            return 0 /* kNewOptimal */;
        }
        if (this.downlinkStats.packetsLost > 0) {
            this.setProbeState("Not Probing" /* kNotProbing */);
            this.timeBeforeAllowSubscribeMs = VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_SUBSCRIBE * 3;
            return 2 /* kPreProbe */;
        }
        var subscribedRate = this.calculateSubscribeRate(remoteInfos, this.optimalReceiveSet);
        if (this.chosenStreamsSameAsLast(chosenStreams, pausedStreamIds) ||
            targetDownlinkBitrate > subscribedRate) {
            var avgRate = 0;
            try {
                for (var chosenStreams_2 = __values(chosenStreams), chosenStreams_2_1 = chosenStreams_2.next(); !chosenStreams_2_1.done; chosenStreams_2_1 = chosenStreams_2.next()) {
                    var chosenStream = chosenStreams_2_1.value;
                    avgRate += chosenStream.avgBitrateKbps;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (chosenStreams_2_1 && !chosenStreams_2_1.done && (_a = chosenStreams_2.return)) _a.call(chosenStreams_2);
                }
                finally { if (e_6) throw e_6.error; }
            }
            if (targetDownlinkBitrate > avgRate) {
                // If target bitrate can sustain probe rate, then probe was successful.
                this.setProbeState("Not Probing" /* kNotProbing */);
                // Reset the time allowed between probes since this was successful
                this.timeBeforeAllowProbeMs = VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_PROBE;
                return 0 /* kNewOptimal */;
            }
        }
        return 1 /* kPreviousOptimal */;
    };
    VideoAdaptiveProbePolicy.prototype.maybeOverrideOrProbe = function (chosenStreams, pausedStreamIds, chosenTotalBitrate, targetDownlinkBitrate, deltaToNextUpgrade, upgradeStream) {
        var sameSubscriptions = this.chosenStreamsSameAsLast(chosenStreams, pausedStreamIds);
        var useLastSubscriptions = 0 /* kNewOptimal */;
        var now = Date.now();
        // We want to minimize thrashing between between low res and high res of different
        // participants due to avg bitrate fluctuations. If there hasn't been much of a change in estimated bandwidth
        // and the number of streams and their max rates are the same, then reuse the previous subscription
        var triggerPercent = targetDownlinkBitrate > VideoAdaptiveProbePolicy.LOW_BITRATE_THRESHOLD_KBPS
            ? VideoAdaptiveProbePolicy.TARGET_RATE_CHANGE_TRIGGER_PERCENT
            : VideoAdaptiveProbePolicy.TARGET_RATE_CHANGE_TRIGGER_PERCENT * 2;
        var minTargetBitrateDelta = (targetDownlinkBitrate * triggerPercent) / 100;
        if (!sameSubscriptions &&
            Math.abs(targetDownlinkBitrate - this.prevTargetRateKbps) < minTargetBitrateDelta) {
            this.logger.info('bwe: MaybeOverrideOrProbe: Reuse last decision based on delta rate. {' +
                JSON.stringify(this.subscribedReceiveSet) +
                "}");
            useLastSubscriptions = 1 /* kPreviousOptimal */;
        }
        // If there has been packet loss, then reset to no probing state
        if (this.downlinkStats.packetsLost > this.prevDownlinkStats.packetsLost) {
            this.setProbeState("Not Probing" /* kNotProbing */);
            this.lastUpgradeRateKbps = 0;
            return useLastSubscriptions;
        }
        if (sameSubscriptions || useLastSubscriptions) {
            // If planned subscriptions are same as last, then either move to probe pending state
            // or move to probing state if enough time has passed.
            switch (this.rateProbeState) {
                case "Not Probing" /* kNotProbing */:
                    this.setProbeState("Probe Pending" /* kProbePending */);
                    break;
                case "Probe Pending" /* kProbePending */:
                    if (now - this.timeProbePendingStart > this.timeBeforeAllowProbeMs) {
                        if (this.setProbeState("Probing" /* kProbing */)) {
                            this.timeBeforeAllowSubscribeMs = 800;
                            this.upgradeToStream(chosenStreams, upgradeStream);
                            useLastSubscriptions = 0 /* kNewOptimal */;
                        }
                    }
                    break;
                default:
                    this.logger.info('bwe: MaybeOverrideOrProbe: Unhandled condition ' + this.rateProbeState);
                    break;
            }
        }
        else {
            // At this point the current expectation is to subscribe for a new set of
            // streams, and environment is not right for probing.  If target rate is within
            // the threshold of doing an upgrade, then do it and if we are lucky will be the
            // same set of streams as last and no new subscription will be done.
            this.setProbeState("Not Probing" /* kNotProbing */);
            if (targetDownlinkBitrate + minTargetBitrateDelta > chosenTotalBitrate + deltaToNextUpgrade) {
                this.logger.info('bwe: MaybeOverrideOrProbe: Upgrade since we are within threshold');
                this.upgradeToStream(chosenStreams, upgradeStream);
            }
        }
        return useLastSubscriptions;
    };
    // Utility function to find max rate of streams in current decision
    VideoAdaptiveProbePolicy.prototype.calculateSubscribeRate = function (streams, streamSet) {
        var e_7, _a;
        var subscribeRate = 0;
        var _loop_2 = function (index) {
            var streamMatch = streams.find(function (stream) { return stream.streamId === index; });
            if (streamMatch !== undefined) {
                subscribeRate += streamMatch.maxBitrateKbps;
            }
        };
        try {
            for (var _b = __values(streamSet.array()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var index = _c.value;
                _loop_2(index);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return subscribeRate;
    };
    VideoAdaptiveProbePolicy.prototype.handlePausedStreams = function (streamSelectionSet, pausedStreamIds, remoteInfos) {
        var remoteTiles = this.tileController.getAllRemoteVideoTiles();
        for (var i = 0; i < remoteTiles.length; i++) {
            var tile = remoteTiles[i];
            var state = tile.state();
            if (state.paused) {
                var j = remoteInfos.length;
                while (j--) {
                    if (remoteInfos[j].attendeeId === state.boundAttendeeId) {
                        this.logger.info('bwe: removed paused attendee ' +
                            state.boundAttendeeId +
                            ' streamId: ' +
                            remoteInfos[j].streamId);
                        pausedStreamIds.add(remoteInfos[j].streamId);
                        // Add the stream to the selection set to keep the tile around
                        if (this.subscribedReceiveSet.contain(remoteInfos[j].streamId)) {
                            streamSelectionSet.add(remoteInfos[j].streamId);
                        }
                        remoteInfos.splice(j, 1);
                    }
                }
            }
        }
    };
    VideoAdaptiveProbePolicy.prototype.chooseContent = function (chosenStreams, remoteInfos) {
        var e_8, _a;
        var contentRate = 0;
        try {
            for (var remoteInfos_5 = __values(remoteInfos), remoteInfos_5_1 = remoteInfos_5.next(); !remoteInfos_5_1.done; remoteInfos_5_1 = remoteInfos_5.next()) {
                var info = remoteInfos_5_1.value;
                // For now always subscribe to content even if higher bandwidth then target
                if (info.attendeeId.endsWith(ContentShareConstants_1.default.Modality)) {
                    chosenStreams.push(info);
                    contentRate += info.avgBitrateKbps;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (remoteInfos_5_1 && !remoteInfos_5_1.done && (_a = remoteInfos_5.return)) _a.call(remoteInfos_5);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return contentRate;
    };
    VideoAdaptiveProbePolicy.prototype.availStreamsSameAsLast = function (remoteInfos) {
        var e_9, _a;
        if (this.prevRemoteInfos === undefined || remoteInfos.length !== this.prevRemoteInfos.length) {
            return false;
        }
        var _loop_3 = function (info) {
            var infoMatch = this_1.prevRemoteInfos.find(function (prevInfo) {
                return prevInfo.groupId === info.groupId &&
                    prevInfo.streamId === info.streamId &&
                    prevInfo.maxBitrateKbps === info.maxBitrateKbps;
            });
            if (infoMatch === undefined) {
                return { value: false };
            }
        };
        var this_1 = this;
        try {
            for (var remoteInfos_6 = __values(remoteInfos), remoteInfos_6_1 = remoteInfos_6.next(); !remoteInfos_6_1.done; remoteInfos_6_1 = remoteInfos_6.next()) {
                var info = remoteInfos_6_1.value;
                var state_1 = _loop_3(info);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (remoteInfos_6_1 && !remoteInfos_6_1.done && (_a = remoteInfos_6.return)) _a.call(remoteInfos_6);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return true;
    };
    VideoAdaptiveProbePolicy.prototype.chosenStreamsSameAsLast = function (chosenStreams, pausedStreamIds) {
        var e_10, _a;
        var lastStreams = this.optimalReceiveSet.array();
        var _loop_4 = function (id) {
            if (!pausedStreamIds.contain(id) &&
                chosenStreams.findIndex(function (chosenStream) { return chosenStream.streamId === id; }) === -1) {
                return { value: false };
            }
        };
        try {
            for (var lastStreams_1 = __values(lastStreams), lastStreams_1_1 = lastStreams_1.next(); !lastStreams_1_1.done; lastStreams_1_1 = lastStreams_1.next()) {
                var id = lastStreams_1_1.value;
                var state_2 = _loop_4(id);
                if (typeof state_2 === "object")
                    return state_2.value;
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (lastStreams_1_1 && !lastStreams_1_1.done && (_a = lastStreams_1.return)) _a.call(lastStreams_1);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return true;
    };
    VideoAdaptiveProbePolicy.prototype.policyStateLogStr = function (remoteInfos, targetDownlinkBitrate) {
        var e_11, _a;
        var subscribedRate = this.calculateSubscribeRate(remoteInfos, this.optimalReceiveSet);
        var optimalReceiveSet = {
            targetBitrate: targetDownlinkBitrate,
            subscribedRate: subscribedRate,
            probeState: this.rateProbeState,
            startupPeriod: this.startupPeriod,
        };
        // Reduced remote info logging:
        var remoteInfoStr = "remoteInfos: [";
        try {
            for (var remoteInfos_7 = __values(remoteInfos), remoteInfos_7_1 = remoteInfos_7.next(); !remoteInfos_7_1.done; remoteInfos_7_1 = remoteInfos_7.next()) {
                var info = remoteInfos_7_1.value;
                remoteInfoStr += "{grpId:" + info.groupId + " strId:" + info.streamId + " maxBr:" + info.maxBitrateKbps + " avgBr:" + info.avgBitrateKbps + "}, ";
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (remoteInfos_7_1 && !remoteInfos_7_1.done && (_a = remoteInfos_7.return)) _a.call(remoteInfos_7);
            }
            finally { if (e_11) throw e_11.error; }
        }
        remoteInfoStr += "]";
        var logString = "bwe: optimalReceiveSet " + JSON.stringify(optimalReceiveSet) + "\n" +
            ("bwe:   prev " + JSON.stringify(this.prevDownlinkStats) + "\n") +
            ("bwe:   now  " + JSON.stringify(this.downlinkStats) + "\n") +
            ("bwe:   " + remoteInfoStr);
        return logString;
    };
    VideoAdaptiveProbePolicy.DEFAULT_BANDWIDTH_KBPS = 2800;
    VideoAdaptiveProbePolicy.STARTUP_PERIOD_MS = 6000;
    VideoAdaptiveProbePolicy.LARGE_RATE_CHANGE_TRIGGER_PERCENT = 20;
    VideoAdaptiveProbePolicy.TARGET_RATE_CHANGE_TRIGGER_PERCENT = 15;
    VideoAdaptiveProbePolicy.LOW_BITRATE_THRESHOLD_KBPS = 300;
    VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_PROBE = 5000;
    VideoAdaptiveProbePolicy.MIN_TIME_BETWEEN_SUBSCRIBE = 2000;
    VideoAdaptiveProbePolicy.MAX_HOLD_MS_BEFORE_PROBE = 60000;
    VideoAdaptiveProbePolicy.MAX_ALLOWED_PROBE_TIME_MS = 60000;
    return VideoAdaptiveProbePolicy;
}());
exports.default = VideoAdaptiveProbePolicy;
//# sourceMappingURL=VideoAdaptiveProbePolicy.js.map