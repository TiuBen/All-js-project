/*
this it the way I want to use the month calender

<MonthCalender data={data} onDateButtonClick={onDateButtonClick} />


*/

import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";

function MonthCalender(props) {
    const {
        year = new Date().getFullYear(),
        month = new Date().getMonth(),
        data,
        title,
        onDateTitleButtonClick,
        cellRender,
        Cell,
    } = props;
    const [thisMonthDateArray, setThisMonthDateArray] = useState([]);

    // 生成当前月份的日期数组
    useEffect(() => {
        const generateMonthDates = () => {
            const daysInMonth = new Date(year, month, 0).getDate(); // 获取当前月份的天数 1-31 天
            const thisMonthStartDay = new Date(year, month, 0).getDay(); // 获取当前月份的天数 0-6 ，返回一个具体日期中一周的第几天，0 表示星期天。
            const datesArray = [];

            const _5rowsRo6Rows = 5; // Math.ceil((daysInMonth + thisMonthStartDay) / 7);

            for (let day = 1; day <= 7 * _5rowsRo6Rows; day++) {
                const _day = dayjs(new Date(year, month, day - thisMonthStartDay)).format("YYYY-MM-DD");

                datesArray.push(_day);
            }

            setThisMonthDateArray(datesArray);
        };

        generateMonthDates();
    }, [year, month]);

    // const cellRefs = useRef([]);
    // const resizeObservers = useRef([]);
    // useEffect(() => {
    //     cellRefs.current.forEach((ref, index) => {
    //         if (ref && !resizeObservers.current[index]) {
    //             const observer = new ResizeObserver((entries) => {
    //                 for (let entry of entries) {
    //                     console.log(`单元格${index}尺寸变化:`, entry.contentRect);
    //                     // 可以在这里处理尺寸变化
    //                 }
    //             });
    //             observer.observe(ref);
    //             resizeObservers.current[index] = observer;
    //         }
    //     });

    //     return () => {
    //         // 清理观察器
    //         resizeObservers.current.forEach((observer) => {
    //             if (observer) observer.disconnect();
    //         });
    //     };
    // }, [thisMonthDateArray]);

    return (
        <div
            aria-roledescription="month-calendar"
            className="  grid grid-cols-7  grid-rows-[min-content,min-content] flex-1  "
            // style={{ gridTemplateRows: "min-content min-content" }}
        >
            <div className="col-span-7 ">{title}</div>
            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day, index) => {
                return (
                    <div key={index} className="outline outline-1  outline-gray-300 text-nowrap font-bold ">
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
                                dayjs(date).isSame(Date.now(), "day") ? "bg-blue-600 text-cyan-50 " : ""
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