"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultBrowserBehavior_1 = require("../browserbehavior/DefaultBrowserBehavior");
var DefaultAudioMixController = /** @class */ (function () {
    function DefaultAudioMixController() {
        this.audioDevice = null;
        this.audioElement = null;
        this.audioStream = null;
        this.browserBehavior = new DefaultBrowserBehavior_1.default();
    }
    DefaultAudioMixController.prototype.bindAudioElement = function (element) {
        if (element) {
            this.audioElement = element;
            this.audioElement.autoplay = true;
            return this.bindAudioMix();
        }
        return false;
    };
    DefaultAudioMixController.prototype.unbindAudioElement = function () {
        if (this.audioElement) {
            this.audioElement.srcObject = null;
            this.audioElement = null;
        }
    };
    DefaultAudioMixController.prototype.bindAudioStream = function (stream) {
        if (stream) {
            this.audioStream = stream;
            return this.bindAudioMix();
        }
        return false;
    };
    DefaultAudioMixController.prototype.bindAudioDevice = function (device) {
        if (device) {
            this.audioDevice = device;
            return this.bindAudioMix();
        }
        return false;
    };
    DefaultAudioMixController.prototype.bindAudioMix = function () {
        var _this = this;
        if (this.audioElement) {
            if (this.audioStream) {
                this.audioElement.srcObject = this.audioStream;
            }
            // @ts-ignore
            if (typeof this.audioElement.sinkId !== 'undefined') {
                var newSinkId = this.audioDevice ? this.audioDevice.deviceId : '';
                // @ts-ignore
                var oldSinkId = this.audioElement.sinkId;
                if (newSinkId !== oldSinkId) {
                    if (this.browserBehavior.hasChromiumWebRTC()) {
                        var existingAudioElement_1 = this.audioElement;
                        var existingstream_1 = this.audioStream;
                        existingAudioElement_1.srcObject = null;
                        // @ts-ignore
                        existingAudioElement_1.setSinkId(newSinkId).then(function () {
                            if (_this.audioElement === existingAudioElement_1) {
                                existingAudioElement_1.srcObject = existingstream_1;
                            }
                        });
                    }
                    else {
                        // @ts-ignore
                        this.audioElement.setSinkId(newSinkId);
                    }
                }
                return true;
            }
        }
        return false;
    };
    return DefaultAudioMixController;
}());
exports.default = DefaultAudioMixController;
//# sourceMappingURL=DefaultAudioMixController.js.map