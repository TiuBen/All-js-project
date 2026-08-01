/*
this it the way I want to use the month calender

<MonthCalender data={data} onDateButtonClick={onDateButtonClick} />


*/

import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";

function MonthCalender(props) {
    const { year, month, data, title, onDateTitleButtonClick, cellRender, Cell } = props;
    const [thisMonthDateArray, setThisMonthDateArray] = useState([]);

    // 生成当前月份的日期数组
    useEffect(() => {
        const generateMonthDates = () => {
            // 注意：new Date(year, month, 0) 获取的是上个月最后一天，
            // 所以获取天数应该是 new Date(year, month + 1, 0).getDate()
            // 获取当月第一天是星期几：new Date(year, month, 1).getDay()
            const daysInMonth = dayjs().year(year).month(month).daysInMonth();
            const thisMonthStartDay = dayjs().year(year).month(month).date(1).day(); // Use .day() not .getDay()
            const datesArray = [];

            const _5rowsRo6Rows = 5; // Math.ceil((daysInMonth + thisMonthStartDay) / 7);

            for (let day = 1; day <= 7 * _5rowsRo6Rows; day++) {
                const _day = dayjs(new Date(year, month, day - thisMonthStartDay + 1)).format("YYYY-MM-DD");

                datesArray.push(_day);
            }

            setThisMonthDateArray(datesArray);
        };

        generateMonthDates();
    }, [year, month]);

    return (
        <div
            aria-roledescription="month-calendar"
            className="  grid grid-cols-7  grid-rows-[min-content,min-content] flex-1  "
            // style={{ gridTemplateRows: "min-content min-content" }}
        >
            <div className="col-span-7 ">{title}</div>
            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day, index) => {
                return (
                    <div
                        key={index}
                        className="outline outline-1  outline-gray-300 text-nowrap font-bold text-center text-blue-800"
                    >
                        {day}
                    </div>
                );
            })}
            {/* {cellRender} */}
            {thisMonthDateArray.map((date, index) => {
                // const content = data[date] ? ()=>cellRender(data[data]) : null; // 如果 data 中有对应日期的内容，则渲染

                return (
                    <div
                        key={index}
                        className="outline outline-1  outline-gray-300    border-gray-500  hover:bg-blue-50 cursor-default flex flex-col  items-stretch"
                    >
                        <div
                            className={` text-nowrap hover:font-bold ] px-4  text-center ${
                                dayjs(date).isSame(Date.now(), "day")
                                    ? "bg-blue-600 text-cyan-50 "
                                    : "bg-blue-300 text-white"
                            } `}
                        >
                            {dayjs().get("month") !== dayjs(date, ["YYYY-MM-DD", "YYYY-M-D"]).get("month")
                                ? dayjs(date, ["YYYY-MM-DD", "YYYY-M-D"]).format("M月D日")
                                : dayjs(date, ["YYYY-MM-DD", "YYYY-M-D"]).format("D日")}
                        </div>
                        {/* <div className="flex h-full" ref={(el) => (cellRefs.current[index] = el)}>
                        </div> */}
                        {cellRender(date)}
                    </div>
                );
            })}
        </div>
    );
}

export { MonthCalender };
//  border-l border-t border-b-[1px]  mt-[-1px]
