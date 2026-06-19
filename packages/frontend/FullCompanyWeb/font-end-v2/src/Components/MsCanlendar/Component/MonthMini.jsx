import React, { useState, useEffect } from "react";
import "./MonthMini.css";
import dayjs from "dayjs";

function MonthMini(props) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [visibleDate, setVisibleDate] = useState(new Date());

    const [yyyy, setYYYY] = useState(visibleDate.getFullYear());
    // ! js默认的月从0开始
    const [m, setM] = useState(visibleDate.getMonth());

    // 显示一年12个月 或是 一个月42天
    const [monthOrDays, setMonthOrDays] = useState(false); // true=12个月 false =42天

    // !getDay() 方法根据本地时间，返回一个具体日期中一周的第几天，0 表示星期天
    const [startIndex, setStartIndex] = useState(dayjs(new Date(yyyy, m, 1)).get("day"));

    useEffect(() => {
        setVisibleDate(new Date(yyyy, m, 1));
        setStartIndex(dayjs(new Date(yyyy, m, 1)).get("day"));
    }, [yyyy, m]);

    useEffect(() => {
        setYYYY(visibleDate.getFullYear());
        setM(visibleDate.getMonth());
    }, [visibleDate])
    

    return (
        <div className="mini-calendar">
            <div className="header-container">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <span className="material-symbols-outlined" style={{fontSize:'36px'}}>expand_more</span>
                </button>
                <button
                    className="switch"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMonthOrDays(!monthOrDays);
                    }}
                >
                    {/* {dayjs(visibleDate).format("YYYY年M月D日")} */}
                    {/* <br /> */}
                    {monthOrDays ? dayjs(visibleDate).format("YYYY年") : dayjs(visibleDate).format("YYYY年M月")}
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (monthOrDays) {
                            setYYYY(yyyy - 1);
                        } else {
                            setM(m - 1);
                        }
                    }}
                >
                    <span className="material-symbols-outlined">arrow_upward</span>
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (monthOrDays) {
                            setYYYY(yyyy + 1);
                        } else {
                            setM(m + 1);
                        }
                    }}
                >
                    <span className="material-symbols-outlined">arrow_downward</span>
                </button>
            </div>
            <div className={`body-container ${monthOrDays ? "show-12months" : "show-42days"}`}>
                {monthOrDays ? (
                    <>
                        {Array.from(Array(12).keys()).map((x, index) => {
                            return (
                                <button
                                    key={index}
                                    className="month-name-in-CN"
                                    value={`${yyyy}-${x + 1}-1`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log(e.target.value);
                                        setVisibleDate(dayjs(e.target.value,'YYYY-M-D').toDate() )
                                        setMonthOrDays(false);
                                    }}
                                >
                                    {x + 1}月
                                </button>
                            );
                        })}
                    </>
                ) : (
                    <>
                        <div className="day-name-in-CN">一</div>
                        <div className="day-name-in-CN">二</div>
                        <div className="day-name-in-CN">三</div>
                        <div className="day-name-in-CN">四</div>
                        <div className="day-name-in-CN">五</div>
                        <div className="day-name-in-CN">六</div>
                        <div className="day-name-in-CN">日</div>

                        {Array.from(Array(42).keys()).map((x, index) => {
                            return (
                                <button key={index} className="everyday " value={`${yyyy}-${m}- ${x - startIndex}`}>
                                    {dayjs(new Date(yyyy, m, x - (startIndex === 0 ? 7 : startIndex) + 2)).format(
                                        "D"
                                    )}
                                    <br />
                                </button>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}

export default MonthMini;
