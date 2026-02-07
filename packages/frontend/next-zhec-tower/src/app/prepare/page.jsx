"use client";
import React, { useState, useEffect } from "react";
import TestPrepare from "./TestPrepare";
import { useLocalStorageState } from "ahooks";
import { server, serverActions } from "@/lib/CONST";
import { Button, Radio, Text, Flex, RadioGroup, Dialog } from "@radix-ui/themes";
import dayjs from "dayjs";
import AfterPrepareDialog from "./AfterPrepareDialog";
function page() {
    const [username, setUsername] = useLocalStorageState("username", { defaultValue: "", listenStorageChange: true });

    const [isPrepared, setIsPrepared] = useState(false);
    const [bodyCondition, setBodyCondition] = useState(null);
    const [mindCondition, setMindCondition] = useState(null);
    const [alcoholCondition, setAlcoholCondition] = useState(null);
    const [shiftType, setShiftType] = useState(null);

    const [response, setResponse] = useState("");

    useEffect(() => {
        if (bodyCondition && mindCondition && alcoholCondition) {
            setIsPrepared(true);
        } else {
            setIsPrepared(false);
        }
    }, [bodyCondition, mindCondition, alcoholCondition]);

    useEffect(() => {
        //  console.log(username);
        setUsername("");
    }, []);

    const [open, setOpen] = useState(false);


    useEffect(() => {
      setOpen(true)
    }, [response])
       



    return (
        <div className="flex flex-row justify-between">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fetch(server, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            action: serverActions.PrepareForTheJob,
                            username: username,
                            isPrepared: isPrepared,
                            prepareDetail: {
                                bodyCondition: bodyCondition,
                                mindCondition: mindCondition,
                                alcoholCondition: alcoholCondition,
                            },
                            shiftType: shiftType,
                        }),
                    })
                        .then((res) => {
                            // console.log(res);
                            return res.json();
                        })
                        .then((data) => {
                            console.log(data);
                            setResponse({...data});
                            // setOpen(true);
                        })
                        .catch((err) => console.log(err));
                }}
            >
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">岗前准备</h2>
                <div className="flex flex-col">
                    <Flex gap="2">
                        <Text as="label" size="3" weight="bold">
                            身体状况
                        </Text>

                        <RadioGroup.Root value={bodyCondition} name="身体状况" required={true}>
                            <RadioGroup.Item
                                value={true}
                                onClick={(e) => {
                                    setBodyCondition(true);
                                }}
                            >
                                合适
                            </RadioGroup.Item>
                            <RadioGroup.Item
                                value={false}
                                onClick={(e) => {
                                    setBodyCondition(false);
                                }}
                            >
                                不适合
                            </RadioGroup.Item>
                        </RadioGroup.Root>
                    </Flex>
                    <Flex gap="2">
                        <Text as="label" size="3" weight="bold">
                            思想状况
                        </Text>

                        <RadioGroup.Root value={mindCondition} name="思想状况" required={true}>
                            <RadioGroup.Item
                                value={true}
                                onClick={(e) => {
                                    setMindCondition(true);
                                }}
                            >
                                合适
                            </RadioGroup.Item>
                            <RadioGroup.Item
                                value={false}
                                onClick={(e) => {
                                    setMindCondition(false);
                                }}
                            >
                                不适合
                            </RadioGroup.Item>
                        </RadioGroup.Root>
                    </Flex>
                    <Flex gap="2">
                        <Text as="label" size="3" weight="bold">
                            是否饮用含酒精饮料
                        </Text>

                        <RadioGroup.Root value={alcoholCondition} name="酒精状况" required={true}>
                            <RadioGroup.Item
                                value={true}
                                onClick={(e) => {
                                    setAlcoholCondition(true);
                                }}
                            >
                                否
                            </RadioGroup.Item>
                            <RadioGroup.Item
                                value={false}
                                onClick={(e) => {
                                    setAlcoholCondition(false);
                                }}
                            >
                                是
                            </RadioGroup.Item>
                        </RadioGroup.Root>
                    </Flex>

                    <div className="flex flex-col">
                        <Text as="label" size="4" weight="bold">
                            选择班次
                        </Text>
                        <label htmlFor="" className="flex gap-2 items-baseline  font-extrabold">
                            白班 ：{`${dayjs().format("M月D日")}08:30-${dayjs().format("M月D日")}23:00`}
                            <input
                                type="radio"
                                name="shift"
                                value={`${dayjs().format("M月D日")}08:30-${dayjs().format("M月D日")}23:00`}
                                checked={
                                    shiftType === `${dayjs().format("M月D日")}08:30-${dayjs().format("M月D日")}23:00`
                                }
                                onChange={(e) => {
                                    setShiftType(e.target.value);
                                }}
                                required={true}
                            />
                        </label>
                        <label htmlFor="" className="flex gap-2 items-baseline  font-extrabold">
                            前半夜：{`${dayjs().format("M月D日")}23:00-${dayjs().add(1, "day").format("M月D日")}03:30`}
                            <input
                                type="radio"
                                name="shift"
                                value={`${dayjs().format("M月D日")}23:00-${dayjs()
                                    .add(1, "day")
                                    .format("M月D日")}03:30`}
                                checked={
                                    shiftType ===
                                    `${dayjs().format("M月D日")}23:00-${dayjs().add(1, "day").format("M月D日")}03:30`
                                }
                                onChange={(e) => {
                                    setShiftType(e.target.value);
                                }}
                                required={true}
                            />
                        </label>
                        <label htmlFor="" className="flex gap-2 items-baseline font-extrabold">
                            后半夜：
                            {`${dayjs().add(1, "day").format("M月D日")}03:30-${dayjs()
                                .add(1, "day")
                                .format("M月D日")}08:30`}
                            <input
                                type="radio"
                                name="shift"
                                value={`${dayjs().add(1, "day").format("M月D日")}03:30-${dayjs()
                                    .add(1, "day")
                                    .format("M月D日")}08:30`}
                                checked={
                                    shiftType ===
                                    `${dayjs().add(1, "day").format("M月D日")}03:30-${dayjs()
                                        .add(1, "day")
                                        .format("M月D日")}08:30`
                                }
                                onChange={(e) => {
                                    setShiftType(e.target.value);
                                }}
                                required={true}
                            />
                        </label>
                    </div>
                </div>
                <Button type="submit">确定</Button>
            </form>
            <TestPrepare />
           <AfterPrepareDialog open={open} setOpen={(value)=>setOpen(value)} response={response} />
        </div>
    );
}

export default page;
