import React,{useState, useContext } from "react";
import {
    CalendarContext,
    CALENDER_CONTENT_TYPES,
} from "context/CalendarContext.js";

// !这个部件已经完成
// !这个部件已经完成
// !这个部件已经完成
export default function SwitchTypeControl() {
    const {SetDaysRange,SetCalendarContentType} = useContext(CalendarContext);

    return (
        <div className="test-border">
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(1);
                }}
            >
                1
            </button>
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(2);
                }}
            >
                2
            </button>
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(3);
                }}
            >
                3
            </button>
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(4);
                }}
            >
                4
            </button>
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(5);
                }}
            >
                5
            </button>
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(6);
                }}
            >
                6
            </button>
            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT);
                    SetDaysRange(7);
                }}
            >
                7
            </button>

            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.WORKING_5DAYS);
                    SetDaysRange(5);
                }}
            >
                工作周
            </button>

            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.FULL_WEEK);
                    SetDaysRange(7);
                }}
            >
                周
            </button>

            <button
                onClick={() => {
                    SetCalendarContentType(CALENDER_CONTENT_TYPES.MONTH);
                    SetDaysRange(1);
                }}
            >
                月
            </button>
        </div>
    );
}
