import React, { useState, useEffect } from "react";
import { Dialog, Button } from "@radix-ui/themes";
import { useLocalStorageState } from "ahooks";
import { server, serverActions } from "../../lib/CONST";
import 指纹模块 from "./modules/指纹模块";

function Page() {
    const [position] = useLocalStorageState("position", { listenStorageChange: true });
    const [username] = useLocalStorageState("username", { listenStorageChange: true });

    // const [data, setData] = useState("");

    // useEffect(() => {
    //     fetch(
    //         server +
    //             "/duty?" +
    //             new URLSearchParams({
    //                 position: position,
    //             })
    //     )
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log(data);
    //             setData(data);
    //         });
    // }, []);

    // // 监听到席位变化的时候更新
    // useEffect(() => {
    //     fetch(
    //         server +
    //             "/duty?" +
    //             new URLSearchParams({
    //                 position: position,
    //             })
    //     )
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log(data);
    //             setData(data);
    //         });
    // }, [position]);

    return (
        <div className="flex flex-col items-center gap-4  m-auto">
            <h3 className="text-2xl font-bold">{position}</h3>
            <div className="flex flex-col  lg:flex-row items-center gap-4  m-auto">
                <指纹模块 position={position} dutyType="主班" />
                <指纹模块 position={position} dutyType="副班" />
            </div>
        </div>
    );
}

export { Page };
