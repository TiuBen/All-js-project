import React from "react";
import { BadgeInfo } from "lucide-react";

function BottomBar() {
    return (
        <div className="flex flex-row h-full items-center justify-end  flex-1 bg-blue-800 text-white">
            <h3 className="text-sm mx-4 font-bold  flex flex-row gap-1 items-center ">
                <BadgeInfo size={"1rem"} /> 软件版本v0.1
            </h3>
        </div>
    );
}

export default BottomBar;
