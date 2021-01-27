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
var DefaultAudioMixController_1 = require("../audiomixcontroller/DefaultAudioMixController");
var DefaultBrowserBehavior_1 = require("../browserbehavior/DefaultBrowserBehavior");
var DefaultDeviceController_1 = require("../devicecontroller/DefaultDeviceController");
var DevicePermission_1 = require("../devicecontroller/DevicePermission");
var TimeoutScheduler_1 = require("../scheduler/TimeoutScheduler");
var BaseTask_1 = require("../task/BaseTask");
var TimeoutTask_1 = require("../task/TimeoutTask");
var CheckAudioConnectivityFeedback_1 = require("./CheckAudioConnectivityFeedback");
var CheckAudioInputFeedback_1 = require("./CheckAudioInputFeedback");
var CheckAudioOutputFeedback_1 = require("./CheckAudioOutputFeedback");
var CheckCameraResolutionFeedback_1 = require("./CheckCameraResolutionFeedback");
var CheckContentShareConnectivityFeedback_1 = require("./CheckContentShareConnectivityFeedback");
var CheckNetworkTCPConnectivityFeedback_1 = require("./CheckNetworkTCPConnectivityFeedback");
var CheckNetworkUDPConnectivityFeedback_1 = require("./CheckNetworkUDPConnectivityFeedback");
var CheckVideoConnectivityFeedback_1 = require("./CheckVideoConnectivityFeedback");
var CheckVideoInputFeedback_1 = require("./CheckVideoInputFeedback");
var MeetingReadinessCheckerConfiguration_1 = require("./MeetingReadinessCheckerConfiguration");
var DefaultMeetingReadinessChecker = /** @class */ (function () {
    function DefaultMeetingReadinessChecker(logger, meetingSession, configuration) {
        if (configuration === void 0) { configuration = new MeetingReadinessCheckerConfiguration_1.default(); }
        this.logger = logger;
        this.meetingSession = meetingSession;
        this.configuration = configuration;
        this.browserBehavior = new DefaultBrowserBehavior_1.default();
    }
    DefaultMeetingReadinessChecker.delay = function (timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) { return new TimeoutScheduler_1.default(timeoutMs).start(resolve); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkAudioInput = function (audioInputDeviceInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.meetingSession.audioVideo.chooseAudioInputDevice(audioInputDeviceInfo)];
                    case 1:
                        result = _a.sent();
                        if (!(result === DevicePermission_1.default.PermissionDeniedByBrowser ||
                            result === DevicePermission_1.default.PermissionDeniedByUser)) return [3 /*break*/, 2];
                        return [2 /*return*/, CheckAudioInputFeedback_1.default.PermissionDenied];
                    case 2: return [4 /*yield*/, this.meetingSession.audioVideo.chooseAudioInputDevice(null)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, CheckAudioInputFeedback_1.default.Succeeded];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Audio input check failed with error " + error_1);
                        return [2 /*return*/, CheckAudioInputFeedback_1.default.Failed];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkAudioOutput = function (audioOutputDeviceInfo, audioOutputVerificationCallback, audioElement) {
        if (audioElement === void 0) { audioElement = null; }
        return __awaiter(this, void 0, void 0, function () {
            var audioOutputDeviceId, userFeedback, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        audioOutputDeviceId = audioOutputDeviceInfo && audioOutputDeviceInfo.deviceId
                            ? audioOutputDeviceInfo.deviceId
                            : '';
                        this.playTone(audioOutputDeviceId, 440, audioElement);
                        return [4 /*yield*/, audioOutputVerificationCallback()];
                    case 1:
                        userFeedback = _a.sent();
                        if (userFeedback) {
                            return [2 /*return*/, CheckAudioOutputFeedback_1.default.Succeeded];
                        }
                        else {
                            return [2 /*return*/, CheckAudioOutputFeedback_1.default.Failed];
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Audio output check failed with error: " + error_2);
                        return [2 /*return*/, CheckAudioOutputFeedback_1.default.Failed];
                    case 3:
                        this.stopTone();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.playTone = function (sinkId, frequency, audioElement) {
        var rampSec = 0.1;
        var maxGainValue = 0.1;
        if (this.oscillatorNode) {
            this.stopTone();
        }
        this.audioContext = DefaultDeviceController_1.default.getAudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0;
        this.oscillatorNode = this.audioContext.createOscillator();
        this.oscillatorNode.frequency.value = frequency;
        this.oscillatorNode.connect(this.gainNode);
        this.destinationStream = this.audioContext.createMediaStreamDestination();
        this.gainNode.connect(this.destinationStream);
        var currentTime = this.audioContext.currentTime;
        var startTime = currentTime + 0.1;
        this.gainNode.gain.linearRampToValueAtTime(0, startTime);
        this.gainNode.gain.linearRampToValueAtTime(maxGainValue, startTime + rampSec);
        this.oscillatorNode.start();
        var audioMixController = new DefaultAudioMixController_1.default();
        // @ts-ignore
        audioMixController.bindAudioDevice({ deviceId: sinkId });
        audioMixController.bindAudioElement(audioElement || new Audio());
        audioMixController.bindAudioStream(this.destinationStream.stream);
    };
    DefaultMeetingReadinessChecker.prototype.stopTone = function () {
        if (!this.audioContext || !this.gainNode || !this.oscillatorNode || !this.destinationStream) {
            return;
        }
        var durationSec = 1;
        var rampSec = 0.1;
        var maxGainValue = 0.1;
        var currentTime = this.audioContext.currentTime;
        this.gainNode.gain.linearRampToValueAtTime(maxGainValue, currentTime + rampSec + durationSec);
        this.gainNode.gain.linearRampToValueAtTime(0, currentTime + rampSec * 2 + durationSec);
        this.oscillatorNode.stop();
        this.oscillatorNode.disconnect(this.gainNode);
        this.gainNode.disconnect(this.destinationStream);
        this.oscillatorNode = null;
        this.gainNode = null;
        this.destinationStream = null;
    };
    DefaultMeetingReadinessChecker.prototype.checkVideoInput = function (videoInputDeviceInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.meetingSession.audioVideo.chooseVideoInputDevice(videoInputDeviceInfo)];
                    case 1:
                        result = _a.sent();
                        if (!(result === DevicePermission_1.default.PermissionDeniedByBrowser ||
                            result === DevicePermission_1.default.PermissionDeniedByUser)) return [3 /*break*/, 2];
                        return [2 /*return*/, CheckVideoInputFeedback_1.default.PermissionDenied];
                    case 2: return [4 /*yield*/, this.meetingSession.audioVideo.chooseVideoInputDevice(null)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, CheckVideoInputFeedback_1.default.Succeeded];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Video check failed with error " + error_3);
                        return [2 /*return*/, CheckVideoInputFeedback_1.default.Failed];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkCameraResolution = function (videoInputDevice, width, height) {
        return __awaiter(this, void 0, void 0, function () {
            var videoConstraint, stream, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        videoConstraint = {
                            video: this.calculateVideoConstraint(videoInputDevice, width, height),
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(videoConstraint)];
                    case 2:
                        stream = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_4 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Camera resolution check with width: " + width + " height " + height + " failed with error " + error_4);
                        if (error_4 && error_4.name === 'OverconstrainedError') {
                            return [2 /*return*/, CheckCameraResolutionFeedback_1.default.ResolutionNotSupported];
                        }
                        if (error_4 && error_4.name === 'NotAllowedError') {
                            return [2 /*return*/, CheckCameraResolutionFeedback_1.default.PermissionDenied];
                        }
                        return [2 /*return*/, CheckCameraResolutionFeedback_1.default.Failed];
                    case 4:
                        if (stream) {
                            stream.getTracks().forEach(function (track) {
                                track.stop();
                            });
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/, CheckCameraResolutionFeedback_1.default.Succeeded];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.calculateVideoConstraint = function (videoInputDevice, width, height) {
        var dimension = this.browserBehavior.requiresResolutionAlignment(width, height);
        var trackConstraints = {};
        if (this.browserBehavior.requiresNoExactMediaStreamConstraints()) {
            trackConstraints.deviceId = videoInputDevice.deviceId;
            trackConstraints.width = width;
            trackConstraints.height = height;
        }
        else {
            trackConstraints.deviceId = { exact: videoInputDevice.deviceId };
            trackConstraints.width = { exact: dimension[0] };
            trackConstraints.height = { exact: dimension[1] };
        }
        return trackConstraints;
    };
    DefaultMeetingReadinessChecker.prototype.checkContentShareConnectivity = function (sourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var isContentShareStarted, isAudioVideoStarted, contentShareObserver, observer, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isContentShareStarted = false;
                        isAudioVideoStarted = false;
                        contentShareObserver = {
                            contentShareDidStart: function () {
                                isContentShareStarted = true;
                            },
                        };
                        observer = {
                            audioVideoDidStart: function () {
                                isAudioVideoStarted = true;
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        this.meetingSession.audioVideo.addObserver(observer);
                        this.meetingSession.audioVideo.start();
                        this.meetingSession.audioVideo.addContentShareObserver(contentShareObserver);
                        return [4 /*yield*/, this.meetingSession.audioVideo.startContentShareFromScreenCapture(sourceId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, isAudioVideoStarted && isContentShareStarted];
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        if (!isAudioVideoStarted) {
                            return [2 /*return*/, CheckContentShareConnectivityFeedback_1.default.ConnectionFailed];
                        }
                        return [4 /*yield*/, this.stopMeeting()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, isContentShareStarted
                                ? CheckContentShareConnectivityFeedback_1.default.Succeeded
                                : CheckContentShareConnectivityFeedback_1.default.TimedOut];
                    case 5:
                        error_5 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Content share check failed with error " + error_5);
                        if (error_5.name === 'NotAllowedError') {
                            return [2 /*return*/, CheckContentShareConnectivityFeedback_1.default.PermissionDenied];
                        }
                        else {
                            return [2 /*return*/, CheckContentShareConnectivityFeedback_1.default.Failed];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        this.meetingSession.audioVideo.removeObserver(observer);
                        this.meetingSession.audioVideo.stopContentShare();
                        this.meetingSession.audioVideo.removeContentShareObserver(contentShareObserver);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkAudioConnectivity = function (audioInputDeviceInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var audioPresence, audioVideo, attendeePresenceHandler, permissionResult, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        audioPresence = false;
                        audioVideo = this.meetingSession.audioVideo;
                        attendeePresenceHandler = function (attendeeId, present, _externalUserId, _dropped) {
                            if (attendeeId === _this.meetingSession.configuration.credentials.attendeeId && present) {
                                audioPresence = true;
                            }
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, audioVideo.chooseAudioInputDevice(audioInputDeviceInfo)];
                    case 2:
                        permissionResult = _a.sent();
                        if (permissionResult === DevicePermission_1.default.PermissionDeniedByBrowser ||
                            permissionResult === DevicePermission_1.default.PermissionDeniedByUser) {
                            return [2 /*return*/, CheckAudioConnectivityFeedback_1.default.AudioInputPermissionDenied];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Failed to get audio input device with error " + error_6);
                        return [2 /*return*/, CheckAudioConnectivityFeedback_1.default.AudioInputRequestFailed];
                    case 4:
                        audioVideo.realtimeSubscribeToAttendeeIdPresence(attendeePresenceHandler);
                        return [4 /*yield*/, this.startMeeting()];
                    case 5:
                        if (!!(_a.sent())) return [3 /*break*/, 7];
                        audioVideo.realtimeUnsubscribeToAttendeeIdPresence(attendeePresenceHandler);
                        return [4 /*yield*/, this.meetingSession.audioVideo.chooseAudioInputDevice(null)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, CheckAudioConnectivityFeedback_1.default.ConnectionFailed];
                    case 7: return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, audioPresence];
                            });
                        }); })];
                    case 8:
                        _a.sent();
                        audioVideo.realtimeUnsubscribeToAttendeeIdPresence(attendeePresenceHandler);
                        return [4 /*yield*/, this.stopMeeting()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.meetingSession.audioVideo.chooseAudioInputDevice(null)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, audioPresence
                                ? CheckAudioConnectivityFeedback_1.default.Succeeded
                                : CheckAudioConnectivityFeedback_1.default.AudioNotReceived];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkVideoConnectivity = function (videoInputDeviceInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var audioVideo, permissionResult, error_7, packetsSent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        audioVideo = this.meetingSession.audioVideo;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, audioVideo.chooseVideoInputDevice(videoInputDeviceInfo)];
                    case 2:
                        permissionResult = _a.sent();
                        if (permissionResult === DevicePermission_1.default.PermissionDeniedByBrowser ||
                            permissionResult === DevicePermission_1.default.PermissionDeniedByUser) {
                            return [2 /*return*/, CheckVideoConnectivityFeedback_1.default.VideoInputPermissionDenied];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        this.logger.error("MeetingReadinessChecker: Failed to get video input device with error " + error_7);
                        return [2 /*return*/, CheckVideoConnectivityFeedback_1.default.VideoInputRequestFailed];
                    case 4: return [4 /*yield*/, this.startMeeting()];
                    case 5:
                        if (!(_a.sent())) {
                            return [2 /*return*/, CheckVideoConnectivityFeedback_1.default.ConnectionFailed];
                        }
                        packetsSent = 0;
                        audioVideo.startLocalVideoTile();
                        return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                                var rawStats;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, audioVideo.getRTCPeerConnectionStats()];
                                        case 1:
                                            rawStats = _a.sent();
                                            if (rawStats) {
                                                rawStats.forEach(function (report) {
                                                    if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                                                        packetsSent = report.packetsSent;
                                                    }
                                                });
                                            }
                                            return [2 /*return*/, packetsSent > 0];
                                    }
                                });
                            }); })];
                    case 6:
                        _a.sent();
                        audioVideo.stopLocalVideoTile();
                        return [4 /*yield*/, this.stopMeeting()];
                    case 7:
                        _a.sent();
                        if (packetsSent <= 0) {
                            return [2 /*return*/, CheckVideoConnectivityFeedback_1.default.VideoNotSent];
                        }
                        return [2 /*return*/, CheckVideoConnectivityFeedback_1.default.Succeeded];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkNetworkUDPConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var audioVideo, candidatePairSucceed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            this.originalURLRewriter = this.meetingSession.configuration.urls.urlRewriter;
                        }
                        catch (error) {
                            this.logger.error("MeetingSessionConfiguration.urls doesn't exist. Error: " + error);
                            return [2 /*return*/, CheckNetworkUDPConnectivityFeedback_1.default.MeetingSessionURLsNotInitialized];
                        }
                        this.meetingSession.configuration.urls.urlRewriter = function (uri) {
                            var transformedUri = _this.originalURLRewriter(uri);
                            if (transformedUri.includes('transport=tcp')) {
                                return '';
                            }
                            return transformedUri;
                        };
                        audioVideo = this.meetingSession.audioVideo;
                        return [4 /*yield*/, this.startMeeting()];
                    case 1:
                        if (!(_a.sent())) {
                            this.meetingSession.configuration.urls.urlRewriter = this.originalURLRewriter;
                            return [2 /*return*/, CheckNetworkUDPConnectivityFeedback_1.default.ConnectionFailed];
                        }
                        candidatePairSucceed = false;
                        return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                                var rawStats;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, audioVideo.getRTCPeerConnectionStats()];
                                        case 1:
                                            rawStats = _a.sent();
                                            if (rawStats) {
                                                rawStats.forEach(function (report) {
                                                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                                                        candidatePairSucceed = true;
                                                    }
                                                });
                                            }
                                            return [2 /*return*/, candidatePairSucceed];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        this.meetingSession.configuration.urls.urlRewriter = this.originalURLRewriter;
                        return [4 /*yield*/, this.stopMeeting()];
                    case 3:
                        _a.sent();
                        if (!candidatePairSucceed) {
                            return [2 /*return*/, CheckNetworkUDPConnectivityFeedback_1.default.ICENegotiationFailed];
                        }
                        return [2 /*return*/, CheckNetworkUDPConnectivityFeedback_1.default.Succeeded];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.checkNetworkTCPConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var audioVideo, candidatePairSucceed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            this.originalURLRewriter = this.meetingSession.configuration.urls.urlRewriter;
                        }
                        catch (error) {
                            this.logger.error("MeetingSessionConfiguration.urls doesn't exist. Error: " + error);
                            return [2 /*return*/, CheckNetworkTCPConnectivityFeedback_1.default.MeetingSessionURLsNotInitialized];
                        }
                        this.meetingSession.configuration.urls.urlRewriter = function (uri) {
                            var transformedUri = _this.originalURLRewriter(uri);
                            if (transformedUri.includes('transport=udp')) {
                                return '';
                            }
                            return transformedUri;
                        };
                        audioVideo = this.meetingSession.audioVideo;
                        return [4 /*yield*/, this.startMeeting()];
                    case 1:
                        if (!(_a.sent())) {
                            this.meetingSession.configuration.urls.urlRewriter = this.originalURLRewriter;
                            return [2 /*return*/, CheckNetworkTCPConnectivityFeedback_1.default.ConnectionFailed];
                        }
                        candidatePairSucceed = false;
                        return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                                var rawStats;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, audioVideo.getRTCPeerConnectionStats()];
                                        case 1:
                                            rawStats = _a.sent();
                                            if (rawStats) {
                                                rawStats.forEach(function (report) {
                                                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                                                        candidatePairSucceed = true;
                                                    }
                                                });
                                            }
                                            return [2 /*return*/, candidatePairSucceed];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        this.meetingSession.configuration.urls.urlRewriter = this.originalURLRewriter;
                        return [4 /*yield*/, this.stopMeeting()];
                    case 3:
                        _a.sent();
                        if (!candidatePairSucceed) {
                            return [2 /*return*/, CheckNetworkTCPConnectivityFeedback_1.default.ICENegotiationFailed];
                        }
                        return [2 /*return*/, CheckNetworkTCPConnectivityFeedback_1.default.Succeeded];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.startMeeting = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isStarted, observer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isStarted = false;
                        observer = {
                            audioVideoDidStart: function () {
                                isStarted = true;
                            },
                        };
                        this.meetingSession.audioVideo.addObserver(observer);
                        this.meetingSession.audioVideo.start();
                        return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, isStarted];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        this.meetingSession.audioVideo.removeObserver(observer);
                        return [2 /*return*/, isStarted];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.stopMeeting = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isStopped, observer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isStopped = false;
                        observer = {
                            audioVideoDidStop: function (_sessionStatus) {
                                isStopped = true;
                            },
                        };
                        this.meetingSession.audioVideo.addObserver(observer);
                        this.meetingSession.audioVideo.stop();
                        return [4 /*yield*/, this.executeTimeoutTask(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, isStopped];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        this.meetingSession.audioVideo.removeObserver(observer);
                        return [2 /*return*/, isStopped];
                }
            });
        });
    };
    DefaultMeetingReadinessChecker.prototype.executeTimeoutTask = function (conditionCheck) {
        return __awaiter(this, void 0, void 0, function () {
            var isSuccess, CheckForConditionTask, timeoutTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isSuccess = false;
                        CheckForConditionTask = /** @class */ (function (_super) {
                            __extends(CheckForConditionTask, _super);
                            function CheckForConditionTask(logger, waitDurationMs) {
                                var _this = _super.call(this, logger) || this;
                                _this.waitDurationMs = waitDurationMs;
                                _this.isCancelled = false;
                                return _this;
                            }
                            CheckForConditionTask.prototype.cancel = function () {
                                this.isCancelled = true;
                            };
                            CheckForConditionTask.prototype.run = function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!!this.isCancelled) return [3 /*break*/, 3];
                                                return [4 /*yield*/, conditionCheck()];
                                            case 1:
                                                if (_a.sent()) {
                                                    isSuccess = true;
                                                    return [3 /*break*/, 3];
                                                }
                                                return [4 /*yield*/, DefaultMeetingReadinessChecker.delay(this.waitDurationMs)];
                                            case 2:
                                                _a.sent();
                                                return [3 /*break*/, 0];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                });
                            };
                            return CheckForConditionTask;
                        }(BaseTask_1.default));
                        timeoutTask = new TimeoutTask_1.default(this.logger, new CheckForConditionTask(this.logger, this.configuration.waitDurationMs), this.configuration.timeoutMs);
                        return [4 /*yield*/, timeoutTask.run()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, isSuccess];
                }
            });
        });
    };
    return DefaultMeetingReadinessChecker;
}());
exports.default = DefaultMeetingReadinessChecker;
//# sourceMappingURL=DefaultMeetingReadinessChecker.js.map