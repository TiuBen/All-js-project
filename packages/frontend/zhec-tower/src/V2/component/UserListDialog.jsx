import React, { useContext, useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { server } from "../../lib/CONST";
import { useDialog, useCamera, useOnDutyUser } from "../hooks";
import { useNetwork, useLocalStorageState } from "ahooks";

const usernamesRow0 = ["巴富毅", "刘琦"];
const usernamesRow1 = [
    "姜文夫",
    "董志华",
    "金鼎",
    "徐万友",
    "马莲花",
    "李秋实",
    "明嘉",
    "温若春",
    "张虎",
    "李明",
    "刘国莲",
    "周岸",
    "杜涛",
    "张笑延",
    "耿若岩",
    "张文中",
    "詹泽彬",
];
const usernamesRow2 = [
    "朱永春",
    "郭永杰",
    "吴疆",
    "边昊",
    "胡鑫",
    "黄恩",
    "叶大鹏",
    "张宗根",
    "潘伟生",
    "王建超",
    "王风瑞",
    "邓心豪",
    "蔡昊霖",
    "严亮",
    "宋天霖",
    "沈宁",
];
const usernamesRow3 = ["蓝宇航", "郑文卓", "陈宏伟", "蒋露裕", "程卓"];

function UserListDialog() {
    const { openUserListDialog, setOpenUserListDialog, setOpenFaceAuthDialog } = useDialog();

    const { hasCamera } = useCamera();
    const { online } = useNetwork();
    const [selectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [selectedDutyType] = useLocalStorageState("dutyType", { listenStorageChange: true });

    const [offlineDb, setOfflineDb] = useLocalStorageState("offlineDb", {
        listenStorageChange: true,
        defaultValue: [],
    });

    const { onDutyUser, postToServerUserGetIn } = useOnDutyUser();

    //! dialog payload 写法
    const { dialogPayload } = useDialog();

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
                    {[usernamesRow0, usernamesRow1, usernamesRow2, usernamesRow3].map((uRow, index) => {
                        return (
                            <div key={index} className="flex flex-row flex-1 flex-wrap gap-2 border-b-2 pb-1">
                                {uRow.map((x, key) => {
                                    return (
                                        <Button
                                            color="cyan"
                                            variant="soft"
                                            disabled={onDutyUser.some((item) => item.username === x)}
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

export default UserListDialog;

// fetch(server + "/duty", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//         username: x,
//         position: selectedPosition,
//         dutyType: selectedDutyType,
//     }),
// })
//     .then((res) => res.json())
//     .then((data) => {
//         setOpenUserListDialog(false);
//     })
//     .then(() => {
//         window.location.reload();
//     });
