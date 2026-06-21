import React from "react";
import SeatCard from "./SeatCard";

function PositionCard({
    position,
    dutyType,
    mainTotalHours,
    mainCount,
    mainAvgHours,
    subTotalHours,
    subCount,
    subAvgHours,
}) {
    return (
        <div className="border border-gray-200 rounded-lg flex flex-col items-center gap-2 p-2 self-stretch ">
            <h2 className="font-black text-xl">{position}</h2>
            <div className="flex flex-row gap-2 p-1">
                {dutyType ? (
                    <>
                        {["主班", "副班"].map((x, index) => {
                            return (
                                <SeatCard
                                    dutyType={x}
                                    key={index}
                                    totalHours={mainTotalHours}
                                    count={mainCount}
                                    avgHours={mainAvgHours}
                                />
                            );
                        })}
                    </>
                ) : (
                    <SeatCard dutyType={null} totalHours={mainTotalHours} count={mainCount} avgHours={mainAvgHours} />
                )}
            </div>
        </div>
    );
}

export default PositionCard;
