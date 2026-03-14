import React from "react";
import { useStatisticsStore } from "@/store/statistics.store";
import dayjs from "dayjs";

function YearMonthTab({
    year = dayjs().get("year"),
    yearTitle,
    onYearChange,
    month = dayjs().get("month"),
    onMonthChange,
}) {
    return (
        <div className="w-full flex  ">
            <div className="group flex  self-center items-center gap-1  transition-all">
                {/* 左切换按钮：默认透明度 0，Group Hover 时变为 100 */}
                <button
                    disabled={year <= 2025}
                    onClick={() => onYearChange(year - 1)}
                    className="opacity-200 group-hover:opacity-200 p-1 hover:bg-blue-50 rounded-full transition-all cursor-pointer text-blue-600 active:scale-90 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                    title="上一年"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                {/* 年份展示：使用 tabular-nums 防止数字切换时抖动 */}
                <div className="flex items-baseline">
                    <span className="text-2xl text-blue-600 font-bold tabular-nums">{year}</span>
                    <h2 className="text-2xl text-blue-600 font-bold ml-1 pointer-events-none">{yearTitle}</h2>
                </div>

                {/* 右切换按钮 */}
                <button
                    disabled={year >= dayjs().get("year")}
                    onClick={() => onYearChange(year + 1)}
                    className="opacity-100 group-hover:opacity-200 p-1 hover:bg-blue-50 rounded-full transition-all cursor-pointer text-blue-600 active:scale-90 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                    title="下一年"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

            {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map((x, index) => {
                return (
                    <div
                        key={index}
                        className={`flex-1 flex items-center justify-center border border-black text-center rounded-t-lg hover:font-bold hover:cursor-pointer ${
                            index === month ? " bg-inherit font-extrabold text-blue-600 " : " bg-slate-200"
                        }`}
                        onClick={() => {
                            onMonthChange(index);
                        }}
                    >
                        {x}
                    </div>
                );
            })}
        </div>
    );
}

export default YearMonthTab;
