import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { SERVER_URL } from "@utils";
import Position from "./PositionSeatStaff/Position.jsx";


const fetcher = (...args) => fetch(...args).then((res) => res.json());
function DutyPage() {
    const { data, error, isLoading } = useSWR(`${SERVER_URL}/query/positions`, fetcher);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;

    return (
        <div className="flex flex-row flex-wrap gap-4 justify-start items-start  content-start overflow-auto p-2">
            {data.map((item, index) => {
                if (item.display) {
                    return <Position key={index} {...item} />;
                }
               
            })}
        </div>
    );
}

export default DutyPage;
