import React from "react";

function DetailStatisticsTable({ dutyStatistics }) {
    // const {}=useUserStore();

    return (
        <>
            <table>
                <thead>
                    <tr className="hover:bg-slate-400">
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">统计</td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">
                            <div>
                                <div>各席位</div>
                                <div>总小时</div>
                            </div>
                        </td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">白班小时 </td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">
                            夜班小时 <br /> (0000-0800)
                        </td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">备注</td>
                    </tr>
                </thead>
                <tbody>
                    <tr className="hover:bg-slate-400">
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center"> 带班主任席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalCommanderTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalCommanderTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalCommanderTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">塔台管制席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTowerMainTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTowerMainTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTowerMainTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">塔台协调席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTowerSubTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTowerSubTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTowerSubTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">放行席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalDeliveryTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalDeliveryTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalDeliveryTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">地面席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalGroundTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalGroundTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalGroundTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">综合协调席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalZongheTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalZongheTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalZongheTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">现场调度席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalAOCTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalAOCTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalAOCTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">见习</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalStudentTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalStudentTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalStudentTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">教员</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTeacherTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTeacherTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTeacherTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center" colSpan="5">
                            月度总小时统计
                        </th>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">统计</th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            <div>
                                <div>各席位</div>
                                <div>总小时</div>
                            </div>
                        </th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">白班小时</th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            夜班小时 <br /> (0000-0800)
                        </th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">备注</th>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">管制时间</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalPositionTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalPositionTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalPositionTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">见习</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalStudentTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalStudentTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalStudentTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">教员</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTeacherTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTeacherTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTeacherTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">现场调度</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalAOCTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalAOCTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalAOCTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">月度总小时</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTime?.time || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTime?.dayShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {dutyStatistics?.totalTime?.nightShift || ""}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

export default DetailStatisticsTable;
