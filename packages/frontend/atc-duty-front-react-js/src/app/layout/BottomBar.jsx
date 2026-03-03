import React from "react";
import { BadgeInfo } from "lucide-react";

function BottomBar() {
    return (
        <div className="flex flex-row h-full items-center justify-end  flex-1 bg-blue-800 text-white">
            <h3 className="text-sm mx-4 font-bold  flex flex-row gap-1 items-center ">
                <BadgeInfo size={"1rem"} /> <label className=" font-medium ">软件版本v0.2（2026年02月开发）</label>
            </h3>
        </div>
    );
}

export default BottomBar;
