import React from "react";
import SeatCard from "./SeatCard";
import { useStatisticsStore } from "@/store/statistics.store";

function PositionCard({ position, dutyType }) {
    const { isPositionSummary, positionSummary } = useStatisticsStore();

    if (isPositionSummary) {
        return <div>loading...</div>;
    }

    const summary = positionSummary[position];
    return (
        <div className="border border-gray-200 rounded-lg flex flex-col items-center gap-2 p-2 self-stretch ">
            <h2 className="font-black text-xl">{position}</h2>

            <div className="flex flex-row gap-2 p-1">
                {dutyType ? (
                    <>
                        <SeatCard
                            dutyType="主班"
                            totalHours={summary?.main?.totalHours ?? 0}
                            count={summary?.main?.count ?? 0}
                            avgHours={summary?.main?.averageHours ?? 0}
                            minHours={summary?.main?.minHours ?? 0}
                            maxHours={summary?.main?.maxHours ?? 0}
                        />
                        <SeatCard
                            dutyType="副班"
                            totalHours={summary?.sub?.totalHours ?? 0}
                            count={summary?.sub?.count ?? 0}
                            avgHours={summary?.sub?.averageHours ?? 0}
                            minHours={summary?.main?.minHours}
                            maxHours={summary?.main?.maxHours}
                        />
                    </>
                ) : (
                    <SeatCard
                        dutyType={null}
                        totalHours={summary?.main?.totalHours ?? 0}
                        count={summary?.main?.count ?? 0}
                        avgHours={summary?.main?.averageHours ?? 0}
                        minHours={summary?.main?.minHours ?? 0}
                        maxHours={summary?.main?.maxHours ?? 0}
                    />
                )}
            </div>
        </div>
    );
}

export default PositionCard;
