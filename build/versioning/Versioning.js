"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultBrowserBehavior_1 = require("../browserbehavior/DefaultBrowserBehavior");
var version_1 = require("./version");
var Versioning = /** @class */ (function () {
    function Versioning() {
    }
    Object.defineProperty(Versioning, "sdkName", {
        /**
         * Return string representation of SDK name
         */
        get: function () {
            return 'amazon-chime-sdk-js';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Versioning, "sdkVersion", {
        /**
         * Return string representation of SDK version
         */
        get: function () {
            return version_1.default.semverString;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Versioning, "buildSHA", {
        /**
         * Return the SHA-1 of the Git commit from which this build was created.
         */
        get: function () {
            // Skip the leading 'g'.
            return version_1.default.hash.substr(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Versioning, "sdkUserAgentLowResolution", {
        /**
         * Return low-resolution string representation of SDK user agent (e.g. `chrome-78`)
         */
        get: function () {
            var browserBehavior = new DefaultBrowserBehavior_1.default();
            return browserBehavior.name() + "-" + browserBehavior.majorVersion();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Return URL with versioning information appended
     */
    Versioning.urlWithVersion = function (url) {
        var urlWithVersion = new URL(url);
        urlWithVersion.searchParams.append(Versioning.X_AMZN_VERSION, Versioning.sdkVersion);
        urlWithVersion.searchParams.append(Versioning.X_AMZN_USER_AGENT, Versioning.sdkUserAgentLowResolution);
        return urlWithVersion.toString();
    };
    Versioning.X_AMZN_VERSION = 'X-Amzn-Version';
    Versioning.X_AMZN_USER_AGENT = 'X-Amzn-User-Agent';
    return Versioning;
}());
exports.default = Versioning;
//# sourceMappingURL=Versioning.js.map