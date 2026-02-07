import React, { useContext, useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { useDialog, useOnDutyUser, SERVER_URL, FETCHER } from "@utils";
import useSWR from "swr";
import { API_URL } from "../../utils/const/Const";
import useStore from "../../utils/store/userStore";

function CalenderSettingDialog() {
    const { openUserListDialog, setOpenUserListDialog, setOpenFaceAuthDialog } = useDialog();

    const { onDutyUser, postToServerUserGetIn } = useOnDutyUser();

    //! dialog payload 写法
    const { dialogPayload } = useDialog();
    const {groupedUsers,positions}=useStore();



    return (
        <Dialog.Root open={openUserListDialog} onOpenChange={() => setOpenUserListDialog(!openUserListDialog)}>
            <Dialog.Content maxWidth="1000px" className=" flex flex-col">
                <Dialog.Title className="flex flex-row justify-between text-wrap">
                    <div>{dialogPayload.dialogTitle}</div>
                    <Button color="red" onClick={() => setOpenUserListDialog(false)}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description>点击姓名</Dialog.Description>
                <div className="flex flex-col flex-wrap gap-2">
                    {groupedUsers.map((uRow, index) => {
                        return (
                            <div key={index} className="flex flex-row flex-1 flex-wrap gap-2 border-b-2 pb-1">
                                {uRow.map((x, key) => {
                                    return (
                                        <Button
                                            color="cyan"
                                            variant="soft"
                                            // disabled={onDutyUser.some((item) => item.username === x)}
                                            onClick={() => {
                                                postToServerUserGetIn({ ...dialogPayload, username: x });
                                                setOpenUserListDialog(false);
                                            }}
                                            key={key}
                                            style={{ width: "5rem" }}
                                        >
                                            {x}
                                        </Button>

                                       
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                {/* <h2 className="text bg-green-400 ">
                    {" "}
                    playLoad
                    <br />
                    {JSON.stringify(dialogPayload)}
                </h2>
                <br />
                {JSON.stringify(onDutyUser)} */}
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default CalenderSettingDialog;
