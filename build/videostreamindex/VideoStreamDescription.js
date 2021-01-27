"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var SignalingProtocol_js_1 = require("../signalingprotocol/SignalingProtocol.js");
var VideoStreamDescription = /** @class */ (function () {
    function VideoStreamDescription(attendeeId, groupId, streamId, maxBitrateKbps, avgBitrateKbps) {
        this.attendeeId = '';
        this.groupId = 0;
        this.streamId = 0;
        this.ssrc = 0;
        this.trackLabel = '';
        this.maxBitrateKbps = 0;
        // average bitrate is updated every 2 seconds via bitrates messages
        this.avgBitrateKbps = 0;
        this.maxFrameRate = 0;
        this.timeEnabled = 0;
        this.disabledByWebRTC = false;
        this.disabledByUplinkPolicy = false;
        this.attendeeId = attendeeId;
        this.groupId = groupId;
        this.streamId = streamId;
        this.maxBitrateKbps = maxBitrateKbps;
        this.avgBitrateKbps = avgBitrateKbps;
    }
    VideoStreamDescription.prototype.clone = function () {
        var newInfo = new VideoStreamDescription();
        newInfo.attendeeId = this.attendeeId;
        newInfo.groupId = this.groupId;
        newInfo.streamId = this.streamId;
        newInfo.ssrc = this.ssrc;
        newInfo.trackLabel = this.trackLabel;
        newInfo.maxBitrateKbps = this.maxBitrateKbps;
        newInfo.avgBitrateKbps = this.avgBitrateKbps;
        newInfo.maxFrameRate = this.maxFrameRate;
        newInfo.timeEnabled = this.timeEnabled;
        newInfo.disabledByWebRTC = this.disabledByWebRTC;
        newInfo.disabledByUplinkPolicy = this.disabledByUplinkPolicy;
        return newInfo;
    };
    VideoStreamDescription.prototype.toStreamDescriptor = function () {
        var descriptor = SignalingProtocol_js_1.SdkStreamDescriptor.create();
        descriptor.mediaType = SignalingProtocol_js_1.SdkStreamMediaType.VIDEO;
        descriptor.trackLabel = this.trackLabel;
        descriptor.attendeeId = this.attendeeId;
        descriptor.streamId = this.streamId;
        descriptor.groupId = this.groupId;
        descriptor.framerate = this.maxFrameRate;
        descriptor.maxBitrateKbps =
            this.disabledByUplinkPolicy || this.disabledByWebRTC ? 0 : this.maxBitrateKbps;
        descriptor.avgBitrateBps = this.avgBitrateKbps;
        return descriptor;
    };
    return VideoStreamDescription;
}());
exports.default = VideoStreamDescription;
//# sourceMappingURL=VideoStreamDescription.js.map