"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var DefaultVideoStreamIndex_1 = require("./DefaultVideoStreamIndex");
var VideoStreamDescription_1 = require("./VideoStreamDescription");
/**
 * [[SimulcastTransceiverController]] implements [[VideoStreamIndex]] to facilitate video stream
 * subscription and includes query functions for stream id and attendee id.
 */
var SimulcastVideoStreamIndex = /** @class */ (function (_super) {
    __extends(SimulcastVideoStreamIndex, _super);
    function SimulcastVideoStreamIndex(logger) {
        var _this = _super.call(this, logger) || this;
        _this.streamIdToBitrateKbpsMap = new Map();
        _this._localStreamInfos = [];
        _this._lastBitRateMsgTime = Date.now();
        return _this;
    }
    SimulcastVideoStreamIndex.prototype.localStreamDescriptions = function () {
        var clonedDescriptions = [];
        this._localStreamInfos.forEach(function (desc) {
            clonedDescriptions.push(desc.clone());
        });
        return clonedDescriptions;
    };
    SimulcastVideoStreamIndex.prototype.integrateUplinkPolicyDecision = function (encodingParams) {
        // Reuse local streams (that might already have stream IDs allocated) until
        // there are no more and then add as many new local streams as needed
        var hasStreamsToReuse = true;
        var localStreamIndex = 0;
        for (var i = 0; i < encodingParams.length; i++) {
            var targetMaxBitrateKbps = encodingParams[i].maxBitrate / 1000;
            var targetMaxFrameRate = encodingParams[i].maxFramerate;
            if (!hasStreamsToReuse || i === this._localStreamInfos.length) {
                hasStreamsToReuse = false;
                var newInfo = new VideoStreamDescription_1.default();
                newInfo.maxBitrateKbps = targetMaxBitrateKbps;
                newInfo.maxFrameRate = targetMaxFrameRate;
                newInfo.disabledByUplinkPolicy = targetMaxBitrateKbps === 0 ? true : false;
                if (targetMaxBitrateKbps !== 0) {
                    newInfo.timeEnabled = Date.now();
                }
                this._localStreamInfos.push(newInfo);
                localStreamIndex++;
                continue;
            }
            if (this._localStreamInfos[localStreamIndex].maxBitrateKbps === 0 &&
                targetMaxBitrateKbps > 0) {
                this._localStreamInfos[localStreamIndex].timeEnabled = Date.now();
            }
            this._localStreamInfos[localStreamIndex].maxBitrateKbps = targetMaxBitrateKbps;
            this._localStreamInfos[localStreamIndex].maxFrameRate = targetMaxFrameRate;
            this._localStreamInfos[localStreamIndex].disabledByUplinkPolicy =
                targetMaxBitrateKbps === 0 ? true : false;
            if (this._localStreamInfos[localStreamIndex].disabledByUplinkPolicy === true) {
                this._localStreamInfos[localStreamIndex].disabledByWebRTC = false;
            }
            localStreamIndex++;
        }
        if (hasStreamsToReuse) {
            // splice is zero-based, remove stream starting from localStreamIndex
            this._localStreamInfos.splice(localStreamIndex);
        }
    };
    SimulcastVideoStreamIndex.prototype.integrateBitratesFrame = function (bitrateFrame) {
        var e_1, _a, e_2, _b;
        _super.prototype.integrateBitratesFrame.call(this, bitrateFrame);
        var stillSending = new Set();
        var existingSet = new Set(this.streamIdToBitrateKbpsMap.keys());
        try {
            for (var _c = __values(bitrateFrame.bitrates), _d = _c.next(); !_d.done; _d = _c.next()) {
                var bitrateMsg = _d.value;
                stillSending.add(bitrateMsg.sourceStreamId);
                this.streamIdToBitrateKbpsMap.set(bitrateMsg.sourceStreamId, Math.trunc(bitrateMsg.avgBitrateBps / 1000));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var existingSet_1 = __values(existingSet), existingSet_1_1 = existingSet_1.next(); !existingSet_1_1.done; existingSet_1_1 = existingSet_1.next()) {
                var id = existingSet_1_1.value;
                if (!stillSending.has(id)) {
                    var avgBitrateBps = this.streamIdToBitrateKbpsMap.get(id);
                    if (avgBitrateBps === SimulcastVideoStreamIndex.UNSEEN_STREAM_BITRATE) {
                        this.streamIdToBitrateKbpsMap.set(id, SimulcastVideoStreamIndex.RECENTLY_INACTIVE_STREAM_BITRATE);
                    }
                    else {
                        this.streamIdToBitrateKbpsMap.set(id, SimulcastVideoStreamIndex.NOT_SENDING_STREAM_BITRATE);
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (existingSet_1_1 && !existingSet_1_1.done && (_b = existingSet_1.return)) _b.call(existingSet_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        for (var i = 0; i < this._localStreamInfos.length; i++) {
            this._localStreamInfos[i].disabledByWebRTC = false;
            var streamId = this._localStreamInfos[i].streamId;
            if (this._localStreamInfos[i].disabledByUplinkPolicy) {
                continue;
            }
            if (this.streamIdToBitrateKbpsMap.has(streamId)) {
                var avgBitrateKbps = this.streamIdToBitrateKbpsMap.get(streamId);
                if (avgBitrateKbps === SimulcastVideoStreamIndex.NOT_SENDING_STREAM_BITRATE &&
                    this._lastBitRateMsgTime - this._localStreamInfos[i].timeEnabled >
                        SimulcastVideoStreamIndex.BitratesMsgFrequencyMs) {
                    this._localStreamInfos[i].disabledByWebRTC = true;
                }
            }
            else {
                // Do not flag as disabled if it was recently enabled
                if (this._lastBitRateMsgTime - this._localStreamInfos[i].timeEnabled >
                    SimulcastVideoStreamIndex.BitratesMsgFrequencyMs) {
                    this._localStreamInfos[i].disabledByWebRTC = true;
                }
            }
        }
        this._lastBitRateMsgTime = Date.now();
        this.logLocalStreamDescriptions();
    };
    SimulcastVideoStreamIndex.prototype.logLocalStreamDescriptions = function () {
        var e_3, _a;
        var msg = '';
        try {
            for (var _b = __values(this._localStreamInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                var desc = _c.value;
                msg += "streamId=" + desc.streamId + " maxBitrate=" + desc.maxBitrateKbps + " disabledByWebRTC=" + desc.disabledByWebRTC + " disabledByUplink=" + desc.disabledByUplinkPolicy + "\n";
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this.logger.debug(function () {
            return msg;
        });
    };
    SimulcastVideoStreamIndex.prototype.integrateIndexFrame = function (indexFrame) {
        var e_4, _a, e_5, _b;
        _super.prototype.integrateIndexFrame.call(this, indexFrame);
        var newIndexStreamIdSet = new Set();
        var existingSet = new Set(this.streamIdToBitrateKbpsMap.keys());
        try {
            for (var _c = __values(this.currentIndex.sources), _d = _c.next(); !_d.done; _d = _c.next()) {
                var stream = _d.value;
                if (stream.mediaType !== SignalingProtocol_js_1.SdkStreamMediaType.VIDEO) {
                    continue;
                }
                newIndexStreamIdSet.add(stream.streamId);
                if (!this.streamIdToBitrateKbpsMap.has(stream.streamId)) {
                    this.streamIdToBitrateKbpsMap.set(stream.streamId, SimulcastVideoStreamIndex.UNSEEN_STREAM_BITRATE);
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
        try {
            for (var existingSet_2 = __values(existingSet), existingSet_2_1 = existingSet_2.next(); !existingSet_2_1.done; existingSet_2_1 = existingSet_2.next()) {
                var id = existingSet_2_1.value;
                if (!newIndexStreamIdSet.has(id)) {
                    this.streamIdToBitrateKbpsMap.delete(id);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (existingSet_2_1 && !existingSet_2_1.done && (_b = existingSet_2.return)) _b.call(existingSet_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    SimulcastVideoStreamIndex.prototype.integrateSubscribeAckFrame = function (subscribeAck) {
        var e_6, _a;
        _super.prototype.integrateSubscribeAckFrame.call(this, subscribeAck);
        if (!subscribeAck.allocations || subscribeAck.allocations === undefined) {
            return;
        }
        var localStreamStartIndex = 0;
        try {
            for (var _b = __values(subscribeAck.allocations), _c = _b.next(); !_c.done; _c = _b.next()) {
                var allocation = _c.value;
                // track label is what we offered to the server
                if (this._localStreamInfos.length < localStreamStartIndex + 1) {
                    this.logger.info('simulcast: allocation has more than number of local streams');
                    break;
                }
                this._localStreamInfos[localStreamStartIndex].groupId = allocation.groupId;
                this._localStreamInfos[localStreamStartIndex].streamId = allocation.streamId;
                if (!this.streamIdToBitrateKbpsMap.has(allocation.streamId)) {
                    this.streamIdToBitrateKbpsMap.set(allocation.streamId, SimulcastVideoStreamIndex.UNSEEN_STREAM_BITRATE);
                }
                localStreamStartIndex++;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    // First time when the bitrate of a stream id is missing from bitrate message, mark it as UNSEEN
    SimulcastVideoStreamIndex.UNSEEN_STREAM_BITRATE = -2;
    // Second time when the bitrate is missing, mark it as recently inactive
    SimulcastVideoStreamIndex.RECENTLY_INACTIVE_STREAM_BITRATE = -1;
    // Third time when bitrate is missing, mark it as not sending
    SimulcastVideoStreamIndex.NOT_SENDING_STREAM_BITRATE = 0;
    SimulcastVideoStreamIndex.BitratesMsgFrequencyMs = 4000;
    return SimulcastVideoStreamIndex;
}(DefaultVideoStreamIndex_1.default));
exports.default = SimulcastVideoStreamIndex;
//# sourceMappingURL=SimulcastVideoStreamIndex.js.map