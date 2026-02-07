import React, { useContext, useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { server } from "../../lib/CONST";
import { useDialog, useOnDutyUser } from "../hooks";
import { useNetwork, useLocalStorageState } from "ahooks";

function ConfirmGetOutDialog() {
    const { openConfirmGetOutDialog, setOpenConfirmGetOutDialog,dialogPayload } = useDialog();
    const { putToServerUserGetOut } = useOnDutyUser();

    return (
        <Dialog.Root
            open={openConfirmGetOutDialog}
            onOpenChange={() => setOpenConfirmGetOutDialog(!openConfirmGetOutDialog)}
        >
            <Dialog.Content className=" flex flex-col">
                <Dialog.Title className="flex flex-row justify-between">
                    <div>{dialogPayload?.dialogTitle}</div>
                    <Button color="red" onClick={() => setOpenConfirmGetOutDialog(false)}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description></Dialog.Description>

                <Button onClick={() => {
                    //! 结束执勤
                    console.log(dialogPayload?.roleType);
                 
                    putToServerUserGetOut({...dialogPayload});
                    setOpenConfirmGetOutDialog(false);

                }}>
                    {dialogPayload?.confirmButtonText}
                </Button>
                {/* {JSON.stringify(dialogPayload)} */}
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default ConfirmGetOutDialog;
