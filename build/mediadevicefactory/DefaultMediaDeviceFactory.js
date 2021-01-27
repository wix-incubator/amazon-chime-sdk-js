"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var MediaDeviceProxyHandler_1 = require("./MediaDeviceProxyHandler");
var DefaultMediaDeviceFactory = /** @class */ (function () {
    function DefaultMediaDeviceFactory() {
        this.isMediaDevicesSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices;
    }
    DefaultMediaDeviceFactory.prototype.create = function () {
        if (!this.isMediaDevicesSupported) {
            throw new Error("navigator.mediaDevices is not supported");
        }
        else {
            return new Proxy(navigator.mediaDevices, new MediaDeviceProxyHandler_1.default());
        }
    };
    return DefaultMediaDeviceFactory;
}());
exports.default = DefaultMediaDeviceFactory;
//# sourceMappingURL=DefaultMediaDeviceFactory.js.map