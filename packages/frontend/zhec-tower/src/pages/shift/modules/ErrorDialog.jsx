"use client";
import React from "react";
import { Button, Radio, Text, Flex, RadioGroup, Dialog } from "@radix-ui/themes";
import dayjs from "dayjs";

function ErrorDialog(props) {
    const { open, setOpen, content } = props;
    const { username,error, message } = content;
    return (
        <Dialog.Root open={open} onOpenChange={() => setOpen()}>
            <Dialog.Content
                size="1"
                maxWidth="400px"
                className=" flex flex-col "
                //   style={{ backgroundColor: "red", color: "yellow" }}
            >
                <Dialog.Title>{error&&"出现错误情况！"}</Dialog.Title>
                <Dialog.Description>
                    
                    {message && 
                        <label className="text-red-600 font-bold  text-lg">{username}&nbsp;{message}</label>
                   }
                </Dialog.Description>
              
                <Button
                    color={error !== null ? "red" : "indigo"}
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    确定
                </Button>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default ErrorDialog;
