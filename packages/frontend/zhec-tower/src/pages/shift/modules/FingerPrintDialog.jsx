"use client";
import React from "react";
import { Dialog, Button } from "@radix-ui/themes";
import FingerPrint from "../../../components/FingerPrint";
import { useLocalStorageState } from "ahooks";
import { server, serverActions } from "../../../lib/CONST";

function FingerPrintDialog(props) {
    const { open, setOpen, dutyType,setResponse } = props;
    const [position] = useLocalStorageState("position", { listenStorageChange: true });
    const [username] = useLocalStorageState("username", { listenStorageChange: true });

    return (
        <div>
            <Dialog.Root open={open} onOpenChange={() => setOpen()}>
                <Dialog.Content
                    size="1"
                    maxWidth="240px"
                    style={{ display: "flex", flexDirection: "column", gap: "10px",alignItems: "center" }}
                >
                    <Dialog.Description>测试阶段，还没有指纹模块</Dialog.Description>
                    <Dialog.Title></Dialog.Title>
                    <FingerPrint />
                    <Dialog.Trigger>
                        <Button
                            onClick={() => {
                                // setOpen(false);
                                fetch(server + "/duty", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        action: serverActions.TakeOverTheJob,
                                        position: position,
                                        username: username,
                                        dutyType: dutyType,
                                    }),
                                })
                                    .then((res) => {
                                        return res.json();
                                    })
                                    .then((data) => {
                                        setOpen(false);
                                        setResponse(data);
                                        console.log(data);
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }}
                            style={{ alignSelf:"stretch" }}
                        >
                            确定
                        </Button>
                    </Dialog.Trigger>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    );
}

export default FingerPrintDialog;
