import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import { CalendarContext, CALENDER_CONTENT_TYPES, getRelatedDate } from "context/CalendarContext.js";
import RangeControl from "./RangeControl";

// !这个组件已经完成
// !这个组件已经完成
// !这个组件已经完成

export default function ForwardBackwardControl() {
    const { DaysRange, RelatedDate, SetRelatedDate, SetSelectedDateYYYYMMDDString, CalendarContentType } =
        useContext(CalendarContext);

    return (
        <div className="flex-row fixed-days-schedular-banner">
            <button
                onClick={() => {
                    SetSelectedDateYYYYMMDDString(dayjs().format("YYYY-M-D"));
                }}
            >
                今天
            </button>

            <button
                onClick={() => {
                    let _startDate = RelatedDate[0];
                    let yyyy = _startDate.getFullYear(); //
                    let mm = _startDate.getMonth(); // 0-11
                    let dd = _startDate.getDate(); // 1-31
                    let _newDate;

                    if (CalendarContentType == CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT) {
                        _newDate = new Date(yyyy, mm, dd - DaysRange);
                    }
                    if (CalendarContentType == CALENDER_CONTENT_TYPES.WORKING_5DAYS) {
                        _newDate = new Date(yyyy, mm, dd - 7);
                    }
                    if (CalendarContentType == CALENDER_CONTENT_TYPES.FULL_WEEK) {
                        _newDate = new Date(yyyy, mm, dd - 7);
                    }
                    if (CalendarContentType == CALENDER_CONTENT_TYPES.MONTH) {
                        _newDate = new Date(yyyy, mm - 1, dd);
                    } else {
                        console.error("出错了!");
                    }

                    let _newDateYYYYMMDDString = dayjs(_newDate).format("YYYY-M-D");

                    const _newRangeDate = getRelatedDate(CalendarContentType, _newDateYYYYMMDDString, DaysRange, true);
                    SetRelatedDate(_newRangeDate);
                }}
            >
                往前
            </button>
            <button
                onClick={() => {
                    let _startDate = RelatedDate[0];
                    let yyyy = _startDate.getFullYear(); //
                    let mm = _startDate.getMonth(); // 0-11
                    let dd = _startDate.getDate(); // 1-31
                    let _newDate;

                    if (CalendarContentType == CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT) {
                        _newDate = new Date(yyyy, mm, dd + DaysRange);
                    }
                    if (CalendarContentType == CALENDER_CONTENT_TYPES.WORKING_5DAYS) {
                        _newDate = new Date(yyyy, mm, dd + 7);
                    }
                    if (CalendarContentType == CALENDER_CONTENT_TYPES.FULL_WEEK) {
                        _newDate = new Date(yyyy, mm, dd + 7);
                    }
                    if (CalendarContentType == CALENDER_CONTENT_TYPES.MONTH) {
                        _newDate = new Date(yyyy, mm - 1, dd);
                    } else {
                        console.error("出错了!");
                    }

                    let _newDateYYYYMMDDString = dayjs(_newDate).format("YYYY-M-D");

                    const _newRangeDate = getRelatedDate(CalendarContentType, _newDateYYYYMMDDString, DaysRange, true);
                    SetRelatedDate(_newRangeDate);
                }}
            >
                往后
            </button>

            <div style={{ backgroundColor: "red" }}>
                这里还需要个控件
                <RangeControl />
            </div>
        </div>
    );
}
