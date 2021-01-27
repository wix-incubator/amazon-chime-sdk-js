"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var DeviceSelection = /** @class */ (function () {
    function DeviceSelection() {
        this.groupId = '';
    }
    DeviceSelection.prototype.matchesConstraints = function (constraints) {
        return JSON.stringify(this.constraints) === JSON.stringify(constraints);
    };
    return DeviceSelection;
}());
exports.default = DeviceSelection;
//# sourceMappingURL=DeviceSelection.js.map