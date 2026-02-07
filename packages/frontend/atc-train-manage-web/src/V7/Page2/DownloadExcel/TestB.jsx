import React, { useEffect } from "react";
import { API_URL, FETCHER } from "../../../utils/const/Const";

export default function TestB({ fileName = "export.xlsx" }) {
    // SSE 连接
    useEffect(() => {
        const evtSource = new EventSource(API_URL.events);

        evtSource.onmessage = (event) => {
            console.log("SSE 收到:", event.data);
        };

        return () => evtSource.close();
    }, []); // 只执行一次

    // 普通点击
    const handleClick = () => {
        console.log("✅ handleClick 触发");
    };

    // 鼠标按下
    const handleMouseDown = () => {
        console.log("✅ handleMouseDown 触发, 文件名:", fileName);
    };

    return (
        <div>
            <h2>测试按钮 + SSE</h2>
            <button
                onClick={handleClick}
                className="border rounded px-4 py-2 bg-blue-500 text-white"
                onMouseDown={handleMouseDown}
                style={{ padding: "10px 20px", marginTop: "10px" }}
            >
                下载 {fileName}
            </button>
        </div>
    );
}
