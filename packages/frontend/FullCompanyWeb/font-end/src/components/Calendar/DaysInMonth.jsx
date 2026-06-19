import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import {
    CalendarContext,
    getYYYYMMDDString,
    CALENDER_CONTENT_TYPES,
    WEEK_SIMPLE_NAME,
    MONTH_FULL_NAME,
} from "context/CalendarContext.js";

// ! 这个组件功能已经完成
// ! 这个组件功能已经完成
// ! 这个组件功能已经完成

export default function DaysInMonth(props) {
    // 是否显示月份栏 
    // 当有两个控件时 为了让ID不相同
    const {showLabel=true,uniqueIdPrefix}=props

    //! js 的 月是 0-11 我们使用正常人用的 1-12
    const {YYYY,MM, DaysRange,CalendarContentType, SelectedDateYYYYMMDDString,SetSelectedDateYYYYMMDDString, RelatedDate,SetRelatedDate} = useContext(CalendarContext);

    // useEffect(() => {
    //     effect
    //     return () => {
    //         cleanup
    //     }
    // }, [DaysRange,CalendarContentType,SetSelectedDateYYYYMMDDString])




    //!! 输入人类直接可读的年月日
    // 当月第一天是星期几
    const theDayOfThisMonthFirstDay =dayjs(`${YYYY}-${MM}-${1}`,"YYYY-M-D").toDate().getDay();
    console.log("theDayOfThisMonthFirstDay:"+theDayOfThisMonthFirstDay);
    const daysItems = [];
    let lightOrDark = "Dark";
    let todayStyle = " ";

    // 月组件 只能



    // let dayOfMonth = dayjs(`${YYYY}-${MM}-${1}`,"YYYY-M-D");
    for (let x = 1; x <= 42; x++) {
        lightOrDark = "Dark";

        let _tempDayjsDate = new Date(YYYY, MM-1, -theDayOfThisMonthFirstDay + x+1);
        //不是这个月的日期是 灰色
        if (_tempDayjsDate.getMonth() !== (MM-1)) {
            lightOrDark = "light";
        }

        if (dayjs(_tempDayjsDate).format("YYYY-M-D")== dayjs().format("YYYY-M-D")) {
            todayStyle = "red-background-color";
        } else {
            todayStyle = "";
        };

        daysItems.push(
            <td
                className={lightOrDark + " " + todayStyle + " day-item"}
                key={dayjs(_tempDayjsDate).format("YYYY-M-D")}
                id={uniqueIdPrefix+""+dayjs(_tempDayjsDate).format("YYYY-M-D")}
                onClick={(e) => {
                    SetSelectedDateYYYYMMDDString(e.target.id);
                }}
                onMouseEnter={(e) => {
                    console.log("onMouseEnter");
                    const id = e.target.id;
                    console.log(`要改变ID: ${id} 附近的效果了 `);

                    console.log();
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onMouseLeave={(e) => {
                    console.log("onMouseLeave");
                    const id = e.target.id;

                    console.log();
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                {dayjs(_tempDayjsDate).date()}
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
            {showLabel? <h3>{dayjs(`${YYYY}-${MM}-${1}`,"YYYY-M-D").format("YYYY年M月")}</h3>:null }
           
            <table style={{ cursor: "pointer", borderCollapse: "collapse" }}>
                <tbody>
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
