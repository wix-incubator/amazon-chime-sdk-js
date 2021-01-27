"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
var LogLevel_1 = require("./LogLevel");
/**
 * MultiLogger writes logs to multiple other loggers
 */
var MultiLogger = /** @class */ (function () {
    function MultiLogger() {
        var loggers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            loggers[_i] = arguments[_i];
        }
        this._loggers = loggers;
    }
    MultiLogger.prototype.info = function (msg) {
        var e_1, _a;
        try {
            for (var _b = __values(this._loggers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var logger = _c.value;
                logger.info(msg);
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
    MultiLogger.prototype.warn = function (msg) {
        var e_2, _a;
        try {
            for (var _b = __values(this._loggers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var logger = _c.value;
                logger.warn(msg);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    MultiLogger.prototype.error = function (msg) {
        var e_3, _a;
        try {
            for (var _b = __values(this._loggers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var logger = _c.value;
                logger.error(msg);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    MultiLogger.prototype.debug = function (debugFunction) {
        var e_4, _a;
        var message;
        var memoized = typeof debugFunction === 'string'
            ? debugFunction
            : function () {
                if (!message) {
                    message = debugFunction();
                }
                return message;
            };
        try {
            for (var _b = __values(this._loggers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var logger = _c.value;
                logger.debug(memoized);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    MultiLogger.prototype.setLogLevel = function (level) {
        var e_5, _a;
        try {
            for (var _b = __values(this._loggers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var logger = _c.value;
                logger.setLogLevel(level);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    MultiLogger.prototype.getLogLevel = function () {
        var e_6, _a;
        try {
            for (var _b = __values(this._loggers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var logger = _c.value;
                return logger.getLogLevel();
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return LogLevel_1.default.OFF;
    };
    return MultiLogger;
}());
exports.default = MultiLogger;
//# sourceMappingURL=MultiLogger.js.map