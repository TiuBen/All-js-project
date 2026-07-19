import React, { useState, useRef } from "react";
import { TabNav } from "@radix-ui/themes";
import YearMonthTab from "../../components/YearMonthTab";
import { Outlet } from "react-router-dom";
// import { useAppStore } from "../../store/app.store";
import { http } from "@/service/http";
import { useAppStore } from "@/store/app.store";
import { useDutyStore } from "@/store/duty.store";

const ALLOWED_EXCEL_TYPES = [".xls", ".xlsx", ".xlsm"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 限制

function uploadDutyExcel(file, extraData) {
    const formData = new FormData();

    // 1. 将文件放入 FormData 中，key 必须与后端接收的字段名一致（例如 'file'）
    formData.append("file", file);

    // 2. 将 store 中的额外属性（如 username 等）追加到 FormData 中
    if (extraData) {
        Object.entries(extraData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
    }

    // 3. 发起 POST 请求
    // 注意：使用 FormData 时，千万不要手动设置 Content-Type: multipart/form-data
    // axios 会自动识别并生成包含 boundary 的 header
    return http.post("/file", formData);
}

function Page() {
    const [uploadMsg, setUploadMsg] = useState("");
    const [msgType, setMsgType] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const { selectedYear, selectedMonth } = useAppStore();

    const { excelDutyRecords, isExcelDutyRecordsLoading, getSelectedYearMonthUserExcelRows } = useDutyStore();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 1. 前端校验文件后缀
        const fileName = file.name.toLowerCase();
        const isValidExcel = ALLOWED_EXCEL_TYPES.some((ext) => fileName.endsWith(ext));
        if (!isValidExcel) {
            setUploadMsg("❌ 格式错误：仅支持 .xls, .xlsx, .xlsm 格式的 Excel 文件！");
            setMsgType("error");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        // 2. 前端校验文件大小 (5MB)
        if (file.size > MAX_FILE_SIZE) {
            setUploadMsg("❌ 文件过大：请上传 5MB 以内的 Excel 文件！");
            setMsgType("error");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        // 2. 开始上传
        setIsUploading(true);
        setUploadMsg("⏳ 正在上传文件...");
        setMsgType("success");

        try {
            // 将文件和 store 里的 username 一起传给接口
            // 核心逻辑：在前端拼接文件名
            const ext = fileName.substring(fileName.lastIndexOf("."));
            const newFilename = `${selectedYear}-${selectedMonth}${ext}`;

            // 使用 File 构造器重新生成文件对象，替换原有的 name 属性
            const renamedFile = new File([file], newFilename, { type: file.type });

            const res = await uploadDutyExcel(renamedFile, {
                month: selectedMonth,
                year: selectedYear,
            });

            setUploadMsg(`✅ 成功上传：${newFilename}`);
            console.log("后端返回结果:", res);
        } catch (err) {
            setUploadMsg("❌ 上传失败：" + (err.response?.data?.message || "网络异常"));
            setMsgType("error");
        } finally {
            setIsUploading(false);
            // 清空 input，允许重新选择
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    return (
        <div className="flex flex-col gap-2">
            <YearMonthTab />
            <div className="flex items-center justify-center w-full">
                <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200 ${
                        isUploading ? "pointer-events-none opacity-60" : ""
                    }`}
                >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                    </svg>
                    <p className="text-sm text-gray-500">
                        <span className="font-semibold text-blue-600">
                            {isUploading ? "上传中..." : "点击上传 Excel"}
                        </span>
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".xls, .xlsx, .xlsm"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </div>

            {uploadMsg && (
                <p className={`mt-2 text-sm text-center ${msgType === "error" ? "text-red-500" : "text-green-600"}`}>
                    {uploadMsg}
                </p>
            )}
        </div>
    );
}

export default Page;
