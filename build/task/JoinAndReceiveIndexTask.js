"use strict";
// Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var MeetingSessionStatus_1 = require("../meetingsession/MeetingSessionStatus");
var MeetingSessionStatusCode_1 = require("../meetingsession/MeetingSessionStatusCode");
var MeetingSessionTURNCredentials_1 = require("../meetingsession/MeetingSessionTURNCredentials");
var SignalingClientEventType_1 = require("../signalingclient/SignalingClientEventType");
var SignalingClientJoin_1 = require("../signalingclient/SignalingClientJoin");
var SignalingProtocol_js_1 = require("../signalingprotocol/SignalingProtocol.js");
var BaseTask_1 = require("./BaseTask");
/*
 * [[JoinAndReceiveIndexTask]] sends the JoinFrame and asynchronously waits for the server to send the [[SdkIndexFrame]].
 * It should run with the [[TimeoutTask]] as the subtask so it can get canceled after timeout.
 */
var JoinAndReceiveIndexTask = /** @class */ (function (_super) {
    __extends(JoinAndReceiveIndexTask, _super);
    function JoinAndReceiveIndexTask(context) {
        var _this = _super.call(this, context.logger) || this;
        _this.context = context;
        _this.taskName = 'JoinAndReceiveIndexTask';
        _this.taskCanceler = null;
        _this.maxVideos = 25;
        return _this;
    }
    JoinAndReceiveIndexTask.prototype.cancel = function () {
        if (this.taskCanceler) {
            this.taskCanceler.cancel();
            this.taskCanceler = null;
        }
    };
    JoinAndReceiveIndexTask.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var indexFrame;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var context = _this.context;
                            context.turnCredentials = null;
                            var IndexFrameInterceptor = /** @class */ (function () {
                                function IndexFrameInterceptor(signalingClient) {
                                    this.signalingClient = signalingClient;
                                }
                                IndexFrameInterceptor.prototype.cancel = function () {
                                    this.signalingClient.removeObserver(this);
                                    reject(new Error("JoinAndReceiveIndexTask got canceled while waiting for SdkIndexFrame"));
                                };
                                IndexFrameInterceptor.prototype.handleSignalingClientEvent = function (event) {
                                    if (event.type === SignalingClientEventType_1.default.WebSocketClosed) {
                                        context.logger.warn("signaling connection closed by server with code " + event.closeCode + " and reason: " + event.closeReason);
                                        var statusCode = MeetingSessionStatusCode_1.default.SignalingBadRequest;
                                        if (event.closeCode === 4410) {
                                            context.logger.warn("the meeting cannot be joined because it is has been ended");
                                            statusCode = MeetingSessionStatusCode_1.default.MeetingEnded;
                                        }
                                        else if (event.closeCode >= 4500 && event.closeCode < 4600) {
                                            statusCode = MeetingSessionStatusCode_1.default.SignalingInternalServerError;
                                        }
                                        context.audioVideoController.handleMeetingSessionStatus(new MeetingSessionStatus_1.default(statusCode), null);
                                        return;
                                    }
                                    if (event.type !== SignalingClientEventType_1.default.ReceivedSignalFrame) {
                                        return;
                                    }
                                    if (event.message.type === SignalingProtocol_js_1.SdkSignalFrame.Type.JOIN_ACK) {
                                        // @ts-ignore: force cast to SdkJoinAckFrame
                                        var joinAckFrame = event.message.joinack;
                                        if (joinAckFrame && joinAckFrame.turnCredentials) {
                                            context.turnCredentials = new MeetingSessionTURNCredentials_1.default();
                                            context.turnCredentials.username = joinAckFrame.turnCredentials.username;
                                            context.turnCredentials.password = joinAckFrame.turnCredentials.password;
                                            context.turnCredentials.ttl = joinAckFrame.turnCredentials.ttl;
                                            context.turnCredentials.uris = joinAckFrame.turnCredentials.uris
                                                .map(function (uri) {
                                                return context.meetingSessionConfiguration.urls.urlRewriter(uri);
                                            })
                                                .filter(function (uri) {
                                                return !!uri;
                                            });
                                        }
                                        else {
                                            context.logger.error('missing TURN credentials in JoinAckFrame');
                                        }
                                        return;
                                    }
                                    if (event.message.type !== SignalingProtocol_js_1.SdkSignalFrame.Type.INDEX) {
                                        return;
                                    }
                                    this.signalingClient.removeObserver(this);
                                    // @ts-ignore: force cast to SdkIndexFrame
                                    var indexFrame = event.message.index;
                                    resolve(indexFrame);
                                };
                                return IndexFrameInterceptor;
                            }());
                            var interceptor = new IndexFrameInterceptor(_this.context.signalingClient);
                            _this.context.signalingClient.registerObserver(interceptor);
                            _this.taskCanceler = interceptor;
                            _this.context.signalingClient.join(new SignalingClientJoin_1.default(_this.maxVideos, true));
                        })];
                    case 1:
                        indexFrame = _a.sent();
                        this.context.logger.info("received first index " + JSON.stringify(indexFrame));
                        this.context.indexFrame = indexFrame;
                        return [2 /*return*/];
                }
            });
        });
    };
    return JoinAndReceiveIndexTask;
}(BaseTask_1.default));
exports.default = JoinAndReceiveIndexTask;
//# sourceMappingURL=JoinAndReceiveIndexTask.js.map