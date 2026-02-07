import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useDialog, useOnDutyUser } from "@utils";
import Staff from "./Staff";
import dayjs from "dayjs";
import useSWR from "swr";
import { SERVER_URL, FETCHER, DialogContextProvider, OnDutyUserContextProvider } from "@utils";
import useStore from "../../../../utils/store/userStore";
//*     Position
//*         |
//*    Seat    Seat
//*    |       |
//*    Staff   Staff
//*    Staff   Staff
//*

function Seat(props) {
    const { position, dutyType } = props;
    const { setDialogPayload } = useDialog();
    const { onDutyUsers, setSelectedPosition, putDutyRecord } = useStore();

    return (
        <div className="flex flex-col items-center border rounded-lg p-1 gap-1 text-center self-stretch">
            <div className="flex flex-row items-center gap-2">
                {dutyType && <h3 className="font-black text-blue-600 text-lg">{dutyType}</h3>}
                <Button
                    style={{ marginTop: "auto" }}
                    disabled={true}
                >
                    接班
                </Button>
            </div>
            {onDutyUsers
                .filter((duty) => duty.position === position && duty.dutyType === dutyType)
                .map((duty, index) => (
                    <div key={index}>
                        <Staff {...duty} key={index} />
                    </div>
                ))}
        </div>
    );
}

export default Seat;

// 十分钟退出的功能
// useEffect(() => {
//     // if more than 2 user putTO get out immediately
//     const sortedData = staffs
//         .filter((item) => {
//             return item.roleType !== "见习";
//         })
//         .sort((a, b) => a.id - b.id);

//     const timer = setInterval(() => {
//         if (sortedData.length > 1) {
//             const { inTime } = sortedData[sortedData.length - 1];
//             const isMoreThan10Minutes = dayjs().diff(dayjs(inTime, "YYYY-MM-DD HH:mm:ss"), "minute", true) > 10.0;
//             if (isMoreThan10Minutes) {
//                 putToServerUserGetOut(sortedData[0]);
//             }
//         }
//     }, 30 * 1000);

//     return () => clearInterval(timer);
// }, [staffs, putToServerUserGetOut]);
