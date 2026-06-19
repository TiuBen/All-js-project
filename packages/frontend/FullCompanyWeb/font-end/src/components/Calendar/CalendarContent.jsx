import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
    CalendarContext,
    getYYYYMMDDString,
    CALENDER_CONTENT_TYPES,
    WEEK_SIMPLE_NAME,
    MONTH_FULL_NAME,
    getRelatedDate,
} from "context/CalendarContext.js";
import ContainerForSelectedDaysContent from "./ContainerForSelectedDaysContent";

import DaysInMonth from "./DaysInMonth";
import ForwardBackwardControl from "./ForwardBackwardControl";
import SwitchTypeControl from "./SwitchTypeControl";

dayjs.extend(customParseFormat);

export default function CalendarContent(props) {
    const { contentType } = props;

    var initDate=new Date();

    const [YYYY, setYYYY] = useState(initDate.getFullYear()); // 1900-2200
    const [MM, setMM] = useState(initDate.getMonth() + 1); // ! 1-12 不是 0~11
    const [DD, setDD] = useState(initDate.getDate()); //1-31
    // !SELF_DEFINE_DAYS_COUNT 默认数值 1 范围为 1-7天
    const [SELF_DEFINE_DAYS_COUNT, set_SELF_DEFINE_DAYS_COUNT] = useState(1); //默认选1天的范围
    const [calendarContentType, setCalendarContentType] = useState(CALENDER_CONTENT_TYPES.MONTH); //默认从 月 开始

    const [startDateString, setStartDateString] = useState(dayjs(initDate).format("YYYY年MM月DD日"));
    //
    const [selectedDate, setSelectedDate] = useState(); //!fix 这个是要传给MiniCalendar的

    const [endDateString, setEndDateString] = useState();

    const [selectedDateYYYYMMDDString, setSelectedDateYYYYMMDDString] = useState();

    const [dayRange,setDayRange]=useState(1);

    const [relatedDate, setRelatedDate] = useState([initDate]);

    useEffect(() => {
        var _tempStartDate, _tempEndDate;
        if (calendarContentType === CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT) {
            _tempStartDate = new Date(YYYY, MM, DD - SELF_DEFINE_DAYS_COUNT);
            _tempEndDate = new Date(YYYY, MM, DD - 1);
        }
        if (calendarContentType === CALENDER_CONTENT_TYPES.MONTH) {
            _tempStartDate = new Date(YYYY, MM, 1);
            _tempEndDate = new Date(YYYY, MM + 1, 0);
        } else {
            // @STEP 先获取startDay是星期几,然后往前算到周一 WORKING_5DAYS OR FULL_WEEK
            const dateOfStartDate = new Date(YYYY, MM, DD).getDay();
            const forwardCounts = dateOfStartDate == "0" ? 6 : dateOfStartDate - 1;
            _tempStartDate = new Date(YYYY, MM, DD - forwardCounts);
            if (calendarContentType === "WORKING_5DAYS ") {
                _tempEndDate = new Date(YYYY, MM, DD - forwardCounts + 4);
            } else {
                _tempEndDate = new Date(YYYY, MM, DD - forwardCounts + 6);
            }
        }
        setStartDateString(getYYYYMMDDString(_tempStartDate));
        setEndDateString(getYYYYMMDDString(_tempEndDate));

        setYYYY(_tempStartDate.getFullYear());
        setMM(_tempStartDate.getMonth());
        setDD(_tempStartDate.getDate());
    }, [YYYY, MM, DD, calendarContentType]);

    useEffect(() => {
        // var _relatedDate = getRelatedDate(calendarContentType, selectedDateYYYYMMDDString, dayRange, true);
        // setRelatedDate(_relatedDate);
        // return () => {
        //    setRelatedDate([])
        // };
    }, [selectedDateYYYYMMDDString,dayRange,calendarContentType]);

    return (
        <CalendarContext.Provider
            value={{
                YYYY: YYYY,
                MM: MM,
                DD: DD,
                SetYYYY: setYYYY,
                SetMM: setMM,
                SetDD: setDD,
                DaysRange: dayRange,
                SetDaysRange:setDayRange,
                RelatedDate:relatedDate,
                SetRelatedDate:setRelatedDate,
                CalendarContentType: calendarContentType,
                SetCalendarContentType:setCalendarContentType,
                SelectedDateYYYYMMDDString: `${YYYY}-${MM + 1}-${DD}`,//! 按照直接人可读的时间来显示
                SetSelectedDateYYYYMMDDString: setSelectedDateYYYYMMDDString,
            }}
        >
            <div>
                <div className="flex-row fixed-days-range-selector-banner">
                    <SwitchTypeControl />
                </div>

                <div style={{ display: "flex" }}>
                    <DaysInMonth />
                    <span style={{ width: "20px", backgroundColor: "rebeccapurple" }}></span>
                    <div className="can-scroll-todo-container">
                        <ForwardBackwardControl />
                        {calendarContentType == CALENDER_CONTENT_TYPES.MONTH ? (
                            <DaysInMonth showLabel={false} uniqueIdPrefix="detail" />
                        ) : (
                            <div className="flex-col">
                                <ContainerForSelectedDaysContent />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CalendarContext.Provider>
    );
}
