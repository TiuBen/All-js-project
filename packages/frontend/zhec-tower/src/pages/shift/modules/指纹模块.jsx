"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Button } from "@radix-ui/themes";
import CountTime from "./CountTime";
import FingerPrintDialog from "./FingerPrintDialog";
import { server, serverActions } from "../../../lib/CONST";
import ErrorDialog from "./ErrorDialog";
import Avatar from "../../../components/Avatar";
// const _userList = [
//     {
//         username: "111",
//         starTime: "2024-08-01 08:00",
//         student: {
//             username: "333",
//             starTime: "2024-08-01 08:00",
//         },
//     },
//     {
//         username: "222",
//         starTime: "2024-08-01  10:23",
//     },
// ];

var count = 0;
function 指纹模块(props) {
    const { position, dutyType } = props;
    const [userList, setUserList] = useState(null);

    const [open, setOpen] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [response, setResponse] = useState({});

    //第一次加载页面时候 获取
    useEffect(() => {
        fetch(
            server +
                "/duty?" +
                new URLSearchParams({
                    position: position,
                    dutyType: dutyType,
                })
        )
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.error) {
                    setUserList(null);
                } else {
                    setUserList(data);
                }
            });
    }, [position, response]);

    useEffect(() => {
        console.log("reload" + count);
        count++;
        fetch(
            server +
                "/duty?" +
                new URLSearchParams({
                    position: position,
                    dutyType: dutyType,
                })
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
                if (data.error) {
                    setUserList(null);
                } else {
                    setUserList(data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [open]);

    useEffect(() => {
        if (response.error) {
            setErrorDialogOpen(true);
        } else {
            setErrorDialogOpen(false);
        }
    }, [response]);

    return (
        <div className="flex flex-col items-center gap-2">
            <h2>{dutyType}</h2>
            <div className="border bg-yellow-300">
                {userList ? <Avatar username={userList[0]?.username} /> : <img src="" alt="岗位职责所在者的头像" />}
            </div>
            {userList && (
                <ul>
                    {userList.map((item, index) => {
                        return (
                            <li key={index} className="flex flex-col border rounded-md my-2">
                                <div>
                                    <h4 className="inline-block font-black">
                                        {item.username}
                                        {item?.student && "(教员)"}：
                                    </h4>
                                    <CountTime startTime={item.inTime} />
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
            )}

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
                dutyType={dutyType}
                setResponse={setResponse}
            />
            <ErrorDialog open={errorDialogOpen} setOpen={setErrorDialogOpen} content={response} />
        </div>
    );
}

export default 指纹模块;
