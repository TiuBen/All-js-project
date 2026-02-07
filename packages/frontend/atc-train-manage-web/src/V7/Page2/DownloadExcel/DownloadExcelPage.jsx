import React, { useState, useEffect, useRef } from "react";
import { TabNav, Tabs } from "@radix-ui/themes";
import { FileDown } from "lucide-react";
import dayjs from "dayjs";
import { API_URL, FETCHER } from "../../../utils/const/Const";
import { BookX } from "lucide-react";
import { useLongPress } from "ahooks";

function DownloadExcel({
    fileName, // 下载的文件名
    startDate, // 开始日期
    endDate, // 结束日期
    needMonth, // 需要的月份
}) {
    const [exists, setExists] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const ref = useRef(null);

    // 组件加载时检查文件是否存在
    useEffect(() => {
        fetch(`${API_URL.files}/exists?fileName=${fileName}`)
            .then((res) => res.json())
            .then((data) => setExists(data.exists))
            .catch(() => setExists(false));
    }, [fileName]);

    // 下载文件
    const handleDownload = async () => {
        console.log("handleDownload");
        if (!exists) return;
        const res = await fetch(`${API_URL}/download?fileName=${fileName}`);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
    // 长按开始（发起重新生成）
    useLongPress(
        () => {
            console.log("长按开始（发起重新生成）");
            setRegenerating(true);
            const encodedFileName = encodeURIComponent(fileName);
            fetch(`${API_URL.files}/regenerate?fileName=${encodedFileName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate: startDate,
                    startTime: "00:00:01",
                    endDate: endDate,
                    endTime: "00:00:01",
                    needMonth: needMonth,
                }),
            })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    setRegenerating(false);
                    fetch(`${API_URL.files}/exists?fileName=${encodedFileName}`)
                        .then((res) => res.json())
                        .then((data) => setExists(data.exists))
                        .catch(() => setExists(false));
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        ref,
        {
            threshold: 800,
        }
    );

    return (
        <button
            type="button"
            ref={ref}
            onClick={handleDownload}

            className={`px-4 py-1 rounded border transition-all flex flex-row items-center justify-center gap-2
        ${exists ? "border-blue-500 text-blue-600 cur" : "border-gray-400 text-red-400 cursor-not-allowed"}
        ${regenerating ? "bg-red-100 animate-pulse shadow-[0_0_5px_#3b82f6] cursor-wait" : ""}
      `}
        >
            {regenerating ? "正在生成..." : exists ? <FileDown size={"1em"} /> : <BookX size={"1.5em"} color="red" />}

            <span className=" font-medium">{fileName}</span>
        </button>
    );
}

function DownloadExcelPage() {
    return (
        <>
            <div className="flex flex-col gap-2 flex-1 ">
                <div className="flex flex-row items-center px-4">
                    <h1 className=" self-center text-xl font-bold text-blue-700 text-center">
                        {dayjs().get("year")}年夜班次数统计
                    </h1>
                    {/* 撑空间用的 */}
                    <TabNav.Root style={{ visibility: "hidden" }}>
                        <TabNav.Link style={{ visibility: "hidden" }}></TabNav.Link>
                    </TabNav.Root>
                </div>
                <div className="grid grid-cols-4 gap-4 justify-center px-4">
                    {Array.from({ length: dayjs().month() + 1 }).map((_, index) => (
                        <DownloadExcel
                            key={index}
                            fileName={`${dayjs().get("year")}年${index + 1}月执勤.xlsx`}
                            needMonth={dayjs().set("month", index).format("YYYY-MM")}
                            startDate={dayjs().set("month", index).set("date", 1).format("YYYY-MM-DD")}
                            endDate={dayjs().set("month", index).add(1, "month").set("date", 1).format("YYYY-MM-DD")}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default DownloadExcelPage;

// const handleDownload = async () => {
//     setLoading(true);
//     try {
//         // 带文件名传递给后端
//         const res = await fetch(`${API_URL.excel}?fileName=${encodeURIComponent(fileName)}`, {
//             method: "GET",
//             headers: {
//                 Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//             },
//         });

//         if (res.status === 202) {
//             // 后端说还在处理 → 轮询
//             const { taskId } = await res.json();
//             await pollForFile(taskId);
//         } else if (res.ok) {
//             await triggerDownload(res, fileName);
//         } else {
//             throw new Error("下载失败");
//         }
//     } catch (err) {
//         console.error("Excel 下载失败:", err);
//     } finally {
//         setLoading(false);
//     }
// };

// const pollForFile = async (taskId) => {
//     let done = false;
//     while (!done) {
//         await new Promise((r) => setTimeout(r, 1000)); // 每 3 秒轮询
//         const res = await fetch(`${API_URL.excel}/status/${taskId}`);
//         if (res.ok) {
//             const blob = await res.blob();
//             await triggerDownload(blob, fileName);
//             done = true;
//         }
//     }
// };

// const triggerDownload = async (resOrBlob, fileName) => {
//     const blob = resOrBlob instanceof Response ? await resOrBlob.blob() : resOrBlob;
//     const href = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = href;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(href);
// };
