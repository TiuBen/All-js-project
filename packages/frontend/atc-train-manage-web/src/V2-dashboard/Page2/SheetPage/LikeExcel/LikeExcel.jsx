import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocalStorageState } from "ahooks";
import dayjs from "dayjs";
import useSWR, { mutate } from "swr";
import { SERVER_URL, FETCHER } from "@utils";

const StyledLikeExcel = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-wrap: nowrap;

    td {
        padding: 0.2rem;
        border: 1px solid black;

        &:hover {
            background-color: #e0e0e0;
        }
    }

    th {
        padding: 0.2rem;
        border: 1px solid black;
    }
`;


function LikeExcel({ selectedMonth, onClick, dutyRows, dutyStatics }) {
    return (
        <div className="relative  flex flex-col gap-1 text-wrap">
            <div className="w-full flex ">
                {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map(
                    (x, index) => {
                        return (
                            <div
                                key={index}
                                className={`flex-1 border border-black text-center rounded-t-lg hover:font-bold ${
                                    index === selectedMonth ? " bg-inherit font-extrabold  " : "bg-slate-200"
                                }`}
                                onClick={() => {
                                    onClick(index);
                                }}
                            >
                                {x}
                            </div>
                        );
                    }
                )}
            </div>
            <div className="flex flex-row justify-start items-start">
                <StyledLikeExcel>
                    <thead>
                        <tr>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">日 期</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">岗 位</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">上岗时刻</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">交接班</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">离岗时刻</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">时段工作小时</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">白班小时</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center">
                                夜班小时 (0000-0800)
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {dutyRows.map((x, index) => {
                            return (
                                <tr key={index} className="text-sm font-bold">
                                    <td className="border border-slate-600 px-2 text-nowrap text-center">
                                        {dayjs(x.inTime).format("YYYY-MM-DD")}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap">
                                        <span
                                            className={`text-xs italic ml-2 ${
                                                x.relatedDutyTableRowId && x.position !== "领班" ? "bg-slate-400" : ""
                                            }  ${x.roleType ? "bg-slate-400 line-through" : ""} `}
                                        >
                                            {x.position}
                                        </span>
                                        {x.roleType && <span className="text-xs italic ml-2   ">见习</span>}
                                        {x.relatedDutyTableRowId && (
                                            <span
                                                className={`text-xs italic ml-2 ${
                                                    x.position === "领班" ? "bg-slate-400 line-through" : ""
                                                }`}
                                            >
                                                教员
                                            </span>
                                        )}
                                        {x.dutyType === "副班" && <span className="text-xs  ml-2   ">(副班)</span>}
                                    </td>
                                    <td
                                        className={`border border-slate-600 px-2 text-nowrap text-center ${
                                            dayjs(x.inTime).month() !== selectedMonth ? "bg-red-400" : " "
                                        }`}
                                    >
                                        {dayjs(x.inTime).format("YYYY-MM-DD HH:mm:ss")}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center">
                                        {x.outTime !== null ? "完成" : ""}
                                    </td>
                                    <td
                                        className={`border border-slate-600 px-2 text-nowrap text-center ${
                                            dayjs(x.outTime).month() !== selectedMonth ? "bg-red-400" : " "
                                        }`}
                                    >
                                        {dayjs(x.outTime).format("YYYY-MM-DD HH:mm:ss")}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center">
                                        {Math.floor(
                                            dayjs(x.outTime).diff(dayjs(x.inTime, "YYYY-MM-DD HH:mm:ss"), "h", true) *
                                                100
                                        ) / 100}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center">
                                        {x.dayShift === 0 ? "" : x.dayShift}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center">
                                        {x.nightShift === 0 ? "" : x.nightShift}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </StyledLikeExcel>
                <div className="text-wrap">
                    <StyledLikeExcel>
                        <thead>
                            <tr>
                                <th>统计</th>
                                <th>各席位总小时</th>
                                <th>白班小时</th>
                                <th>
                                    夜班小时 <br /> (0000-0800)
                                </th>
                                <th>备注</th>
                            </tr>
                        </thead>
                        <tbody className="text-nowrap">
                            <tr>
                                <td>带班主任席执勤小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalCommanderTime?.dayShift +
                                            dutyStatics?.totalCommanderTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalCommanderTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalCommanderTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>机场管制席执勤小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalTowerMainTime?.dayShift +
                                            dutyStatics?.totalTowerMainTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalTowerMainTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalTowerMainTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>机场协调席执勤小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalTowerSubTime?.dayShift +
                                            dutyStatics?.totalTowerSubTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalTowerSubTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalTowerSubTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>放行席执勤小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalDeliveryTime?.dayShift +
                                            dutyStatics?.totalDeliveryTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalDeliveryTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalDeliveryTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>地面席执勤小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalGroundTime?.dayShift +
                                            dutyStatics?.totalGroundTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalGroundTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalGroundTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>进近管制席执勤小时</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>进近协调席执勤小时</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>综合协调席小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalAOCTime?.dayShift + dutyStatics?.totalAOCTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalAOCTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalAOCTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>见习管制员小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalStudentTime?.dayShift +
                                            dutyStatics?.totalStudentTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalStudentTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalStudentTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>管制教员席小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalTeacherTime?.dayShift +
                                            dutyStatics?.totalTeacherTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalTeacherTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalTeacherTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th colSpan="5">月度总小时统计</th>
                            </tr>
                            <tr>
                                <th>统计</th>
                                <th>各席位总小时</th>
                                <th>白班小时</th>
                                <th>夜班小时 (0000-0800)</th>
                                <th>备注</th>
                            </tr>
                            <tr>
                                <td>席位执勤小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalCommanderTime?.dayShift +
                                            dutyStatics?.totalCommanderTime?.nightShift +
                                            dutyStatics?.totalTowerMainTime?.dayShift +
                                            dutyStatics?.totalTowerMainTime?.nightShift +
                                            dutyStatics?.totalTowerSubTime?.dayShift +
                                            dutyStatics?.totalTowerSubTime?.nightShift +
                                            dutyStatics?.totalGroundTime?.dayShift +
                                            dutyStatics?.totalGroundTime?.nightShift +
                                            dutyStatics?.totalDeliveryTime?.dayShift +
                                            dutyStatics?.totalDeliveryTime?.nightShift +
                                            dutyStatics?.totalAOCTime?.dayShift +
                                            dutyStatics?.totalAOCTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>
                                    {Math.round(
                                       (dutyStatics?.totalCommanderTime?.dayShift +
                                        dutyStatics?.totalTowerMainTime?.dayShift +
                                        dutyStatics?.totalTowerSubTime?.dayShift +
                                        dutyStatics?.totalGroundTime?.dayShift +
                                        dutyStatics?.totalDeliveryTime?.dayShift +
                                        dutyStatics?.totalAOCTime?.dayShift) *
                                        100
                                    ) / 100}
                                </td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalCommanderTime?.nightShift +
                                            dutyStatics?.totalTowerMainTime?.nightShift +
                                            dutyStatics?.totalTowerSubTime?.nightShift +
                                            dutyStatics?.totalGroundTime?.nightShift +
                                            dutyStatics?.totalDeliveryTime?.nightShift +
                                            dutyStatics?.totalAOCTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>见习管制员小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalStudentTime?.dayShift +
                                            dutyStatics?.totalStudentTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalStudentTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalStudentTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>管制教员小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalTeacherTime?.dayShift +
                                            dutyStatics?.totalTeacherTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>{Math.round(dutyStatics?.totalTeacherTime?.dayShift * 100) / 100}</td>
                                <td>{Math.round(dutyStatics?.totalTeacherTime?.nightShift * 100) / 100}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>月度总小时</td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalCommanderTime?.dayShift +
                                            dutyStatics?.totalCommanderTime?.nightShift +
                                            dutyStatics?.totalTowerMainTime?.dayShift +
                                            dutyStatics?.totalTowerMainTime?.nightShift +
                                            dutyStatics?.totalTowerSubTime?.dayShift +
                                            dutyStatics?.totalTowerSubTime?.nightShift +
                                            dutyStatics?.totalGroundTime?.dayShift +
                                            dutyStatics?.totalGroundTime?.nightShift +
                                            dutyStatics?.totalDeliveryTime?.dayShift +
                                            dutyStatics?.totalDeliveryTime?.nightShift +
                                            dutyStatics?.totalTeacherTime?.dayShift +
                                            dutyStatics?.totalTeacherTime?.nightShift +
                                            dutyStatics?.totalStudentTime?.dayShift +
                                            dutyStatics?.totalStudentTime?.nightShift +
                                            dutyStatics?.totalAOCTime?.dayShift +
                                            dutyStatics?.totalAOCTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalCommanderTime?.dayShift +
                                            dutyStatics?.totalTowerMainTime?.dayShift +
                                            dutyStatics?.totalTowerSubTime?.dayShift +
                                            dutyStatics?.totalGroundTime?.dayShift +
                                            dutyStatics?.totalDeliveryTime?.dayShift +
                                            dutyStatics?.totalTeacherTime?.dayShift +
                                            dutyStatics?.totalStudentTime?.dayShift +
                                            dutyStatics?.totalAOCTime?.dayShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td>
                                    {Math.round(
                                        (dutyStatics?.totalCommanderTime?.nightShift +
                                            dutyStatics?.totalTowerMainTime?.nightShift +
                                            dutyStatics?.totalTowerSubTime?.nightShift +
                                            dutyStatics?.totalGroundTime?.nightShift +
                                            dutyStatics?.totalDeliveryTime?.nightShift +
                                            dutyStatics?.totalTeacherTime?.nightShift +
                                            dutyStatics?.totalStudentTime?.nightShift +
                                            dutyStatics?.totalAOCTime?.nightShift) *
                                            100
                                    ) / 100}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </StyledLikeExcel>
                </div>
            </div>
        </div>
    );
}

export default LikeExcel;
