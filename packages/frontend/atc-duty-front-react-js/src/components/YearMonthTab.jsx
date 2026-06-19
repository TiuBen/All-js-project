import React from "react";
import dayjs from "dayjs";

const MIN_YEAR = 2025;
const MAX_YEAR = dayjs().get("year");
const MAX_MONTH = dayjs().get("month");

function YearMonthTab({
    year = dayjs().get("year"),
    yearTitle,
    onYearChange,
    month = dayjs().get("month"),
    onMonthChange,
}) {
    const canGoPrevYear = year > MIN_YEAR;
    const canGoNextYear = year < MAX_YEAR;
    const isCurrentYear = year === MAX_YEAR;

    const handleYearChange = (delta) => {
        const newYear = year + delta;
        if (newYear < MIN_YEAR || newYear > MAX_YEAR) return;
        onYearChange(newYear);
        if (isCurrentYear && month > MAX_MONTH) {
            onMonthChange(MAX_MONTH);
        }
    };

    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    return (
        <div className="w-full flex">
            <div className="group flex self-center items-center gap-1 transition-all">
                <button
                    disabled={!canGoPrevYear}
                    onClick={() => handleYearChange(-1)}
                    className="opacity-200 group-hover:opacity-200 p-1 hover:bg-blue-50 rounded-full transition-all cursor-pointer text-blue-600 active:scale-90 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                    title="上一年"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <div className="flex items-baseline">
                    <span className="text-2xl text-blue-600 font-bold tabular-nums">{year}</span>
                    <h2 className="text-2xl text-blue-600 font-bold ml-1 pointer-events-none">{yearTitle}</h2>
                </div>

                <button
                    disabled={!canGoNextYear}
                    onClick={() => handleYearChange(1)}
                    className="opacity-100 group-hover:opacity-200 p-1 hover:bg-blue-50 rounded-full transition-all cursor-pointer text-blue-600 active:scale-90 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                    title="下一年"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

            {months.map((label, index) => {
                const disabled = isCurrentYear && index > MAX_MONTH;
                return (
                    <div
                        key={index}
                        className={`flex-1 flex items-center justify-center border border-black text-center rounded-t-lg ${
                            disabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : index === month
                                    ? "bg-inherit font-extrabold text-blue-600 hover:cursor-pointer"
                                    : "bg-slate-200 hover:font-bold hover:cursor-pointer"
                        }`}
                        onClick={() => {
                            if (!disabled) onMonthChange(index);
                        }}
                    >
                        {label}
                    </div>
                );
            })}
        </div>
    );
}

export default YearMonthTab;
