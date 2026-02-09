import React from "react";
import { useOnDuty } from "@/hooks/useOnDuty";
function dashboard() {
    const { list, loading, leave } = useOnDuty();
    if (loading) {
        return <div className="text-sm text-gray-500">加载中…</div>;
    }

    if (!list.length) {
        return <div className="text-sm text-gray-400">当前无人执勤</div>;
    }

    return (
        <div>
            dashboard
            {list.map((item, index) => {
                return (
                    <div key={index}>
                        <div>{item.user.name}</div>
                        <div>{item.position.name}</div>
                        <div>{item.startTime}</div>
                        <div>{item.endTime}</div>
                        <button onClick={() => leave(item.id)}>离开</button>
                    </div>
                );
            })}
        </div>
    );
}

export default dashboard;
