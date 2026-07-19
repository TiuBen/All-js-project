import React, { useEffect, useState } from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
import DutyRecordDialog from "./Dialog/DutyRecordDialog";
import { useUserStore } from "@/store/user.store";
import { useAppStore } from "@/store/app.store";
import { useStatisticsStore } from "@/store/statistics.store";
import DetailStatisticsTable from "./LikeExcel/DetailStatisticsTable";
function Page() {
    const { selectedUser } = useUserStore();
    const { selectedMonth, selectedYear } = useAppStore();
    const { userDutyDurationStatistics, fetchUserDutyDurationStatistics } = useStatisticsStore();

    const {
        isDutyRecordsLoading,
        getDutyRecords,
        excelDutyRecords,
        isExcelDutyRecordsLoading,
        getSelectedYearMonthUserExcelRows,
        excelError,
        excelErrorType,
        clearExcelError,
        refreshExcelData,
    } = useDutyStore();

    // 是否展开 Excel
    const [showJsonData, setShowJsonData] = useState(false);

    /**
     * 年/月/用户变化
     * 自动读取 Excel
     */
    useEffect(() => {
        setShowJsonData(false);
        clearExcelError();

        if (!selectedYear || !selectedMonth || !selectedUser) {
            return;
        }

        getSelectedYearMonthUserExcelRows();
    }, [selectedYear, selectedMonth, selectedUser]);
    useEffect(() => {
        if (selectedUser) {
            fetchUserDutyDurationStatistics();
        }
    }, [selectedYear, selectedMonth, selectedUser]);

    /**
     * 获取执勤记录
     */
    useEffect(() => {
        if (selectedUser) {
            getDutyRecords();
        }
    }, [selectedUser]);

    const hasExcelData = Array.isArray(excelDutyRecords) && excelDutyRecords.length > 0;
    const hasError = !!excelError;

    const isButtonDisabled = !selectedUser || isExcelDutyRecordsLoading || (!hasExcelData && !hasError);

    const getButtonText = () => {
        if (!selectedUser) return "请选择用户";
        if (isExcelDutyRecordsLoading) return "读取Excel中...";
        if (hasError) {
            if (excelErrorType === "FILE_NOT_FOUND") return "未找到Excel文件";
            if (excelErrorType === "USER_NOT_FOUND") return "未找到用户记录";
            return "数据获取失败";
        }
        if (!hasExcelData) return "暂无记录";

        return showJsonData ? "隐藏Excel" : "查看Excel";
    };

    const getButtonStyle = () => {
        const baseStyle = "justify-self-center m-auto border px-4 py-2 rounded transition-colors";

        if (!selectedUser || isExcelDutyRecordsLoading) {
            return `${baseStyle} bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200`;
        }

        if (hasError) {
            return `${baseStyle} bg-red-600 text-white border-red-600 hover:bg-red-700 cursor-pointer`;
        }

        if (!hasExcelData) {
            return `${baseStyle} bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200`;
        }

        return `${baseStyle} bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer`;
    };

    const handleButtonClick = () => {
        if (hasError) {
            refreshExcelData();
            return;
        }
        setShowJsonData((v) => !v);
    };

    const renderExcelStatus = () => {
        if (!selectedUser) {
            return <div className="flex-1 text-gray-500 text-center py-8">请先选择用户</div>;
        }

        if (isDutyRecordsLoading) {
            return (
                <div className="flex-1 text-blue-500 text-center py-8">
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        加载执勤记录中...
                    </div>
                </div>
            );
        }

        if (isExcelDutyRecordsLoading) {
            return (
                <div className="flex-1 text-blue-500 text-center py-8">
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        读取Excel文件中...
                    </div>
                </div>
            );
        }

        if (hasError) {
            return (
                <div className="flex-1">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-red-800">
                                    {excelErrorType === "FILE_NOT_FOUND" && "Excel文件不存在"}
                                    {excelErrorType === "USER_NOT_FOUND" && "未找到用户记录"}
                                    {!excelErrorType && "数据获取失败"}
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{excelError}</p>
                                    {excelErrorType === "FILE_NOT_FOUND" && (
                                        <p className="mt-1 text-xs text-red-600">
                                            💡 提示：请先上传 {selectedYear}年{selectedMonth}月的Excel文件
                                        </p>
                                    )}
                                    {excelErrorType === "USER_NOT_FOUND" && (
                                        <p className="mt-1 text-xs text-red-600">
                                            💡 提示：请确认Excel中是否包含用户 "{selectedUser}" 的执勤记录
                                        </p>
                                    )}
                                    {excelErrorType === "READ_ERROR" && (
                                        <p className="mt-1 text-xs text-red-600">
                                            💡 提示：Excel文件格式可能有问题，请检查文件是否完整
                                        </p>
                                    )}
                                    {excelErrorType === "NETWORK_ERROR" && (
                                        <p className="mt-1 text-xs text-red-600">💡 提示：请检查网络连接后重试</p>
                                    )}
                                </div>
                                <button
                                    onClick={refreshExcelData}
                                    className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline"
                                >
                                    点击重试
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (!hasExcelData) {
            return (
                <div className="flex-1 text-gray-500 text-center py-8">
                    <svg
                        className="h-12 w-12 mx-auto text-gray-300 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    该用户暂无执勤记录
                </div>
            );
        }

        return <></>;
        // return <LikeExcel />;
    };

    return (
        <>
            <div className="flex flex-row">
                <YearMonthTab />
            </div>

            <div className="flex flex-row flex-nowrap m-2">
                <div className="flex-1 flex flex-row flex-nowrap justify-start items-start gap-2 overflow-auto flex-wrap min-h-0 cursor-pointer text-sm">
                    <div className="flex gap-2 flex-1 flex-row flex-nowrap">
                        <div className="flex">
                            <LikeExcel />
                        </div>
                        <div className="flex flex-col justify-items-start align-content-start">
                            {renderExcelStatus()}
                            {showJsonData && hasExcelData && (
                                <>
                                    <table>
                                        {/* 1. 渲染表头：取数组的第一个元素，获取所有的 key */}
                                        <thead className="bg-gray-100 sticky top-0 h-[2rem]">
                                            <tr>
                                                <th className="border border-slate-600 px-2 text-nowrap text-center ">
                                                    序号
                                                </th>
                                                {Object.keys(excelDutyRecords[0]).map((key) => (
                                                    <th
                                                        key={key}
                                                        className="border border-slate-600 px-2 text-nowrap text-center "
                                                    >
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        {/* 2. 渲染表体：遍历数组中的每一个对象 */}
                                        <tbody className="bg-gray-100 ">
                                            {excelDutyRecords.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="hover:bg-blue-50 transition-colors">
                                                    {/* 3. 遍历当前对象的所有 value */}
                                                    {
                                                        <td className="border border-slate-600 px-2 text-nowrap text-center">
                                                            {rowIndex + 1}
                                                        </td>
                                                    }
                                                    {Object.values(row).map((value, colIndex) => (
                                                        <td
                                                            key={colIndex}
                                                            className="border border-slate-600 px-2 text-nowrap text-center"
                                                        >
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    </div>

                    <div className=" justify-self-end align-self-end">
                        <DetailStatisticsTable dutyStatistics={userDutyDurationStatistics} />
                    </div>
                </div>

                <div className="flex flex-col ml-4">
                    <UserRadioButtonList />

                    <button onClick={handleButtonClick} disabled={isButtonDisabled} className={getButtonStyle()}>
                        {getButtonText()}
                    </button>
                </div>
            </div>

            <DutyRecordDialog />
        </>
    );
}

export default Page;
