import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useCalendar } from "./useCalendar";

const RangeType = {
    Today: "Today",
    CountedDays: "CountedDays",
    WorkDays5: "WorkDays5",
    FullWeekDays: "FullWeekDays",
    FullMonth: "FullMonth",
};

function getMonthRangeDays(type, selectedDate, count) {
    console.log(type + ":" + selectedDate);
    const days = [];

    if (type !== RangeType.CountedDays) {
        // 不是选择的日期开始的
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth();

        let forward;
        if (type === RangeType.FullMonth) {
            // ! 当月开始
            forward = [6, 0, 1, 2, 3, 4, 5][new Date(year, month, 1).getDay()];
            for (let index = 0; index < 42; index++) {
                let _tempDayjsDate = new Date(year, month, -forward + index + 1);
                days.push(_tempDayjsDate);
            }
        } else {
            // ! 周一开始
            forward = [6, 0, 1, 2, 3, 4, 5][selectedDate.getDay()];
            const _startDate = dayjs(selectedDate).subtract(forward, "day");
            for (let index = 0; index < 7; index++) {
                const _day = dayjs(_startDate).add(index, "days").toDate();
                days.push(_day);
            }
        }
    } else if (type === RangeType.CountedDays) {
        // 从选择的日期开始的
        for (let index = 0; index < count; index++) {
            const _day = dayjs(selectedDate).add(index, "days").toDate();
            days.push(_day);
        }
    }
    // console.log(days);
    return days;
}

function MonthLarge({
    rangeType = RangeType.FullMonth,
    selectedDate = new Date(),
    cellRender,
    onHeaderClick,
    onSectionClick = () => {
        console.log("onSectionClick");
    },
}) {
    // //!! 输入人类直接可读的年月日
    const [displayDays, setDisplayDays] = useState(null);
    // ! 选中的日期
    const [_selectedDate, setSelectedDate] = useState(null);
    const handleSectionClick = (day) => {
        console.log(day);
        setSelectedDate(day);
        onSectionClick();
    };

    // const cellNode = cellRender();

    useEffect(() => {
        const _temp = getMonthRangeDays(rangeType, new Date());
        setDisplayDays([..._temp]);
        console.log(_temp);
    }, [rangeType]);

    return (
        <div className="flex flex-col flex-1">
            {dayjs(selectedDate).toISOString()}
            <div className="flex flex-row h-10 gap-1">
                <button>今天</button>
                <button>Previous</button>
                <button>Next</button>
            </div>
            {displayDays && (
                <>
                    {rangeType === RangeType.FullMonth ? (
                        <div className="grid grid-cols-7 gap-[0px]  flex-1 grid-rows-[1.5rem,auto] rounded-t-md">
                            {["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"].map((x, index) => {
                                return (
                                    <div key={index} className=" bg-zinc-200 pl-2 text-lg font-yahei font-semibold">
                                        {x}
                                    </div>
                                );
                            })}
                            {displayDays.map((x, index) => {
                                return (
                                    <section
                                        key={index}
                                        className={`one-day-cell  box-content  ${
                                            x === _selectedDate ? "border-blue-500 bg-blue-50" : "border-zinc-100"
                                        } border-[0.5px] `}
                                        data-year={x.getFullYear()}
                                        data-month={x.getMonth()}
                                        data-date={x.getDate()}
                                        onClick={() => handleSectionClick(x)}
                                    >
                                        <div
                                            className={`pl-2 cursor-pointer hover:font-bold  ${
                                                dayjs(x).format("YYYY-M-DD") === dayjs(new Date()).format("YYYY-M-DD")
                                                    ? "text-blue-500 font-bold "
                                                    : ""
                                            }`}
                                            onClick={onHeaderClick}
                                        >
                                            {/* {x.getMonth()=== Date().getMonth()
                                        ? dayjs(x).format("D")
                                        : dayjs(x).format("M月D")} */}
                                            {x.getDate() !== 1  ? dayjs(x).format("D") : dayjs(x).format("M月D")}
                                        </div>

                                        {/* {cellNode[dayjs(x).format("YYYY-MM-DD")]} */}
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col  border-[4px] border-green-400 overflow-y-auto ">
                            <section data-role="header" className="flex h-[2rem] sticky top-0 align-self-start">
                                {displayDays.map((x, index) => {
                                    return (
                                        <div className=" flex-1 bg-zinc-100 pl-[0.5rem]  box-content border-zinc-200 border-[1px]">
                                            {["周日", "周一", "周二", "周三", "周四", "周五", "周六"][x.getDay()]}
                                            {dayjs(x).format("YYYY-MM-DD")}
                                        </div>
                                    );
                                })}
                            </section>
                            <section className="flex flex-col border  border-red-500 overflow-y-visible align-self-start ">
                                {displayDays.map((x, index) => {
                                    return (
                                        <div
                                            style={{ flexGrow: "0", height: "100px", border: "2px blue solid" }}
                                            key={index}
                                        >
                                            {"dddd"}
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export { MonthLarge, RangeType };
