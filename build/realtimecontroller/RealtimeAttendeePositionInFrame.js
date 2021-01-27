"use strict";
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * [[RealtimeAttendeePositionInFrame]] information about the attendee's place in the frame.
 */
var RealtimeAttendeePositionInFrame = /** @class */ (function () {
    function RealtimeAttendeePositionInFrame() {
        /**
         * Index of attendee update in the frame starting at zero
         */
        this.attendeeIndex = null;
        /**
         * Number of total attendee updates in the frame
         */
        this.attendeesInFrame = null;
    }
    return RealtimeAttendeePositionInFrame;
}());
exports.default = RealtimeAttendeePositionInFrame;
//# sourceMappingURL=RealtimeAttendeePositionInFrame.js.map