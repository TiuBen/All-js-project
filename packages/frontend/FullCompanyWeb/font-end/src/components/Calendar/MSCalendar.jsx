import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import {
    CalendarContext,
    getYYYYMMDDString,
    CALENDER_CONTENT_TYPES,
    WEEK_SIMPLE_NAME,
    MONTH_FULL_NAME,
} from "context/CalendarContext.js";


function FromMouseOverElementIDSetRangedDateStyle(id, range, type, styleString) {
    let _mouseOverElement = document.getElementById(id);
    console.log(id);
    _mouseOverElement.style.backgroundColor = "#85c1e9";
    var _mouseOverElementDate = new Date(id);
    let yyyy = _mouseOverElementDate.getFullYear();
    let mm = _mouseOverElementDate.getMonth();
    let dd = _mouseOverElementDate.getDate();

    _mouseOverElement.setAttribute("style", styleString);

    // if (type == CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT) {
    //     for (let x = 1; x < range; x++) {
    //         var _hoverElement = document.getElementById(`${yyyy}-${mm}-${dd + x}`);
    //         _hoverElement.style.backgroundColor = "#85c1e9";
    //     }
    // }
    // if (type == CALENDER_CONTENT_TYPES.DAY) {
    //     var _hoverElement = document.getElementById(`${yyyy}-${mm}-${dd}`);
    //     _hoverElement.style.backgroundColor = "#85c1e9";
    // }
    // if (type == CALENDER_CONTENT_TYPES.MONTH) {
    //     var _hoverElement = document.getElementById(`${yyyy}-${mm}-${dd}`);
    //     _hoverElement.setAttribute("style", styleString);
    // } else {
    // }
}

export default function MSCalendar({isControlled} ) {
    const { YYYY, MM, DD, setYYYY, setMM, setDD, DaysRange, CalendarContentType } = useContext(CalendarContext);

    // 今天=当天 背景红色
    const [today, setToday] = useState(new Date());

    // 当月第一天是星期几
    const theDayOfThisMonthFirstDay = new Date(YYYY, MM, 1).getDay();

    const daysItems = [];
    let lightOrDark = "Dark";
    let todayStyle = " ";
    console.log("DaysRange:" + DaysRange);


    for (let x = 1; x <= 42; x++) {
        lightOrDark = "Dark";
        let _tempDate = new Date(YYYY, MM, -theDayOfThisMonthFirstDay + x);

        //不是这个月的日期是 灰色
        if (_tempDate.getMonth() !== MM) {
            lightOrDark = "light";
        }

        let day = _tempDate.getDate();
        let yyyymmdd = _tempDate.toDateString();

        if (getYYYYMMDDString(_tempDate) == getYYYYMMDDString(new Date())) {
            todayStyle = "red-background-color";
        } else {
            todayStyle = "";
        }

        daysItems.push(
            <td
                className={lightOrDark + " " + todayStyle}
                key={yyyymmdd}
                id={`${_tempDate.getFullYear()}-${_tempDate.getMonth()}-${_tempDate.getDate()}`}
                onClick={() => {
                    setYYYY(_tempDate.getFullYear());
                    setMM(_tempDate.getMonth());
                    setDD(_tempDate.getDate());
                }}
                onMouseEnter={(e) => {
                    console.log("onMouseEnter");
                    FromMouseOverElementIDSetRangedDateStyle(
                        e.target.id,
                        DaysRange,
                        CalendarContentType,
                        "background-color: rgb(133, 193, 233);"
                    );
                    // e.stopPropagation();
                    // e.preventDefault();
                }}
                onMouseLeave={(e) => {
                    console.log("onMouseLeave");
                    FromMouseOverElementIDSetRangedDateStyle(
                        e.target.id,
                        DaysRange,
                        CalendarContentType,
                        "background-color:rgb(100, 100, 233);"
                    );
                    // e.stopPropagation();
                    // e.preventDefault();
                }}
            >
                {day}
            </td>
        );
    }

    const array = [];
    for (let row = 0; row < 6; row++) {
        const rowElements = (
            <tr key={row}>
                {daysItems[row * 7 + 0]}
                {daysItems[row * 7 + 1]}
                {daysItems[row * 7 + 2]}
                {daysItems[row * 7 + 3]}
                {daysItems[row * 7 + 4]}
                {daysItems[row * 7 + 5]}
                {daysItems[row * 7 + 6]}
            </tr>
        );
        array.push(rowElements);
    }

    return (
        <div>
            <table style={{ cursor: "pointer", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td>{YYYY+"年"+MONTH_FULL_NAME[MM]}</td>
                    </tr>
                    <tr>
                        <td>一</td>
                        <td>二</td>
                        <td>三</td>
                        <td>四</td>
                        <td>五</td>
                        <td>六</td>
                        <td>日</td>
                    </tr>
                    {array}
                </tbody>
            </table>
        </div>
    );
}