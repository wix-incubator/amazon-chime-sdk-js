"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * [[SignalingClientConnectionRequest]] represents an connection request.
 */
var SignalingClientConnectionRequest = /** @class */ (function () {
    /** Creates a request with the given URL, conference id, and join token.
     *
     * @param {string} signalingURL The URL of the signaling proxy.
     * @param {string} joinToken The join token that will authenticate the connection.
     */
    function SignalingClientConnectionRequest(signalingURL, joinToken) {
        this.signalingURL = signalingURL;
        this.joinToken = joinToken;
    }
    /** Gets the signaling URL representing this request.*/
    SignalingClientConnectionRequest.prototype.url = function () {
        return (this.signalingURL + '?X-Chime-Control-Protocol-Version=3&X-Amzn-Chime-Send-Close-On-Error=1');
    };
    /** Gets the protocols associated with this request.*/
    SignalingClientConnectionRequest.prototype.protocols = function () {
        return ['_aws_wt_session', this.joinToken];
    };
    return SignalingClientConnectionRequest;
}());
exports.default = SignalingClientConnectionRequest;
//# sourceMappingURL=SignalingClientConnectionRequest.js.map