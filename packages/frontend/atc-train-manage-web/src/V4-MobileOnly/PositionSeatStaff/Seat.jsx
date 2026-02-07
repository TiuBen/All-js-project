import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useDialog } from "@utils";
import Staff from "./Staff";
import dayjs from "dayjs";
import useStore from "../../utils/store/userStore";

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

    // 十分钟退出的功能
    useEffect(() => {
        // if more than 2 user putTO get out immediately
        const sortedData = onDutyUsers
            .filter((item) => {
                return item.dutyType === dutyType && item.position === position && item.roleType !== "见习";
            })
            .sort((a, b) => a.id - b.id);

        const timer = setInterval(() => {
            if (sortedData.length > 1) {
                const { inTime } = sortedData[sortedData.length - 1];
                const isMoreThan10Minutes = dayjs().diff(dayjs(inTime, "YYYY-MM-DD HH:mm:ss"), "minute", true) > 10.0;
                if (isMoreThan10Minutes) {
                    putDutyRecord(sortedData[0]);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [onDutyUsers, position, dutyType]);

    return (
        <div className="flex flex-col items-center border rounded-lg p-1 gap-1 text-center self-stretch">
            
            <div className="flex flex-row items-center gap-2">
                {dutyType && <h3 className="font-black text-blue-600 text-lg">{dutyType}</h3>}
                <Button
                    style={{ marginTop: "auto" }}
                    disabled={
                        onDutyUsers.filter(
                            (duty) =>
                                duty.position === position && duty.dutyType === dutyType && duty.roleType !== "见习"
                        ).length >= 2
                    }
                    onClick={() => {
                        //! 这里只有普通的接班
                        //! 没有roleType==教员 或则 见习
                        setDialogPayload({
                            userListDialogDisplay: true,
                            dialogTitle: "进行交接班",
                            dialogType: "User_Get_In",
                        });
                        setSelectedPosition({ position: position, dutyType: dutyType });
                    }}
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

// disabled={
//     data?.filter((item) => {
//         return item?.roleType !== "见习";
//     }).length >= 2
// }

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

// if (error) {
//     return <div>{JSON.stringify(error)}</div>;
// }
// if (loading) {
//     return <div>正在获取席位信息...</div>;
// }

// const {
//     data: duties = [],
//     error,
//     loading,
// } = useSWR(
//     `${SERVER_URL}/duty?position=${position}${dutyType ? `&dutyType=${dutyType}` : ""}&outTime=null`,
//     FETCHER,
//     {
//         revalidateOnFocus: false,
//         fallbackData: [],
//     }
// );
// mutate(
//     `${SERVER_URL}/duty?position=${position}${dutyType ? `&dutyType=${dutyType}` : ""}&outTime=null`
// );
