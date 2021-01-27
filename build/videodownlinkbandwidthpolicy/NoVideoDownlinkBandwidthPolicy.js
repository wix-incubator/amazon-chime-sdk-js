"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultVideoStreamIdSet_1 = require("../videostreamidset/DefaultVideoStreamIdSet");
var NoVideoDownlinkBandwidthPolicy = /** @class */ (function () {
    function NoVideoDownlinkBandwidthPolicy() {
    }
    NoVideoDownlinkBandwidthPolicy.prototype.reset = function () { };
    NoVideoDownlinkBandwidthPolicy.prototype.updateIndex = function (_videoIndex) { };
    NoVideoDownlinkBandwidthPolicy.prototype.updateMetrics = function (_clientMetricReport) { };
    NoVideoDownlinkBandwidthPolicy.prototype.wantsResubscribe = function () {
        return false;
    };
    NoVideoDownlinkBandwidthPolicy.prototype.chooseSubscriptions = function () {
        return new DefaultVideoStreamIdSet_1.default();
    };
    return NoVideoDownlinkBandwidthPolicy;
}());
exports.default = NoVideoDownlinkBandwidthPolicy;
//# sourceMappingURL=NoVideoDownlinkBandwidthPolicy.js.map