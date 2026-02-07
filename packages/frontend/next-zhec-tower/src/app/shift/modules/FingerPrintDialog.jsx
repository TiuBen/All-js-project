"use client";
import React from "react";
import { Dialog, Button } from "@radix-ui/themes";
import FingerPrint from "@/components/FingerPrint";

function FingerPrintDialog(props) {
    const { open, setOpen } = props;
    return (
        <div>
            <Dialog.Root open={open} onOpenChange={() => setOpen()}>
                <Dialog.Content
                    size="1"
                    maxWidth="300px"
                    style={{ display: "flex", flexDirection:"column",gap:'10px'}}
                >
                    <Dialog.Description>测试阶段，还没有指纹模块</Dialog.Description>
                    <Dialog.Title></Dialog.Title>
                    <FingerPrint />
                    <Dialog.Trigger>
                        <Button onClick={()=>{setOpen(false)}}>接班</Button>
                    </Dialog.Trigger>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    );
}

export default FingerPrintDialog;
