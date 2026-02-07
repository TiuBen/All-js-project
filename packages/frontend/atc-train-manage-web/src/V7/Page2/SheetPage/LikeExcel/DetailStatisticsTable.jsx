import React, { useEffect, useState } from "react";
import { formatDecimal } from "../../../../utils/tools/formatDecimal";


function DetailStatisticsTable({dutyStatistics}) {
    return (
        <>
            <table>
                <thead>
                    <tr className="hover:bg-slate-400">
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">统计</td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">各席位总小时 </td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">白班小时 </td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">
                            夜班小时 <br /> (0000-0800)
                        </td>
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center">备注</td>
                    </tr>
                </thead>
                <tbody>
                    <tr className="hover:bg-slate-400">
                        <td className="border border-slate-600 px-1 text-nowrap text-sm text-center"> 带班主任席</td>{" "}
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalCommanderTime?.time)}
                        </td>{" "}
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalCommanderTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalCommanderTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">塔台管制席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTowerMainTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTowerMainTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTowerMainTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">塔台协调席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTowerSubTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTowerSubTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTowerSubTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">放行席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalDeliveryTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalDeliveryTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalDeliveryTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">地面席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalGroundTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalGroundTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalGroundTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">综合协调席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalZongheTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalZongheTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalZongheTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">现场调度席</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalAOCTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalAOCTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalAOCTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">见习</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalStudentTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalStudentTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalStudentTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">教员</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTeacherTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTeacherTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTeacherTime?.nightShift)}
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
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">各席位总小时</th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">白班小时</th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            夜班小时 <br /> (0000-0800)
                        </th>
                        <th className=" border border-slate-600 px-1 text-nowrap text-sm text-center">备注</th>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">席位</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(
                                dutyStatistics?.totalCommanderTime?.time +
                                    dutyStatistics?.totalTowerTime?.time +
                                    dutyStatistics?.totalGroundTime?.time +
                                    dutyStatistics?.totalDeliveryTime?.time +
                                    dutyStatistics?.totalZongheTime?.time
                            )}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(
                                dutyStatistics?.totalCommanderTime?.dayShift +
                                    dutyStatistics?.totalTowerTime?.dayShift +
                                    dutyStatistics?.totalGroundTime?.dayShift +
                                    dutyStatistics?.totalDeliveryTime?.dayShift +
                                    dutyStatistics?.totalZongheTime?.dayShift
                            )}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(
                                dutyStatistics?.totalCommanderTime?.nightShift +
                                    dutyStatistics?.totalTowerTime?.nightShift +
                                    dutyStatistics?.totalGroundTime?.nightShift +
                                    dutyStatistics?.totalDeliveryTime?.nightShift +
                                    dutyStatistics?.totalZongheTime?.nightShift
                            )}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">见习</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalStudentTime?.time)}
                            {/* {formatDecimal(totalTeacherTime?.time)} */}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalStudentTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalStudentTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">教员</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTeacherTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTeacherTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTeacherTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">现场调度</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalAOCTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalAOCTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalAOCTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                    <tr className="hover:bg-slate-400">
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">月度总小时</td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTime?.time)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTime?.dayShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center">
                            {formatDecimal(dutyStatistics?.totalTime?.nightShift)}
                        </td>
                        <td className=" border border-slate-600 px-1 text-nowrap text-sm text-center"></td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

export default DetailStatisticsTable;
