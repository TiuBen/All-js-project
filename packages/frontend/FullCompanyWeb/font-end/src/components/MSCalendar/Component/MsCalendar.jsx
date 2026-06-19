import React from "react";
import dayjs from "dayjs";
import { createContext, useContext, useState,useEffect } from "react";
import {TypeRangeSwitch} from "./TypeRangeSwitch";
import {MonthMini} from "./MonthMini";
import {ForwardBackwardTodayControl} from "./ForwardBackwardTodayControl";
import {MonthLarge} from "./MonthLarge";
import {RangedDaysDetail} from "./RangedDaysDetail";
import {RangedDaysLabel} from "./RangedDaysLabel";
import {CALENDER_CONTENT_TYPES,MsCalendarContext,getRelatedDate} from '../../../context/index.js'
import './MsCalendar.scss';

 function MsCalendar() {
    const [rangedDays, setRangedDays] = useState([new Date(),]);
    const [selectedDateString, setSelectedDateString] = useState(dayjs().format("YYYY-M-D"));// 直接可读的日期
    const [contentType, setContentType] = useState(CALENDER_CONTENT_TYPES.ONE_MONTH);



    useEffect(() => {
        const newRangedDays=getRelatedDate(contentType,selectedDateString,true)
        setRangedDays(newRangedDays);

    }, [contentType,selectedDateString])



    return (
        <MsCalendarContext.Provider
            value={{
                RangedDays: rangedDays,
                SetRangedDays: setRangedDays,
                SelectedDateString: selectedDateString,
                SetSelectedDateString: setSelectedDateString,
                ContentType: contentType,
                SetContentType: setContentType,
            }}
        >
            <div className="test-border ms-calendar">
                <TypeRangeSwitch />
                <div className="flex-row main">
                    <MonthMini />
                    <div className="flex-col  main-right ">
                        <div className="flex-row test-border ">
                            <ForwardBackwardTodayControl />
                            <RangedDaysLabel />
                        </div>
                        {contentType == CALENDER_CONTENT_TYPES.ONE_MONTH ? <MonthLarge /> : <RangedDaysDetail />}
                    </div>
                </div>
            </div>
        </MsCalendarContext.Provider>
    );
}

export {MsCalendar}