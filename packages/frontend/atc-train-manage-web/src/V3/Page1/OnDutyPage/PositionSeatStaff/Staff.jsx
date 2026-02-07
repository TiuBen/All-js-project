import { useContext, useRef, useState, useEffect } from "react";
import { useDialog, SERVER_URL } from "@utils";
import { useLongPress } from "ahooks";
import { Button, Avatar } from "@radix-ui/themes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

//*     Position
//*         |
//*    Seat    Seat
//*    |       |
//*    Staff   Staff
//*    Staff   Staff
//*

function Staff(props) {
    // if (props.roleStartTime === null) {
    //     console.log("Staff", props);
    // }
    // ! 基础信息
    const { username, position, dutyType, inTime } = props;
    // ! 角色信息
    const { roleType, roleStartTime } = props;

    const { setOpenUserListDialog, setOpenConfirmGetOutDialog } = useDialog();
    const { setDialogPayload } = useDialog();
    // console.log(props);

    // 执勤时间
    const date1 = dayjs(inTime);
    const [inDutyTime, setInDutyTime] = useState(dayjs.duration(dayjs(Date.now()).diff(date1)).format("H小时m分"));
    // 带教时间
    const date2 = dayjs(roleStartTime);
    const [inRoleTime, setInRoleTime] = useState(dayjs.duration(dayjs(Date.now()).diff(date2)).format("H小时m分"));

    const [isOver2Hours, setIsOver2Hours] = useState(dayjs(Date.now()).diff(inTime, "hours", true) >= 2.17);
    const ref = useRef(null);

    useLongPress(
        () => {
            if (roleType === "见习") {
                setOpenConfirmGetOutDialog(true);

                setDialogPayload({
                    dialogTitle: "见习状态，无教员资格",
                    confirmButtonText: "确定",
                    confirmButtonFunction: () => {
                        setOpenConfirmGetOutDialog(false);
                    },
                });
            } else if (roleType === "教员") {
                setOpenConfirmGetOutDialog(true);
                setDialogPayload({
                    dialogTitle: "该教员已有一名学员",
                    confirmButtonText: "确定",
                    confirmButtonFunction: () => {
                        setOpenConfirmGetOutDialog(false);
                    },
                });
            } else {
                setOpenUserListDialog(true);
                setDialogPayload({
                    ...props,
                    // dialogTitle:`由${username}负责，开始见习`,
                    dialogTitle: (
                        <div>
                            由<span className="text-blue-500 px-1">{username}</span>负责，开始见习
                        </div>
                    ),
                    excludeUser: username,
                    roleType: "见习",
                    position: position,
                    dutyType: dutyType,
                });
            }
        },
        ref,
        {
            threshold: 1000,
        }
    );

    useEffect(() => {
        setInDutyTime(dayjs.duration(dayjs(Date.now()).diff(inTime)).format("H小时m分"));
        setInRoleTime(dayjs.duration(dayjs(Date.now()).diff(roleStartTime)).format("H小时m分"));

        const timerId = setInterval(() => {
            if (dayjs(Date.now()).diff(inTime, "hours", true) >= 2.17) {
                setIsOver2Hours(true);
            }

            setInDutyTime(dayjs.duration(dayjs(Date.now()).diff(inTime)).format("H小时m分"));
            setInRoleTime(dayjs.duration(dayjs(Date.now()).diff(roleStartTime)).format("H小时m分"));
        }, 15 * 1000);

        return () => clearInterval(timerId);
    }, [props]);

    return (
        <>
            <div
                className={`relative grid grid-cols-2 gap-1 border  border-dashed rounded-lg px-2 py-1 mx-1${
                    roleType === "教员" || roleType === "见习" ? "border-2 border-lime-500" : ""
                }`}
            >
                <div ref={ref} className="flex items-center justify-center ">
                    {roleType === "教员" ? (
                        <label className="text-blue-600 font-bold" style={{ writingMode: "vertical-rl " }}>
                            教员
                        </label>
                    ) : (
                        <></>
                    )}
                    {roleType === "见习" ? (
                        <label className="text-lime-600 font-bold" style={{ writingMode: "vertical-rl " }}>
                            见习
                        </label>
                    ) : (
                        <></>
                    )}

                    <img
                        className={`max-w-[5rem] max-h-[4rem]  aspect-auto `}
                        // src={ SERVER_URL.slice(0,-3) + username + ".jpg"}
                        src={ SERVER_URL.slice(0,-3)+"images/" + username + ".jpg"}
                        alt={username}
                    />
                </div>
                <div className=" flex flex-col flex-1 justify-between items-start">
                    <h4
                        className={` text-sm font-black italic text-nowrap ${
                            isOver2Hours ? " text-red-600" : " text-green-600"
                        }   ${roleType === null ? " text-gray-800" : ""}  `}
                    >
                        {inDutyTime}
                    </h4>
                    {roleType === "教员" ? (
                        <h4 className={` text-sm font-black italic text-blue-600 text-nowrap`}>{inRoleTime}</h4>
                    ) : (
                        <></>
                    )}

                    <Button
                        variant="soft"
                        onClick={() => {
                            setOpenConfirmGetOutDialog(true);
                            setDialogPayload({ ...props, dialogTitle: "确认退出？", confirmButtonText: "确定" });
                        }}
                    >
                        退出
                    </Button>
                </div>
            </div>
        </>
    );
}

export default Staff;
