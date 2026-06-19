import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { useUser, Request } from "../../../utils/index";
import CheckInYearIndicator from "./CheckInYearIndicator";

function CheckIn() {
    const { user } = useUser();
    const [checkIn, setCheckIn] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    console.log("CheckIn Component");
    // console.log(user);

    let today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDay(), 0, 0, 0, 1);
    let end = new Date(today.getFullYear(), today.getMonth(), today.getDay(), 23, 59, 59, 999);

    // console.log(start.toTimeString());
    // console.log(end.toTimeString());

    // * 页面每次加载的时候检查今天是否考勤了
    useEffect(() => {
        Request.get("/checkin", { params: { ...user, date: Date.now() } }).then((data) => {
            console.log("查询今天是否考勤");
            // console.log(data);
            if (data?.checkin_time) {
                setIsChecked(true);
                setCheckIn(data);
            } else {
                setIsChecked(false);
                setCheckIn(null);
            }
        });
    }, [isChecked]);

    return (
        <div className="flex flex-col gap-4 divide-y-2">
            <div className="">
                <h1 className=" text-3xl font-bold font-yahei">今天是{ dayjs().format("YYYY年M月D日")}</h1>
                {isChecked ? (
                    <div className="flex flex-col relative items-start ml-1">
                        <span className=" font-semibold font-yahei text-blue-300">
                            {dayjs(checkIn?.checkin_time).format("HH:mm") + " 你已经开始工作了"}
                        </span>
                        <button
                            className="border rounded bg-zinc-300 p-2 text-xl text-blue-600 font-semibold"
                            onClick={(e) => {
                                // ! 这个单独用来 !下班
                                // * 需要配合别的状态
                                e.preventDefault();
                                console.log("今日考勤 下班 按钮点击了");
                                console.log(checkIn);
                                Request.put("/checkin", checkIn).then((data) => {
                                    console.log("Request.put(checkin");
                                    // console.log(data);
                                    // setIsChecked(null);
                                    // window.location.href = "/";
                                });
                            }}
                        >
                            结束今日工作
                        </button>
                    </div>
                ) : (
                    <button
                        className="border rounded bg-zinc-300 p-2 text-xl text-blue-600 font-semibold"
                        onClick={(e) => {
                            // * 这个单独用来提交考勤打卡
                            // * 需要配合别的状态
                            e.preventDefault();
                            console.log("今日考勤 打卡 按钮点击了");
                            Request.post("/checkin", user).then((data) => {
                                console.log("data?.checkin_time"+data?.checkin_time);

                                setCheckIn(data);
                                if (data?.checkin_time) {
                                    setIsChecked(true);
                                }
                            });
                        }}
                    >
                        开始今日工作
                    </button>
                )}
            </div>
            <h2 className="py-4">本月已工作XX天</h2>
            <CheckInYearIndicator isChecked={isChecked} />
            <div  className="inline-block mt-5">
                <div>
                    法定假期
                    <span
                        style={{
                            marginLeft:"1rem",
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            backgroundColor:  "rgba(100, 100, 100, 0.4)",
                            border: "1px solid rgba(255, 0, 0, 0.9)",
                        }}
                    ></span>
                </div>
                <div >
                    已打卡
                    <span
                        style={{
                            marginLeft:"1rem",
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            backgroundColor: "rgb(33, 110, 57)"
                        }}
                    ></span>
                </div>
                <div >
                    公休假 (暂时未标记)
                    <span
                        style={{
                            marginLeft:"1rem",
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            backgroundColor: "rgb(0, 0, 233)"
                        }}
                    ></span>
                </div>
            </div>
        </div>
    );
}

export default CheckIn;
