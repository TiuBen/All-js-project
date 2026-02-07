"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Avatar } from "../../../components/Avatar";

dayjs.extend(duration);

function CountTime(props) {
    const { startTime = "2024-08-01 08:00" } = props;
    const date1 = dayjs(startTime);

    const [inDutyTime, setInDutyTime] = useState(dayjs.duration(dayjs(Date.now()).diff(date1)).format("H小时m分"));
    const [isOver2Hours, setIsOver2Hours] = useState(false);

    useEffect(() => {
        const second = setInterval(() => {
            const _inDutyTime = dayjs.duration(dayjs(Date.now()).diff(date1)).format("H小时m分");
            setInDutyTime(_inDutyTime);

            if (parseInt(dayjs.duration(dayjs(Date.now()).diff(date1)).format("H")) >= 2) {
                setIsOver2Hours(true);
            }
        }, 60*1000);

        return () => clearInterval(second);
    }, []);

    return (
        <div className={`w-[8rem] inline-block  text-sm italic ${isOver2Hours ? " text-red-600" : ""}`}>
            <h4> {inDutyTime}</h4>
        </div>
    );
}

export default CountTime;
