import React from "react";
import { TowerControl, PlaneTakeoff } from "lucide-react";
function TopNav() {
    return (
        <div className="flex flex-row h-full items-center justify-between  flex-1">
            <h3 className="text-xl mx-4 font-bold  flex gap-2">
                <PlaneTakeoff />
                湖北国际物流机场空管服务公司
            </h3>

            <h3 className="text-xl mx-4 font-bold flex gap-2">
                <TowerControl />
                管制执勤统计 
            </h3>
        </div>
    );
}

export default TopNav;
