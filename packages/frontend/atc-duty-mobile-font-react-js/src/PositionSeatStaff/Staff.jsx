import { useContext, useRef, useState, useEffect } from "react";
import { useDialog, SERVER_URL } from "@utils";
import { useLongPress } from "ahooks";
import { Button, Avatar } from "@radix-ui/themes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import useStore from "../../utils/store/userStore";

dayjs.extend(duration);

//*     Position
//*         |
//*    Seat    Seat
//*    |       |
//*    Staff   Staff
//*    Staff   Staff
//*

function formatDuration(date1) {
    const diff = dayjs.duration(dayjs().diff(date1));
    const totalMinutes = diff.asMinutes();

    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${hours}小时${minutes}分钟`;
    } else {
        return `${Math.round(totalMinutes)}分钟`;
    }
}

function Staff(props) {
    // !  这里是后端传来的这个duty row 的全部信息基础信息
    // !  useSWR(`${SERVER_URL}/duty?position=${position}&dutyType=${dutyType}&outTime=null`, FETCHER);
    //!   获取来的
    const {
        id,
        userId,
        username,
        position,
        dutyType,
        inTime,
        outTime,
        roleType,
        relatedDutyTableRowId,
        roleStartTime,
        roleEndTime,
        status,
    } = props;

    const { setDialogPayload } = useDialog();

    //! 减少后端请求 在这里检测 长按的效果
    const { detailUsers, setSelectedDutyRecord, selectedDutyRecord } = useStore();
    const [canLongPress, setCanLongPress] = useState(false);

    // 执勤时间
    const [inDutyTime, setInDutyTime] = useState(0);
    // 带教时间
    const [inRoleTime, setInRoleTime] = useState(0);

    const [isOver2Hours, setIsOver2Hours] = useState(dayjs(Date.now()).diff(inTime, "hours", true) >= 2.17);
    const ref = useRef(null);

    useLongPress(
        () => {
            if (canLongPress) {
                setDialogPayload({
                    dialogTitle: (
                        <div>
                            由<span className="text-blue-500 px-1">{username}</span>负责，开始带培
                        </div>
                    ),
                    userListDialogDisplay: true,
                });
                setSelectedDutyRecord({ ...props });
            }
        },
        ref,
        {
            threshold: 1000,
        }
    );

    useEffect(() => {
        setInDutyTime(formatDuration(inTime));
        if (Array.isArray(roleStartTime)) {
            setInRoleTime(formatDuration(roleStartTime.at(-1)));
        }

        const timerId = setInterval(() => {
            if (dayjs(Date.now()).diff(inTime, "hours", true) >= 2.17) {
                setIsOver2Hours(true);
            }

            setInDutyTime(formatDuration(inTime));
            if (Array.isArray(roleStartTime)) {
                setInRoleTime(formatDuration(roleStartTime.at(-1)));
            }
        }, 15 * 1000);

        return () => clearInterval(timerId);
    }, [inTime, roleStartTime]);

    // 专门检测能否 带培
    useEffect(() => {
        if (roleType === "教员") {
            setCanLongPress(false);
        } else {
            const user = detailUsers.find((user) => user.id === userId);
            // console.log(user);
            const uP = user.position || [];
            const foundP = uP.find((x) => x?.position === position) || {};
            // console.log(foundP);
            if (foundP.roleType === "教员") {
                setCanLongPress(true);
            } else {
                setCanLongPress(false);
            }
        }
    }, [detailUsers, roleType, userId, position]);

    return (
        <>
            <div
                className={`relative grid grid-cols-2 gap-1 border  border-dashed rounded-lg px-2 py-1 mx-1${
                    roleType === "教员" || roleType === "见习" ? "border-2 border-lime-500" : ""
                }`}
            >
                {/* <div className="text-wrap">{JSON.stringify(id)} </div> */}
                <div ref={ref} className="flex items-center justify-center ">
                    {roleType === "教员" ? (
                        <label className="text-blue-600 font-bold " style={{ writingMode: "vertical-rl " }}>
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
                        src={`${SERVER_URL}/images/${username}.jpg`  }
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
                            setDialogPayload({
                                confirmGetOutDialogDisplay: true,
                                dialogTitle: "确认退出？",
                                confirmButtonText: "确定",
                            });
                            setSelectedDutyRecord({ ...props });
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
