import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import {
    CalendarContext,
    getYYYYMMDDString,
    CALENDER_CONTENT_TYPES,
    WEEK_SIMPLE_NAME,
    MONTH_FULL_NAME,
} from "context/CalendarContext.js";

export default function DetailDaysInMonth(props) {
    // 是否显示月份栏
    // 当有两个控件时 为了让ID不相同
    const { uniqueIdPrefix } = props;

    //! js 的 月是 0-11 我们使用正常人用的 1-12
    const { SelectedDateYYYYMMDDString, SetSelectedDateYYYYMMDDString } = useContext(CalendarContext);

    //!! 输入人类直接可读的年月日
    // 当月第一天是星期几
    const _startDate = dayjs(SelectedDateYYYYMMDDString, "YYYY-M-D").toDate();
    const theDayOfThisMonthFirstDay = _startDate.getDay();
    console.log("theDayOfThisMonthFirstDay:" + theDayOfThisMonthFirstDay);
    const yyyy = _startDate.getFullYear();
    const mm = _startDate.getMonth();

    const daysItems = [];
    let todayStyle = "";

    // 月组件 只能

    // let dayOfMonth = dayjs(`${YYYY}-${MM}-${1}`,"YYYY-M-D");
    for (let x = 1; x <= 42; x++) {
        let _tempDate = new Date(yyyy, mm, -theDayOfThisMonthFirstDay + x + 1);

        // 日历中有今天
        if (dayjs(_tempDate).format("YYYY-M-D")== dayjs().format("YYYY-M-D")) {
            todayStyle = "red-background-color";
        } else {
            todayStyle = "";
        };

        daysItems.push(
            <td
                className={todayStyle +" day-item"}
                key={dayjs(_tempDayjsDate).format("YYYY-M-D")}
                id={uniqueIdPrefix + "" + dayjs(_tempDayjsDate).format("YYYY-M-D")}
                onClick={(e) => {
                    setSelectedDateYYYYMMDDString(e.target.id);
                }}
            >
                {_tempDate.getMonth() !== mm
                    ? dayjs(_tempDayjsDate).format("M月D日")
                    : dayjs(_tempDayjsDate).format("D月")}
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
                        <td>星期一</td>
                        <td>星期二</td>
                        <td>星期三</td>
                        <td>星期四</td>
                        <td>星期五</td>
                        <td>星期六</td>
                        <td>星期日</td>
                    </tr>
                    {array}
                </tbody>
            </table>
        </div>
    );
}
