"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
var AsyncScheduler_1 = require("../scheduler/AsyncScheduler");
var IntervalScheduler_1 = require("../scheduler/IntervalScheduler");
var MediaDeviceProxyHandler = /** @class */ (function () {
    function MediaDeviceProxyHandler() {
        var _this = this;
        this.scheduler = null;
        this.devices = null;
        this.deviceChangeListeners = new Set();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
        this.get = function (target, property, receiver) {
            if (!Reflect.has(target, property)) {
                return undefined;
            }
            if (!('ondevicechange' in navigator.mediaDevices)) {
                if (property === 'addEventListener') {
                    return _this.patchAddEventListener(target, property, receiver);
                }
                else if (property === 'removeEventListener') {
                    return _this.patchRemoveEventListener(target, property, receiver);
                }
            }
            var value = Reflect.get(target, property, receiver);
            return typeof value === 'function' ? value.bind(target) : value;
        };
        this.patchAddEventListener = function (target, property, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receiver) {
            var value = Reflect.get(target, property, receiver);
            return function (type, listener, options) {
                if (type === 'devicechange') {
                    _this.deviceChangeListeners.add(listener);
                    if (!_this.scheduler) {
                        _this.scheduler = new IntervalScheduler_1.default(MediaDeviceProxyHandler.INTERVAL_MS);
                        _this.scheduler.start(_this.pollDeviceLists);
                    }
                }
                else {
                    return Reflect.apply(value, target, [type, listener, options]);
                }
            };
        };
        this.patchRemoveEventListener = function (target, property, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receiver) {
            var value = Reflect.get(target, property, receiver);
            return function (type, listener, options) {
                if (type === 'devicechange') {
                    _this.deviceChangeListeners.delete(listener);
                    if (_this.deviceChangeListeners.size === 0 && _this.scheduler) {
                        _this.scheduler.stop();
                        _this.scheduler = null;
                    }
                }
                else {
                    return Reflect.apply(value, target, [type, listener, options]);
                }
            };
        };
        this.pollDeviceLists = function () { return __awaiter(_this, void 0, void 0, function () {
            var newDevices, changed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sortedDeviceList()];
                    case 1:
                        newDevices = _a.sent();
                        if (this.devices) {
                            changed = newDevices.length !== this.devices.length ||
                                newDevices.some(function (device, index) {
                                    return device.deviceId !== _this.devices[index].deviceId;
                                });
                            if (changed) {
                                this.handleDeviceChangeEvent();
                            }
                        }
                        this.devices = newDevices;
                        return [2 /*return*/];
                }
            });
        }); };
    }
    MediaDeviceProxyHandler.prototype.sortedDeviceList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newDevices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        newDevices = _a.sent();
                        return [2 /*return*/, newDevices.sort(function (device1, device2) {
                                if (device1.deviceId < device2.deviceId) {
                                    return 1;
                                }
                                else if (device1.deviceId > device2.deviceId) {
                                    return -1;
                                }
                                else {
                                    return 0;
                                }
                            })];
                }
            });
        });
    };
    MediaDeviceProxyHandler.prototype.handleDeviceChangeEvent = function () {
        var e_1, _a;
        var _this = this;
        var _loop_1 = function (listener) {
            new AsyncScheduler_1.default().start(function () {
                /* istanbul ignore else */
                if (_this.deviceChangeListeners.has(listener)) {
                    var event_1 = new Event('devicechange');
                    if (typeof listener === 'function') {
                        listener(event_1);
                    }
                    else {
                        listener.handleEvent(event_1);
                    }
                }
            });
        };
        try {
            for (var _b = __values(this.deviceChangeListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var listener = _c.value;
                _loop_1(listener);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    MediaDeviceProxyHandler.INTERVAL_MS = 1000;
    return MediaDeviceProxyHandler;
}());
exports.default = MediaDeviceProxyHandler;
//# sourceMappingURL=MediaDeviceProxyHandler.js.map