"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Button } from "@radix-ui/themes";
import CountTime from "./CountTime";
import TestFingerPrintLogin from "./TestFingerPrintLogin";
import FingerPrintDialog from "./FingerPrintDialog";

function 指纹模块(props) {
    const { position, dutyType } = props;
    const [open, setOpen] = useState(false);

    const userList = [
        {
            username: "111",
            starTime: "2024-08-01 08:00",
            student: {
                username: "333",
                starTime: "2024-08-01 08:00",
            },
        },
        {
            username: "222",
            starTime: "2024-08-01  10:23",
        },
    ];

    return (
        <div className="flex flex-col items-center gap-2">
            <h2>{dutyType}</h2>
            <div className="w-[80px] h-[80px] border bg-yellow-300">
                <img src="" alt="岗位职责所在者的头像" />
            </div>
            <ul>
                {userList.map((item, index) => {
                    return (
                        <li key={index} className="flex flex-col">
                            <div>
                                <h4 className="inline-block font-black">
                                    {item.username}
                                    {item?.student && "(教员)"}：
                                </h4>
                                <CountTime startTime={item.starTime} />
                            </div>

                            <div className="ml-[0.5rem]">
                                {item?.student && (
                                    <>
                                        {`${item.student.username}(学员)`}：
                                        <CountTime startTime={item.student.starTime} />
                                    </>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
            <Button
                onClick={() => {
                    setOpen(true);
                }}
            >
                指纹
            </Button>
            <FingerPrintDialog
                open={open}
                setOpen={() => {
                    setOpen();
                }}
            />
        </div>
    );
}

export default 指纹模块;
