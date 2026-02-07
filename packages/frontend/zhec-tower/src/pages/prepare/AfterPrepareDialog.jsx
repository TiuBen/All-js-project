"use client";
import React from "react";
import { Button, Radio, Text, Flex, RadioGroup, Dialog } from "@radix-ui/themes";
import dayjs from "dayjs";

function AfterPrepareDialog(props) {
    const { open, setOpen, response, setNeedReload } = props;
    const { username, prepareTime, shiftType, message, error = null } = response;
    return (
        <Dialog.Root open={open} onOpenChange={() => setOpen()}>
            <Dialog.Content
                size="1"
                maxWidth="400px"
                className=" flex flex-col "
                //   style={{ backgroundColor: "red", color: "yellow" }}
            >
                <Dialog.Title>{username}</Dialog.Title>
                <Dialog.Description>
                    {error ? (
                        <label className="text-red-600 font-bold  text-lg">{message}</label>
                    ) : (
                        <label>可以开始执勤了</label>
                    )}
                </Dialog.Description>
                {error ? (
                    <>
                        <div>
                            <div className=" text-lg  ">
                                班次&nbsp;
                                <span className=" font-black italic">{shiftType}</span>
                            </div>
                            <div className=" text-lg ">
                                在&nbsp;
                                <span className=" font-black italic">{prepareTime}</span> 准备时
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <>
                            <div>
                                你已经完成班次：
                                <br />
                                <div className=" text-lg font-black  text-blue-600">{shiftType}</div>
                                的岗前准备
                            </div>
                        </>
                    </>
                )}

                <Button
                    color={error !== null ? "red" : "indigo"}
                    onClick={() => {
                        setOpen(false);
                        setNeedReload({});
                    }}
                >
                    确定
                </Button>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default AfterPrepareDialog;
