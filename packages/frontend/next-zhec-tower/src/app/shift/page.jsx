"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Button } from "@radix-ui/themes";
import { useLocalStorageState } from "ahooks";
import { server, serverActions } from "@/lib/CONST";
import 指纹模块 from "./modules/指纹模块";

function page() {
    const [position] = useLocalStorageState("position", { listenStorageChange: true });

    const [open, setOpen] = useState(false);

    const [data, setData] = useState("");

    useEffect(() => {
        console.log(position);
    }, [position]);

    useEffect(() => {
        fetch(server, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: serverActions.GetWhoIsOnDuty,
                position: position,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setData(data);
            });
    }, [position]);

    return (
        <div className="flex flex-1 flex-col h-full items-center justify-center gap-4">
            {JSON.stringify(data)}
            <div className="flex flex-1 flex-row">
                    <指纹模块 position={position} dutyType="主班" />
                    <指纹模块 position={position} dutyType="副班" />
                <div>本席位全天执勤时间 04：00</div>
            </div>
        </div>
    );
}

export default page;
