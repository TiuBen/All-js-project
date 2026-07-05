import React, { useEffect, useMemo } from "react";
import PositionCard from "./PositionCard";
import { useAppStore } from "@/store/app.store";
import { useStatisticsStore } from "@/store/statistics.store";

export default function PositionDuration() {
    const { positions } = useAppStore();
    const { selectedYear, selectedMonth } = useAppStore.getState();

    const { isPositionSummary, fetchPositionSummary } = useStatisticsStore();

    useEffect(() => {
        fetchPositionSummary();
    }, [selectedYear, selectedMonth]);

    if (isPositionSummary) {
        return <>loading</>;
    }

    return (
        <div className="flex flex-row flex-wrap gap-4 justify-start items-start content-start overflow-auto p-2">
            {positions
                .filter((i) => i.display === 1)
                .map((item, index) => {
                    return <PositionCard key={index} {...item} />;
                })}
        </div>
    );
}
