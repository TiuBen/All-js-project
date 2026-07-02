import React, { useEffect } from "react";
import dayjs from "dayjs";
import { useOutletContext } from "react-router-dom";
import { useStatisticsStore } from "../../../store/statistics.store";
import PositionCard from "./PositionCard";
import { useAppStore } from "@/store/app.store";

export default function PositionDuration() {
    const { year, month } = useOutletContext();
    const { positionStatistics, fetchPositionStatistics } = useStatisticsStore();
    const { positions } = useAppStore();

    const startDate = dayjs().year(year).month(month).date(1).format("YYYY-MM-DD");
    const endDate = dayjs()
        .year(year)
        .month(month + 1)
        .date(1)
        .format("YYYY-MM-DD");

    useEffect(() => {
        fetchPositionStatistics(startDate, endDate);
        


    }, [startDate, endDate, fetchPositionStatistics]);

    return (
        <div className="flex flex-row flex-wrap gap-4 justify-start items-start content-start overflow-auto p-2">
            {positions.map((item, index) => (
                <PositionCard key={index} {...item} />
            ))}
        </div>
    );
}
