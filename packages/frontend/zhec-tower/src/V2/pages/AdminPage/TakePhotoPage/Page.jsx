import React, { useContext, useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { server } from "../../../../lib/CONST";
import useDialog from "../../../hooks/useDialog";
import TakePhotoDialog from "./TakePhotoDialog";

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

function TakePhoto() {
    const {setOpenTakePhotoDialog} = useDialog();


    return (
        <>
            <div className="flex flex-col items-center">
                <h1 className="text-4xl">录入人脸</h1>
                <div className="flex flex-col flex-wrap gap-2 mx-[2rem]  ">
                    {[usernamesRow0, usernamesRow1, usernamesRow2, usernamesRow3].map((uRow, index) => {
                        return (
                            <div key={index} className="flex flex-row flex-1 flex-wrap gap-2 border-b-2 pb-1">
                                {uRow.map((x, key) => {
                                    return (
                                        <div className="flex flex-col items-center" key={key}>
                                            <Button
                                                color="cyan"
                                                variant="soft"
                                                onClick={()=>setOpenTakePhotoDialog(true)}
                                                key={key}
                                                style={{ width: "5rem" }}
                                            >
                                                {x}
                                            </Button>

                                            <div className="flex flex-row gap-2">
                                                <div className="text-center border-2">
                                                    <label htmlFor="" className="">
                                                        头像
                                                        <img width={64} src={server + "/" + x + ".jpg"} />
                                                    </label>
                                                </div>
                                                <div className="text-center border-2">
                                                    <label htmlFor="" className="">
                                                        人脸识别照片
                                                        <img width={64} src={server + "/日常照片/" + x + ".png"} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

            </div>
            <TakePhotoDialog  />
        </>
    );
}

export default TakePhoto;
