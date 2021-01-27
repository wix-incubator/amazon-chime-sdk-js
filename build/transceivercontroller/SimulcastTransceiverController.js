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
var DefaultTransceiverController_1 = require("./DefaultTransceiverController");
var SimulcastTransceiverController = /** @class */ (function (_super) {
    __extends(SimulcastTransceiverController, _super);
    function SimulcastTransceiverController(logger, browserBehavior) {
        var _this = _super.call(this, logger, browserBehavior) || this;
        _this.videoQualityControlParameterMap = new Map();
        var scale = 4;
        for (var i = 0; i < SimulcastTransceiverController.NAME_ARR_ASCENDING.length; i++) {
            var ridName = SimulcastTransceiverController.NAME_ARR_ASCENDING[i];
            _this.videoQualityControlParameterMap.set(ridName, {
                rid: ridName,
                scaleResolutionDownBy: scale,
                maxBitrate: SimulcastTransceiverController.BITRATE_ARR_ASCENDING[i] * 1000,
            });
            scale = scale / 2;
        }
        return _this;
    }
    SimulcastTransceiverController.prototype.setEncodingParameters = function (encodingParamMap) {
        return __awaiter(this, void 0, void 0, function () {
            var sender, newEncodingParams, oldParam, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._localCameraTransceiver || this._localCameraTransceiver.direction !== 'sendrecv') {
                            return [2 /*return*/];
                        }
                        sender = this._localCameraTransceiver.sender;
                        newEncodingParams = Array.from(encodingParamMap.values());
                        if (newEncodingParams.length <= 0) {
                            return [2 /*return*/];
                        }
                        oldParam = sender.getParameters();
                        if (!oldParam.encodings) {
                            oldParam.encodings = newEncodingParams;
                        }
                        else {
                            for (i = 0; i < oldParam.encodings.length; i++) {
                                if (oldParam.encodings[i].rid === SimulcastTransceiverController.LOW_LEVEL_NAME) {
                                    oldParam.encodings[i].maxBitrate = encodingParamMap.get(SimulcastTransceiverController.LOW_LEVEL_NAME).maxBitrate;
                                    oldParam.encodings[i].active = encodingParamMap.get(SimulcastTransceiverController.LOW_LEVEL_NAME).active;
                                }
                                if (oldParam.encodings[i].rid === SimulcastTransceiverController.MID_LEVEL_NAME) {
                                    oldParam.encodings[i].maxBitrate = encodingParamMap.get(SimulcastTransceiverController.MID_LEVEL_NAME).maxBitrate;
                                    oldParam.encodings[i].active = encodingParamMap.get(SimulcastTransceiverController.MID_LEVEL_NAME).active;
                                }
                                if (oldParam.encodings[i].rid === SimulcastTransceiverController.HIGH_LEVEL_NAME) {
                                    oldParam.encodings[i].maxBitrate = encodingParamMap.get(SimulcastTransceiverController.HIGH_LEVEL_NAME).maxBitrate;
                                    oldParam.encodings[i].active = encodingParamMap.get(SimulcastTransceiverController.HIGH_LEVEL_NAME).active;
                                }
                            }
                        }
                        return [4 /*yield*/, sender.setParameters(oldParam)];
                    case 1:
                        _a.sent();
                        this.logVideoTransceiverParameters();
                        return [2 /*return*/];
                }
            });
        });
    };
    SimulcastTransceiverController.replaceAudioTrackForSender = function (sender, track) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!sender) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, sender.replaceTrack(track)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    SimulcastTransceiverController.prototype.setVideoSendingBitrateKbps = function (_bitrateKbps) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SimulcastTransceiverController.prototype.setupLocalTransceivers = function () {
        if (!this.useTransceivers()) {
            return;
        }
        if (!this.defaultMediaStream && typeof MediaStream !== 'undefined') {
            this.defaultMediaStream = new MediaStream();
        }
        if (!this._localAudioTransceiver) {
            this._localAudioTransceiver = this.peer.addTransceiver('audio', {
                direction: 'inactive',
                streams: [this.defaultMediaStream],
            });
        }
        if (!this._localCameraTransceiver) {
            var encodingParams = Array.from(this.videoQualityControlParameterMap.values());
            this._localCameraTransceiver = this.peer.addTransceiver('video', {
                direction: 'inactive',
                streams: [this.defaultMediaStream],
                sendEncodings: encodingParams,
            });
        }
    };
    SimulcastTransceiverController.prototype.logVideoTransceiverParameters = function () {
        var e_1, _a;
        var params = this._localCameraTransceiver.sender.getParameters();
        var encodings = params.encodings;
        var msg = 'simulcast: current encoding parameters \n';
        try {
            for (var encodings_1 = __values(encodings), encodings_1_1 = encodings_1.next(); !encodings_1_1.done; encodings_1_1 = encodings_1.next()) {
                var encodingParam = encodings_1_1.value;
                msg += "rid=" + encodingParam.rid + " maxBitrate=" + encodingParam.maxBitrate + " active=" + encodingParam.active + " \n";
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (encodings_1_1 && !encodings_1_1.done && (_a = encodings_1.return)) _a.call(encodings_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.logger.info(msg);
    };
    SimulcastTransceiverController.LOW_LEVEL_NAME = 'low';
    SimulcastTransceiverController.MID_LEVEL_NAME = 'mid';
    SimulcastTransceiverController.HIGH_LEVEL_NAME = 'hi';
    SimulcastTransceiverController.NAME_ARR_ASCENDING = ['low', 'mid', 'hi'];
    SimulcastTransceiverController.BITRATE_ARR_ASCENDING = [200, 400, 1100];
    return SimulcastTransceiverController;
}(DefaultTransceiverController_1.default));
exports.default = SimulcastTransceiverController;
//# sourceMappingURL=SimulcastTransceiverController.js.map