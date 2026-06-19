import React from "react";

function ToolBar() {
    return (
        <div>
            ToolBar
            <h2 className="flex flex-row gap-2 font-yahei font-semibold bg-green-300">
                {sub || ""} 进度{currentPage * pageSize}:{(currentPage + 1) * pageSize}/{data.count}题{" "}
            </h2>
        </div>
    );
}

export default ToolBar;
