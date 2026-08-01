import React, { useState, useEffect } from "react";
import { DialogContextProvider } from "@utils";
import { TowerControl, PlaneTakeoff, ScanFace, HandMetal, CalendarRange } from "lucide-react";
import Position from "./PositionSeatStaff/Position";
import { Theme, Switch, Button } from "@radix-ui/themes";
import UserListDialog from "./Dialog/UserListDialog";
import FaceDialog from "./Dialog/FaceDialog";
import ConfirmGetOutDialog from "./Dialog/ConfirmGetOutDialog";
import useStore from "../utils/store/userStore";
import DetailPage from "./DetailPage/DetailPage";
import TimelineDutyDialog from "./Dialog/TimelineDutyDialog";
import { API_URL } from "../utils/const/Const";
import { useCalendar } from "@sn/useCalender";

function AppMobile() {
    const { positions, isLoading, error, fetchOnDutyUsers, initStore } = useStore();
    const [showDetail, setShowDetail] = useState(false);
    const { year, month, addOneMonth, subOneMonth } = useCalendar();

    // fetchOnDutyUsers(); // 初始拉取一次

    useEffect(() => {
        fetchOnDutyUsers();
        initStore();
    }, []);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;

    return (
        <Theme accentColor="indigo">
            <DialogContextProvider>
                <div className="w-screen w-[100dvw] h-screen h-[100dvh] relative flex flex-col overflow-clip  bg-gray-100">
                    <header
                        className=" sticky w-full top-0  h-[3rem] text-white bg-blue-900 z-50 "
                        style={{ gridRow: "1" }}
                    >
                        <div className="flex flex-row h-full items-center justify-between  flex-1">
                            <h3 className="text-xl mx-4 font-bold  flex gap-2 max-[500px]:hidden">
                                <TowerControl />
                                ZHEC 管制执勤统计
                            </h3>
                            {showDetail ? (
                                <div className="flex flex-row  gap-2 items-center  _invisible">
                                    <h3 className="text-xl mx-4 font-bold ">{`${year}年${month + 1}月`}</h3>
                                    <Button
                                        size="1"
                                        onClick={() => {
                                            subOneMonth();
                                        }}
                                    >
                                        上一月
                                    </Button>
                                    <Button
                                        size="1"
                                        onClick={() => {
                                            addOneMonth();
                                        }}
                                    >
                                        下一月
                                    </Button>
                                </div>
                            ) : (
                                ""
                            )}

                            <div className="text-xl mx-4 font-bold flex gap-2  flex-wrap items-center ">
                                <Button variant="surface" onClick={() => setShowDetail(!showDetail)}>
                                    <CalendarRange />
                                    详细
                                </Button>
                                {/* <span className="min-w-[1px]  bg-white h-full min-h-4"></span> */}
                                {/* <HandMetal /> */}
                                {/* <Switch color="blue" variant="classic" defaultChecked /> */}
                                {/* <ScanFace /> */}
                            </div>
                        </div>
                    </header>

                    <>
                        {!showDetail ? (
                            <div className="flex flex-row flex-wrap gap-4 p-2 m-6 items-start content-start flex-1">
                                {positions?.map((item, index) => {
                                    return <Position key={index} {...item} />;
                                })}
                            </div>
                        ) : (
                            <DetailPage year={year} month={month} />
                        )}
                    </>
                    {/* <div className=" fixed  bottom-0">
                    <div>onDutyUsers:{JSON.stringify(onDutyUsers)}</div>
                    <br></br>
                    <div>selectedPosition:{JSON.stringify(selectedPosition)}</div>
                    <br></br>
                    <div>selectedDutyRecord:{JSON.stringify(selectedDutyRecord)}</div>
                </div> */}
                    {/* <FaceDialog /> */}
                    <UserListDialog />
                    <ConfirmGetOutDialog />
                    {/* <TimelineDutyDialog /> */}
                    {/* {JSON.stringify(messages)} */}
                </div>
            </DialogContextProvider>
        </Theme>
    );
}

export default AppMobile;
