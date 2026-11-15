import React, { useContext, useState } from "react";
import { Avatar, Button, Dialog } from "@radix-ui/themes";
import { useDialog, useOnDutyUser, SERVER_URL, FETCHER } from "@utils";
import useSWR, { useSWRConfig,mutate } from "swr";
import { X } from "lucide-react";
import dayjs from "dayjs";
import useStore from "../../utils/store/userStore";
function ConfirmGetOutDialog() {
    const { dialogPayload, setDialogPayload } = useDialog();
    const {
        selectedPosition,
        fetchOnDutyUsers,
        setSelectedPosition,
        selectedDutyRecord,
        setSelectedDutyRecord,
        putDutyRecord,
    } = useStore();

    return (
        <Dialog.Root
            open={dialogPayload?.confirmGetOutDialogDisplay}
            onOpenChange={() => {
                setDialogPayload({ confirmGetOutDialogDisplay: false });
                setSelectedDutyRecord(null);
            }}
        >
            <Dialog.Description></Dialog.Description>
            <Dialog.Content
                maxWidth="340px"
                className=" flex flex-col"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    zIndex: 1000,
                    gap: "10px",
                    textWrap: "nowrap",
                }}
            >
                <Dialog.Title className="flex flex-row justify-between text-wrap items-center">
                    {/* <div className="text-wrap text-sm">{JSON.stringify(dialogPayload)}</div> */}
                    <div>确认停止本席位值班 ?</div>
                    <Button
                        color="red"
                        onClick={() => {
                            setDialogPayload({ confirmGetOutDialogDisplay: false });
                            setSelectedDutyRecord(null);
                        }}
                    >
                        <X />
                    </Button>
                </Dialog.Title>
                <div className="flex flex-row gap-2 w-full items-center justify-evenly">
                    <img
                        size={"9"}
                        className=" h-[6rem]"
                        // src={SERVER_URL + "/" + selectedDutyRecord?.username + ".jpg"}
                        src={`${SERVER_URL}/images/${selectedDutyRecord?.username}.jpg`  }
                        alt={selectedDutyRecord?.username}
                    />
                    <Button
                        className="aspect-square"
                        size={"4"}
                        onClick={ async() => {
                            let _temp =structuredClone(selectedDutyRecord);  // 因为异步 不确定
                            const {position,dutyType}=_temp;
                            await putDutyRecord(_temp);
                            mutate(
                                `${SERVER_URL}/duty?position=${position}${dutyType ? `&dutyType=${dutyType}` : ""}&outTime=null`
                            );
                            //!
                            setDialogPayload({ confirmGetOutDialogDisplay: false });
                        }}
                    >
                        确定
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default ConfirmGetOutDialog;
