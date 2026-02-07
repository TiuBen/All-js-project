import React, { useEffect, useState } from "react";
import { server, serverActions, FakeOnDuty, positionData1 as p1, positionData2 as p2 } from "../../lib/CONST";
import Avatar from "../../components/Avatar";
import { useLocalStorageState } from "ahooks";
function OnDutyPerson(props) {
    const { username, status = "正在执勤" } = props;

    // 正在执勤
    // 正在接班
    // 正在交班
    // 见习

    return (
        <div className="flex flex-col items-stretch text-center flex-shrink-0 gap-2 justify-start border rounded-lg p-1">
            <Avatar username={username}/>
            <div className="flex flex-col min-w-[4rem]">
                <label className="font-extrabold ">{username || ""}</label>
                <label className=" text-xs text-gray-400">{status}</label>
            </div>
        </div>
    );
}

function OnDutyPosition(props) {
    const { position, needTwoPeople = null } = props;
    const [selectedPosition, setSelectedPosition] = useLocalStorageState("position", { listenStorageChange: true });

    const [positionData, setPositionData] = useState(null);
    const [positionData2, setPositionData2] = useState(null);

    useEffect(() => {
        if (needTwoPeople === null) {
            fetch(
                server +
                    "/duty?" +
                    new URLSearchParams({
                        position: position,
                    })
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);

                    if (data.error) {
                        setPositionData(null);
                    } else {
                        setPositionData(data);
                    }
                });
        } else {
            fetch(
                server +
                    "/duty?" +
                    new URLSearchParams({
                        position: position,
                        dutyType: "主班",
                    })
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);

                    if (data.error) {
                        setPositionData(null);
                    } else {
                        setPositionData(data);
                    }
                });
        }

        if (needTwoPeople) {
            fetch(
                server +
                    "/duty?" +
                    new URLSearchParams({
                        position: position,
                        dutyType: "副班",
                    })
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setPositionData(null);
                    } else {
                        setPositionData2(data);
                    }
                });
        }
    }, [position, needTwoPeople]);

    // useEffect(() => {
    //     fetch(
    //         server +
    //             "/duty?" +
    //             new URLSearchParams({
    //                 position: position,
    //                 dutyType: "主班",
    //             })
    //     )
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log(data);
    //             // setPositionData();
    //         });
    // }, [position]);

    // const [selectedPosition,setSelectedPosition] = useLocalStorage("position");

    return (
        <div className=" flex  flex-col items-center border rounded-lg m-1">
            <label className="text-center font-black text-lg bg-blue-200 flex-1  w-full rounded-t-lg">
                {position || "本席位名称"}
                <input
                    type="radio"
                    name="position"
                    value={position}
                    checked={selectedPosition === position}
                    onChange={() => {
                        setSelectedPosition(position);
                    }}
                />
            </label>
            <div className="flex flex-row  items-start">
                {needTwoPeople === true ? (
                    <>
                        <div className="flex flex-row gap-2 p-2 border rounded-lg  m-1">
                            <h3 className=" font-black text-lg">主班</h3>
                            <div className="flex flex-col flex-wrap gap-2">
                                {positionData !== null ? (
                                    <>
                                        {positionData.map((data, index) => {
                                            return (
                                                <OnDutyPerson
                                                    key={index}
                                                    username={data.username}
                                                    status={data.status}
                                                />
                                            );
                                        })}
                                    </>
                                ) : (
                                    <div className="border rounded-lg p-1">暂时无人</div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 p-2 border rounded-lg m-1">
                            <h3 className=" font-black text-lg">副班</h3>
                            <div className="flex flex-col flex-wrap gap-2">
                                {positionData2 !== null ? (
                                    <>
                                        {positionData2.map((data, index) => {
                                            return (
                                                <OnDutyPerson
                                                    key={index}
                                                    username={data.username}
                                                    status={data.status}
                                                />
                                            );
                                        })}
                                    </>
                                ) : (
                                    <div className="border rounded-lg p-1">暂时无人</div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {positionData !== null ? (
                            <>
                                {positionData.map((data, index) => {
                                    return <OnDutyPerson key={index} username={data.username} status={data.status} />;
                                })}
                            </>
                        ) : (
                            <div className="border rounded-lg p-1">暂时无人</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default OnDutyPosition;
