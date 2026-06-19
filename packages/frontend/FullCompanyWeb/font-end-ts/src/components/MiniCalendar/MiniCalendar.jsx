import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ExpandMoreOutlined, ArrowUpward, ArrowDownward } from "@mui/icons-material";

const MonthType = [];

const Forward = [6, 0, 1, 2, 3, 4, 5];

function getMonthRangeDays(selectedDate) {
    const days = [];

    console.log(selectedDate);
    let year = selectedDate.getFullYear();
    let month = selectedDate.getMonth();

    // ! 当月开始
    const forward = [6, 0, 1, 2, 3, 4, 5][new Date(year, month, 1).getDay()];
    for (let index = 0; index < 42; index++) {
        let _tempDayjsDate = new Date(year, month, -forward + index + 1);
        days.push(_tempDayjsDate);
    }

    // console.log(days);
    return days;
}

function MiniCalendar({ selectedDate = new Date(), setSelectedDate }) {
    const [monthOrDays, setMonthOrDays] = useState(false); // true=12个月 false =42天
    const [visibleDate, setVisibleDate] = useState(selectedDate);
    const [displayDays, setDisplayDays] = useState([]);
    // const [year, setYYYY] = useState(selectedDate.getFullYear());
    // const [month, setM] = useState(selectedDate.getMonth());
    const [d, setD] = useState(1);

    useEffect(() => {
        setDisplayDays(getMonthRangeDays(visibleDate));
    }, [visibleDate]);

    useEffect(() => {
        setVisibleDate(selectedDate);
    }, [selectedDate]);

    return (
        <div className=" font-semibold">
            <div className="text-red-500">
                visibleDate: {dayjs(visibleDate).format("YYYY-MM-DD")}
                <br />
                selectedDate:{dayjs(selectedDate).format("YYYY-MM-DD")}
            </div>
            <div className="flex flex-row gap-1">
                <button className="hover:bg-neutral-200" onClick={(e) => {}}>
                    <ExpandMoreOutlined />
                </button>
                <button
                    className="flex-1 text-left hover:bg-neutral-200"
                    onClick={(e) => {
                        setMonthOrDays(!monthOrDays);
                    }}
                >
                    {monthOrDays ? dayjs(displayDays[10]).format("YYYY年") : dayjs(displayDays[10]).format("YYYY年M月")}
                </button>
                <button
                    className="hover:bg-neutral-200"
                    onClick={(e) => {
                        if (monthOrDays) {
                            setVisibleDate(dayjs(visibleDate).subtract(1, "year").toDate());
                        } else {
                            setVisibleDate(dayjs(visibleDate).subtract(1, "month").toDate());
                        }
                    }}
                >
                    <ArrowUpward />
                </button>
                <button
                    className="hover:bg-neutral-200"
                    onClick={(e) => {
                        if (monthOrDays) {
                            setVisibleDate(dayjs(visibleDate).add(1, "year").toDate());
                        } else {
                            setVisibleDate(dayjs(visibleDate).add(1, "month").toDate());
                        }
                    }}
                >
                    <ArrowDownward />
                </button>
            </div>
            {monthOrDays ? (
                <div className="grid grid-cols-4">
                    {Array(12)
                        .fill()
                        .map((x, index) => {
                            return (
                                <button
                                    key={index}
                                    className={`aspect-square flex items-center justify-center ${
                                        selectedDate.getMonth() === index &&
                                        visibleDate.getFullYear() === selectedDate.getFullYear()
                                            ? "bg-blue-400"
                                            : ""
                                    }`}
                                    // value={`${month}-${x + 1}-1`}
                                    onClick={(e) => {
                                        setD(null);

                                        setVisibleDate(new Date(visibleDate.getFullYear(), index, 1));

                                        setMonthOrDays(false);
                                    }}
                                >
                                    {index + 1}月
                                </button>
                            );
                        })}
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-1 ">
                    <div className=" aspect-square flex items-center justify-center ">一</div>
                    <div className=" aspect-square flex items-center justify-center ">二</div>
                    <div className=" aspect-square flex items-center justify-center ">三</div>
                    <div className=" aspect-square flex items-center justify-center ">四</div>
                    <div className=" aspect-square flex items-center justify-center ">五</div>
                    <div className=" aspect-square flex items-center justify-center ">六</div>
                    <div className=" aspect-square flex items-center justify-center ">日</div>
                    {displayDays.map((x, index) => {
                        return (
                            <button
                                key={index}
                                className={`aspect-square  hover:bg-neutral-300 ${
                                    dayjs(x).format("YYYY-M-D") === dayjs(selectedDate).format("YYYY-M-D")
                                        ? "border border-neutral-500  bg-blue-300"
                                        : ""
                                } `}
                                date-value={dayjs(x).format("YYYY-M-D")}
                                onClick={() => {
                                    setSelectedDate(x);
                                    // setVisibleDate(x);
                                }}
                            >
                                <div
                                    className={`m-[1px] aspect-square rounded-full  flex items-center justify-center ${
                                        dayjs(x).format("YYYY-M-D") === dayjs(Date.now()).format("YYYY-M-D")
                                            ? "bg-blue-600 text-white"
                                            : ""
                                    }`}
                                >
                                    {dayjs(x).format("D")}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export { MiniCalendar };
