import React, { useEffect } from "react";
import { useAppStore } from "../../store/app.store";
import { useDutyStore } from "../../store/duty.store";
import Position from "./Position.jsx";

function Page() {
    const { positions, positionsLoading } = useAppStore();
    const { fetchOnDuty } = useDutyStore();

    useEffect(() => {
        fetchOnDuty();
    }, [fetchOnDuty]);

    if (positionsLoading) return <div>ffff Loading...</div>;
    return (
        <div className="flex flex-row flex-wrap gap-4 justify-start items-start  content-start overflow-auto p-2">
            {positions
                .filter((i) => i)
                .map((item) => (
                    <Position key={item.id} position={item.position} dutyType={item.dutyType} />
                    // <div key={item.id}>{JSON.stringify(item)}</div>
                ))}
        </div>
    );
}

export default Page;
