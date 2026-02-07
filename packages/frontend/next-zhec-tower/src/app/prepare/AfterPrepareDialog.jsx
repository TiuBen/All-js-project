"use client";
import React from "react";
import { Button, Radio, Text, Flex, RadioGroup, Dialog } from "@radix-ui/themes";

function AfterPrepareDialog(props) {
    const { open, setOpen, response } = props;
    const {
        username,
        shiftType,
        message,
        error = null,
    } = response;
    console.log(response);
    return (
        <Dialog.Root open={open} onOpenChange={() => setOpen()}>
            <Dialog.Content
                size="1"
                maxWidth="300px"
                className=" flex flex-col "
                //   style={{ backgroundColor: "red", color: "yellow" }}
            >
                <Dialog.Title>{username}</Dialog.Title>
                <Dialog.Description className=" text-lg font-black  text-blue-600">{shiftType}</Dialog.Description>

                <div>
                    <p>你已经，准备好</p>
                    <p>可以开始执勤了</p>
                </div>
                <Button
                    color={error !== null ? "red" : "indigo"}
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    确定
                </Button>
            </Dialog.Content>
            {/* </> */}
        </Dialog.Root>
    );
}

export default AfterPrepareDialog;
