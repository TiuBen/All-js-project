import React, { useEffect } from "react";
import dayjs from "dayjs";
import { useOutletContext } from "react-router-dom";
import { useDutyStore } from "../../store/duty.store";
import { formatDecimal } from "../../util/formatDecimal";
import { useAppStore } from "../../store/app.store";

export default function PositionDuration() {
    const { year, month } = useOutletContext();
    const { positions, positionsLoading } = useAppStore();

    const { positionStatistics, fetchPositionStatistics } = useDutyStore();

    const startDate = dayjs().year(year).month(month).date(1).format("YYYY-MM-DD");
    const endDate = dayjs()
        .year(year)
        .month(month + 1)
        .date(1)
        .format("YYYY-MM-DD");

    useEffect(() => {
        fetchPositionStatistics(startDate, endDate);
    }, [startDate, endDate, fetchPositionStatistics]);

    return (
        <div className="flex flex-row flex-wrap gap-4 justify-start items-start content-start overflow-auto p-2">
            {positions.map((item, index) => (
                <div
                    key={index}
                    className="flex flex-col border border-slate-400 rounded-lg overflow-hidden min-w-[14rem]"
                >
                    <div className="bg-blue-500 text-white px-3 py-1 font-bold text-center">{item.position}</div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border border-slate-300 px-2 py-1">类型</th>
                                <th className="border border-slate-300 px-2 py-1">总小时</th>
                                <th className="border border-slate-300 px-2 py-1">人次</th>
                                <th className="border border-slate-300 px-2 py-1">平均小时</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-slate-50">
                                <td className="border border-slate-300 px-2 py-1 text-center font-medium">主班</td>
                                <td className="border border-slate-300 px-2 py-1 text-center">
                                    {formatDecimal(item.mainTotalHours)}
                                </td>
                                <td className="border border-slate-300 px-2 py-1 text-center">{item.mainCount}</td>
                                <td className="border border-slate-300 px-2 py-1 text-center">
                                    {formatDecimal(item.mainAvgHours)}
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="border border-slate-300 px-2 py-1 text-center font-medium">副班</td>
                                <td className="border border-slate-300 px-2 py-1 text-center">
                                    {formatDecimal(item.subTotalHours)}
                                </td>
                                <td className="border border-slate-300 px-2 py-1 text-center">{item.subCount}</td>
                                <td className="border border-slate-300 px-2 py-1 text-center">
                                    {formatDecimal(item.subAvgHours)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
