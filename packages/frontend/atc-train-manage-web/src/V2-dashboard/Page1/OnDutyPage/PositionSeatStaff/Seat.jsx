import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useDialog, useOnDutyUser, SERVER_URL } from "@utils";
import Staff from "./Staff";
import dayjs from "dayjs";

//*     Position
//*         |
//*    Seat    Seat
//*    |       |
//*    Staff   Staff
//*    Staff   Staff
//*

function Seat(props) {
    const { position, dutyType } = props;
    console.log("111");
    
console.log(JSON.stringify (props));
console.log(dutyType===undefined);
console.log("222");


    const [staffs, setStaffs] = useState([]);
    const { setDialogPayload, setOpenUserListDialog } = useDialog();

    const { onDutyUser, putToServerUserGetOut } = useOnDutyUser();

    useEffect(() => {
        const params = new URLSearchParams({ position });
        
        if (dutyType !== undefined) {
            params.append("dutyType", dutyType);
        }
        console.log(`${SERVER_URL}/duty?${params}`);
        
        fetch(`${SERVER_URL}/duty?${params}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                
                setStaffs([...data]);
            })
            .catch((e) => console.log(e));
    }, [position, dutyType]);

    // 十分钟退出的功能
    useEffect(() => {
        // if more than 2 user putTO get out immediately
        const sortedData = staffs
            .filter((item) => {
                return item.roleType !== "见习";
            })
            .sort((a, b) => a.id - b.id);

        const timer = setInterval(() => {
            if (sortedData.length > 1) {
                const { inTime } = sortedData[sortedData.length - 1];
                const isMoreThan10Minutes = dayjs().diff(dayjs(inTime, "YYYY-MM-DD HH:mm:ss"), "minute", true) > 10.0;
                if (isMoreThan10Minutes) {
                    putToServerUserGetOut(sortedData[0]);
                }
            }
        }, 30 * 1000);

        return () => clearInterval(timer);
    }, [staffs, putToServerUserGetOut]);

    return (
        <div className="flex flex-col items-center border rounded-lg p-1 gap-1 text-center self-stretch">
            <div className="flex flex-row items-center gap-2">
                {dutyType && <h3 className="font-black text-blue-600 text-lg">{dutyType}</h3>}

                <Button
                    style={{ marginTop: "auto" }}
                    disabled={
                        staffs.filter((item) => {
                            return item.roleType !== "见习";
                        }).length >= 2
                    }
                    onClick={() => {
                        // setSelectedPosition(position);
                        // setSelectedDutyType(dutyType);
                        setOpenUserListDialog(true);

                        //! 这里只有普通的接班
                        //! 没有roleType==教员 或则 见习
                        setDialogPayload({
                            dialogTitle: "进行交接班",
                            position: position,
                            dutyType: dutyType,
                            dialogType: "User_Get_In",
                        });
                    }}
                >
                    接班
                </Button>
            </div>
            {staffs.map((y, index) => {
                return (
                    <div key={index}>
                        <Staff {...y} key={index} />
                    </div>
                );
            })}
        </div>
    );
}

export default Seat;
