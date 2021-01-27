"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var SignalingProtocol_js_1 = require("../signalingprotocol/SignalingProtocol.js");
var DefaultVideoStreamIdSet_1 = require("../videostreamidset/DefaultVideoStreamIdSet");
var VideoStreamDescription_1 = require("./VideoStreamDescription");
/**
 * [[DefaultVideoStreamIndex]] implements [[VideoStreamIndex]] to facilitate video stream subscription
 * and includes query functions for stream id and attendee id.
 */
var DefaultVideoStreamIndex = /** @class */ (function () {
    function DefaultVideoStreamIndex(logger) {
        this.logger = logger;
        this.currentIndex = null;
        this.indexForSubscribe = null;
        this.currentSubscribeAck = null;
        // These are based on the index at the time of the last Subscribe Ack
        this.subscribeTrackToStreamMap = null;
        this.subscribeStreamToAttendeeMap = null;
        this.subscribeStreamToExternalUserIdMap = null;
        this.subscribeSsrcToStreamMap = null;
        // These are based on the most up to date index
        this.streamToAttendeeMap = null;
        this.streamToExternalUserIdMap = null;
        this.videoStreamDescription = new VideoStreamDescription_1.default();
        this.videoStreamDescription.trackLabel = 'AmazonChimeExpressVideo';
        this.videoStreamDescription.streamId = 2;
        this.videoStreamDescription.groupId = 2;
    }
    DefaultVideoStreamIndex.prototype.localStreamDescriptions = function () {
        // localStreamDescriptions are used to construct IndexFrame
        // old behavior for single video is to have streamId and groupId trackLabel fixed as the follows
        return [this.videoStreamDescription.clone()];
    };
    DefaultVideoStreamIndex.prototype.remoteStreamDescriptions = function () {
        if (!this.currentIndex || !this.currentIndex.sources) {
            return [];
        }
        var streamInfos = [];
        this.currentIndex.sources.forEach(function (source) {
            var description = new VideoStreamDescription_1.default();
            description.attendeeId = source.attendeeId;
            description.groupId = source.groupId;
            description.streamId = source.streamId;
            description.maxBitrateKbps = source.maxBitrateKbps;
            description.avgBitrateKbps = Math.floor(source.avgBitrateBps / 1000);
            streamInfos.push(description);
        });
        return streamInfos;
    };
    DefaultVideoStreamIndex.prototype.integrateUplinkPolicyDecision = function (param) {
        if (!!param && param.length) {
            var encodingParam = param[0];
            this.videoStreamDescription.maxBitrateKbps = encodingParam.maxBitrate / 1000;
            this.videoStreamDescription.maxFrameRate = encodingParam.maxFramerate;
        }
    };
    DefaultVideoStreamIndex.prototype.integrateIndexFrame = function (indexFrame) {
        this.currentIndex = indexFrame;
        this.streamToAttendeeMap = null;
        this.streamToExternalUserIdMap = null;
    };
    DefaultVideoStreamIndex.prototype.subscribeFrameSent = function () {
        // This is called just as a Subscribe is being sent.  Save corresponding Index
        this.indexForSubscribe = this.currentIndex;
    };
    DefaultVideoStreamIndex.prototype.integrateSubscribeAckFrame = function (subscribeAck) {
        this.currentSubscribeAck = subscribeAck;
        // These are valid until the next Subscribe Ack even if the index is updated
        this.subscribeTrackToStreamMap = this.buildTrackToStreamMap(this.currentSubscribeAck);
        this.subscribeSsrcToStreamMap = this.buildSSRCToStreamMap(this.currentSubscribeAck);
        this.subscribeStreamToAttendeeMap = this.buildStreamToAttendeeMap(this.indexForSubscribe);
        this.subscribeStreamToExternalUserIdMap = this.buildStreamExternalUserIdMap(this.indexForSubscribe);
    };
    DefaultVideoStreamIndex.prototype.integrateBitratesFrame = function (bitrates) {
        var e_1, _a;
        if (this.currentIndex) {
            var _loop_1 = function (bitrate) {
                var source = this_1.currentIndex.sources.find(function (source) { return source.streamId === bitrate.sourceStreamId; });
                if (source !== undefined) {
                    source.avgBitrateBps = bitrate.avgBitrateBps;
                }
            };
            var this_1 = this;
            try {
                for (var _b = __values(bitrates.bitrates), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var bitrate = _c.value;
                    _loop_1(bitrate);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    DefaultVideoStreamIndex.prototype.allStreams = function () {
        var e_2, _a;
        var set = new DefaultVideoStreamIdSet_1.default();
        if (this.currentIndex) {
            try {
                for (var _b = __values(this.currentIndex.sources), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var source = _c.value;
                    set.add(source.streamId);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return set;
    };
    DefaultVideoStreamIndex.prototype.allVideoSendingSourcesExcludingSelf = function (selfAttendeeId) {
        var e_3, _a;
        var videoSources = [];
        var attendeeSet = new Set();
        if (this.currentIndex) {
            if (this.currentIndex.sources && this.currentIndex.sources.length) {
                try {
                    for (var _b = __values(this.currentIndex.sources), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var stream = _c.value;
                        var attendeeId = stream.attendeeId, externalUserId = stream.externalUserId, mediaType = stream.mediaType;
                        if (attendeeId !== selfAttendeeId && mediaType === SignalingProtocol_js_1.SdkStreamMediaType.VIDEO) {
                            if (!attendeeSet.has(attendeeId)) {
                                videoSources.push({ attendee: { attendeeId: attendeeId, externalUserId: externalUserId } });
                                attendeeSet.add(attendeeId);
                            }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        return videoSources;
    };
    DefaultVideoStreamIndex.prototype.streamSelectionUnderBandwidthConstraint = function (selfAttendeeId, largeTileAttendeeIds, smallTileAttendeeIds, bandwidthKbps) {
        var e_4, _a, e_5, _b;
        var newAttendees = new Set();
        if (this.currentIndex) {
            try {
                for (var _c = __values(this.currentIndex.sources), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var stream = _d.value;
                    if (stream.attendeeId === selfAttendeeId || stream.mediaType !== SignalingProtocol_js_1.SdkStreamMediaType.VIDEO) {
                        continue;
                    }
                    if (!largeTileAttendeeIds.has(stream.attendeeId) &&
                        !smallTileAttendeeIds.has(stream.attendeeId)) {
                        newAttendees.add(stream.attendeeId);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        var attendeeToStreamDescriptorMap = this.buildAttendeeToSortedStreamDescriptorMapExcludingSelf(selfAttendeeId);
        var selectionMap = new Map();
        var usage = 0;
        attendeeToStreamDescriptorMap.forEach(function (streams, attendeeId) {
            selectionMap.set(attendeeId, streams[0]);
            usage += streams[0].maxBitrateKbps;
        });
        usage = this.trySelectHighBitrateForAttendees(attendeeToStreamDescriptorMap, largeTileAttendeeIds, usage, bandwidthKbps, selectionMap);
        this.trySelectHighBitrateForAttendees(attendeeToStreamDescriptorMap, newAttendees, usage, bandwidthKbps, selectionMap);
        var streamSelectionSet = new DefaultVideoStreamIdSet_1.default();
        try {
            for (var _e = __values(selectionMap.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                var source = _f.value;
                streamSelectionSet.add(source.streamId);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return streamSelectionSet;
    };
    DefaultVideoStreamIndex.prototype.highestQualityStreamFromEachGroupExcludingSelf = function (selfAttendeeId) {
        var e_6, _a, e_7, _b;
        var set = new DefaultVideoStreamIdSet_1.default();
        if (this.currentIndex) {
            var maxes = new Map();
            try {
                for (var _c = __values(this.currentIndex.sources), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var source = _d.value;
                    if (source.attendeeId === selfAttendeeId || source.mediaType !== SignalingProtocol_js_1.SdkStreamMediaType.VIDEO) {
                        continue;
                    }
                    if (!maxes.has(source.groupId) ||
                        source.maxBitrateKbps > maxes.get(source.groupId).maxBitrateKbps) {
                        maxes.set(source.groupId, source);
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_6) throw e_6.error; }
            }
            try {
                for (var _e = __values(maxes.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var source = _f.value;
                    set.add(source.streamId);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
        return set;
    };
    DefaultVideoStreamIndex.prototype.numberOfVideoPublishingParticipantsExcludingSelf = function (selfAttendeeId) {
        return this.highestQualityStreamFromEachGroupExcludingSelf(selfAttendeeId).array().length;
    };
    DefaultVideoStreamIndex.prototype.numberOfParticipants = function () {
        if (!!this.currentIndex.numParticipants) {
            return this.currentIndex.numParticipants;
        }
        return -1;
    };
    DefaultVideoStreamIndex.prototype.attendeeIdForTrack = function (trackId) {
        var streamId = this.streamIdForTrack(trackId);
        if (streamId === undefined || !this.subscribeStreamToAttendeeMap) {
            this.logger.warn("no attendee found for track " + trackId);
            return '';
        }
        var attendeeId = this.subscribeStreamToAttendeeMap.get(streamId);
        if (!attendeeId) {
            this.logger.info("track " + trackId + " (stream " + streamId + ") does not correspond to a known attendee");
            return '';
        }
        return attendeeId;
    };
    DefaultVideoStreamIndex.prototype.externalUserIdForTrack = function (trackId) {
        var streamId = this.streamIdForTrack(trackId);
        if (streamId === undefined || !this.subscribeStreamToExternalUserIdMap) {
            this.logger.warn("no external user id found for track " + trackId);
            return '';
        }
        var externalUserId = this.subscribeStreamToExternalUserIdMap.get(streamId);
        if (!externalUserId) {
            this.logger.info("track " + trackId + " (stream " + streamId + ") does not correspond to a known externalUserId");
            return '';
        }
        return externalUserId;
    };
    DefaultVideoStreamIndex.prototype.attendeeIdForStreamId = function (streamId) {
        if (!this.streamToAttendeeMap) {
            if (this.currentIndex) {
                this.streamToAttendeeMap = this.buildStreamToAttendeeMap(this.currentIndex);
            }
            else {
                return '';
            }
        }
        var attendeeId = this.streamToAttendeeMap.get(streamId);
        if (!attendeeId) {
            this.logger.info("stream " + streamId + ") does not correspond to a known attendee");
            return '';
        }
        return attendeeId;
    };
    DefaultVideoStreamIndex.prototype.groupIdForStreamId = function (streamId) {
        var e_8, _a, e_9, _b;
        try {
            for (var _c = __values(this.currentIndex.sources), _d = _c.next(); !_d.done; _d = _c.next()) {
                var source = _d.value;
                if (source.streamId === streamId) {
                    return source.groupId;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_8) throw e_8.error; }
        }
        // If wasn't found in current index, then it could be in index used in last subscribe
        if (!!this.indexForSubscribe) {
            try {
                for (var _e = __values(this.indexForSubscribe.sources), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var source = _f.value;
                    if (source.streamId === streamId) {
                        return source.groupId;
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_9) throw e_9.error; }
            }
        }
        return undefined;
    };
    DefaultVideoStreamIndex.prototype.StreamIdsInSameGroup = function (streamId1, streamId2) {
        if (this.groupIdForStreamId(streamId1) === this.groupIdForStreamId(streamId2)) {
            return true;
        }
        return false;
    };
    DefaultVideoStreamIndex.prototype.streamIdForTrack = function (trackId) {
        if (!this.subscribeTrackToStreamMap) {
            return undefined;
        }
        return this.subscribeTrackToStreamMap.get(trackId);
    };
    DefaultVideoStreamIndex.prototype.streamIdForSSRC = function (ssrcId) {
        if (!this.subscribeSsrcToStreamMap) {
            return undefined;
        }
        return this.subscribeSsrcToStreamMap.get(ssrcId);
    };
    DefaultVideoStreamIndex.prototype.streamsPausedAtSource = function () {
        var e_10, _a;
        var paused = new DefaultVideoStreamIdSet_1.default();
        if (this.currentIndex) {
            try {
                for (var _b = __values(this.currentIndex.pausedAtSourceIds), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var streamId = _c.value;
                    paused.add(streamId);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
        }
        return paused;
    };
    DefaultVideoStreamIndex.prototype.buildTrackToStreamMap = function (subscribeAck) {
        var e_11, _a;
        var map = new Map();
        this.logger.debug(function () { return "trackMap " + JSON.stringify(subscribeAck.tracks); });
        try {
            for (var _b = __values(subscribeAck.tracks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var trackMapping = _c.value;
                if (trackMapping.trackLabel.length > 0 && trackMapping.streamId > 0) {
                    map.set(trackMapping.trackLabel, trackMapping.streamId);
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return map;
    };
    DefaultVideoStreamIndex.prototype.buildSSRCToStreamMap = function (subscribeAck) {
        var e_12, _a;
        var map = new Map();
        this.logger.debug(function () { return "ssrcMap " + JSON.stringify(subscribeAck.tracks); });
        try {
            for (var _b = __values(subscribeAck.tracks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var trackMapping = _c.value;
                if (trackMapping.trackLabel.length > 0 && trackMapping.streamId > 0) {
                    map.set(trackMapping.ssrc, trackMapping.streamId);
                }
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_12) throw e_12.error; }
        }
        return map;
    };
    DefaultVideoStreamIndex.prototype.buildStreamToAttendeeMap = function (indexFrame) {
        var e_13, _a;
        var map = new Map();
        if (indexFrame) {
            try {
                for (var _b = __values(indexFrame.sources), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var source = _c.value;
                    map.set(source.streamId, source.attendeeId);
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
        }
        return map;
    };
    DefaultVideoStreamIndex.prototype.buildStreamExternalUserIdMap = function (indexFrame) {
        var e_14, _a;
        var map = new Map();
        if (indexFrame) {
            try {
                for (var _b = __values(indexFrame.sources), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var source = _c.value;
                    if (!!source.externalUserId) {
                        map.set(source.streamId, source.externalUserId);
                    }
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
        }
        return map;
    };
    DefaultVideoStreamIndex.prototype.trySelectHighBitrateForAttendees = function (attendeeToStreamDescriptorMap, highAttendees, currentUsage, bandwidthKbps, currentSelectionRef) {
        var e_15, _a, e_16, _b;
        try {
            for (var highAttendees_1 = __values(highAttendees), highAttendees_1_1 = highAttendees_1.next(); !highAttendees_1_1.done; highAttendees_1_1 = highAttendees_1.next()) {
                var attendeeId = highAttendees_1_1.value;
                if (currentUsage >= bandwidthKbps) {
                    break;
                }
                if (attendeeToStreamDescriptorMap.has(attendeeId)) {
                    var streams = attendeeToStreamDescriptorMap.get(attendeeId);
                    try {
                        for (var _c = (e_16 = void 0, __values(streams.reverse())), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var l = _d.value;
                            if (currentUsage - currentSelectionRef.get(attendeeId).maxBitrateKbps + l.maxBitrateKbps <
                                bandwidthKbps) {
                                currentUsage =
                                    currentUsage - currentSelectionRef.get(attendeeId).maxBitrateKbps + l.maxBitrateKbps;
                                currentSelectionRef.set(attendeeId, l);
                                break;
                            }
                        }
                    }
                    catch (e_16_1) { e_16 = { error: e_16_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_16) throw e_16.error; }
                    }
                }
            }
        }
        catch (e_15_1) { e_15 = { error: e_15_1 }; }
        finally {
            try {
                if (highAttendees_1_1 && !highAttendees_1_1.done && (_a = highAttendees_1.return)) _a.call(highAttendees_1);
            }
            finally { if (e_15) throw e_15.error; }
        }
        return currentUsage;
    };
    DefaultVideoStreamIndex.prototype.buildAttendeeToSortedStreamDescriptorMapExcludingSelf = function (selfAttendeeId) {
        var e_17, _a;
        var attendeeToStreamDescriptorMap = new Map();
        if (this.currentIndex) {
            try {
                for (var _b = __values(this.currentIndex.sources), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var source = _c.value;
                    if (source.attendeeId === selfAttendeeId || source.mediaType !== SignalingProtocol_js_1.SdkStreamMediaType.VIDEO) {
                        continue;
                    }
                    if (attendeeToStreamDescriptorMap.has(source.attendeeId)) {
                        attendeeToStreamDescriptorMap.get(source.attendeeId).push(source);
                    }
                    else {
                        attendeeToStreamDescriptorMap.set(source.attendeeId, [source]);
                    }
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_17) throw e_17.error; }
            }
        }
        attendeeToStreamDescriptorMap.forEach(function (streams, _attendeeId) {
            streams.sort(function (stream1, stream2) {
                if (stream1.maxBitrateKbps > stream2.maxBitrateKbps) {
                    return 1;
                }
                else if (stream1.maxBitrateKbps < stream2.maxBitrateKbps) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
        });
        return attendeeToStreamDescriptorMap;
    };
    return DefaultVideoStreamIndex;
}());
exports.default = DefaultVideoStreamIndex;
//# sourceMappingURL=DefaultVideoStreamIndex.js.map