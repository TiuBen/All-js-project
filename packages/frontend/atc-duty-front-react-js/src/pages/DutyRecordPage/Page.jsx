import React, { useEffect, useState } from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
import DutyRecordDialog from "./Dialog/DutyRecordDialog";
import { useUserStore } from "@/store/user.store";
import { useAppStore } from "@/store/app.store";
import { http } from "@/service/http"; // 引入你的 http 实例

function Page() {
    const { selectedUser } = useUserStore();
    const { selectedMonth, selectedYear } = useAppStore();
    const { isDutyRecordsLoading, getDutyRecords } = useDutyStore();

    // 状态：Excel 文件是否存在
    const [excelExists, setExcelExists] = useState(false);
    const [isCheckingExcel, setIsCheckingExcel] = useState(false);

    const { excelDutyRecords, isExcelDutyRecordsLoading, getSelectedYearMonthUserExcelRows } = useDutyStore();

    useEffect(() => {
        // 只有当三个条件都满足时才去拉取 Excel 数据
        if (selectedUser && selectedYear && selectedMonth) {
            getSelectedYearMonthUserExcelRows();
        }
    }, [selectedUser, selectedYear, selectedMonth]);

    useEffect(() => {
        if (selectedUser) {
            getDutyRecords();
        }
    }, [selectedUser]);

    // 2. 检查 Excel 文件是否存在
    useEffect(() => {
        if (!selectedYear || !selectedMonth) return;

        const checkFile = async () => {
            setIsCheckingExcel(true);
            try {
                const res = await http.get("/file/check-excel", {
                    params: { year: selectedYear, month: selectedMonth },
                });
                setExcelExists(res.exists);
            } catch (err) {
                console.error("检查Excel文件失败:", err);
                setExcelExists(false);
            } finally {
                setIsCheckingExcel(false);
            }
        };

        checkFile();
    }, [selectedYear, selectedMonth]); // 当年月变化时重新检查

    // 按钮点击事件处理
    const handleLoadExcelClick = () => {
        if (!selectedUser) {
            alert("请先选择一个用户！");
            return;
        }
        // 点击后触发获取当前选中用户的 Excel 行数据
        getSelectedYearMonthUserExcelRows();
    };

    // 按钮是否处于禁用状态（检查中、未选用户、或Excel不存在时禁用）
    const isButtonDisabled = isCheckingExcel || !selectedUser || !excelExists;

    return (
        <div>
            <div className="flex flex-row">
                <YearMonthTab />
            </div>
            <div className="flex flex-row flex-nowrap m-2">
                {selectedUser === null ? (
                    <div className="flex-1">请选择用户</div>
                ) : isDutyRecordsLoading ? (
                    <div className="flex-1">加载中...</div>
                ) : (
                    <LikeExcel />
                )}
                {/* <UserRadioButtonList changeSelectedUser={(x) => setQuery({ ...query, selectedUser: x })} /> */}
                <div className="flex flex-col">
                    <UserRadioButtonList />

                    {/* 改造为 button 标签 */}
                    <button
                        onClick={handleLoadExcelClick}
                        disabled={isButtonDisabled}
                        className={`justify-self-center m-auto border px-4 py-2 rounded transition-colors
                            ${
                                isButtonDisabled
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
                                    : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer"
                            }
                        `}
                    >
                        {isCheckingExcel
                            ? "检查中..."
                            : !selectedUser
                            ? "请先选择用户"
                            : excelExists
                            ? "加载对应Excel"
                            : "对比Excel记录"}
                    </button>
                </div>
            </div>
            <DutyRecordDialog />
        </div>
    );
}

export default Page;
