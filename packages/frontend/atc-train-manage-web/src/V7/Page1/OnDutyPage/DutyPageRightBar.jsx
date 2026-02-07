import React, { useRef } from "react";
import { useSize } from "ahooks";
import useSWR from "swr";
import { SERVER_URL, FETCHER, useOnDutyUser } from "@utils";
import dayjs from "dayjs";
function RightBarSelectDayDetail() {
    const ref = useRef(null);
    const size = useSize(ref);
    414444;
    // const { data, error, isLoading } = useSWR(`${SERVER_URL}/query/positions`, FETCHER);
    let todayQ = new URLSearchParams();
    todayQ.append("startDate", dayjs().format("YYYY-MM-DD"));
    todayQ.append("startTime", "00:00:00");
    todayQ.append("endDate", dayjs().add(1, "day").format("YYYY-MM-DD"));
    todayQ.append("endTime", "00:00:01");

    const { data, error, isLoading } = useSWR(`${SERVER_URL}/query/statics?${todayQ}`, FETCHER);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;

    let _l = [];
    return (
        <div className="border border-red-500 flex-1 h-full" ref={ref}>
            {/* <p>Try to resize the preview window </p>
            <p>
                width: {size?.width}px, height: {size?.height}px
            </p>
            <div className="timeline relative h-full w-full">
                {data.map((item, index) => {
                    if (!_l.includes(item.position + item.dutyType)) {
                        _l.push(item.position + item.dutyType);
                        console.log(_l);
                        console.log(_l.indexOf(item.position + item.dutyType));
                    }

                    return (
                        <div
                            key={index}
                            className={`container absolute  bg-white border border-blue-700 w-[1.5rem]`}
                            style={{
                                left: `${_l.indexOf(item.position + item.dutyType) * 30}px`,
                                top: `${
                                    (size?.height / 24 / 60) *
                                    (dayjs(item.inTime).get("h") * 60 + dayjs(item.inTime).get("m"))
                                }px`, // Set top position
                                height: `${
                                    (size?.height / (24 * 60)) * dayjs(item.outTime).diff(item.inTime, "m", true)
                                }px`, // Set height
                            }}
                        >
                            <div className="hight-bar absolute left-0 w-[3px] h-full bg-red-300"></div>
                            <div
                                className="content pl-[1px] writing-mode-vertical-rl text-orientation-upright write text-nowrap"
                                style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
                            >
                                <div className="username writing-mode-vertical-rl text-orientation-upright">
                                    {item.username}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div> */}
            功能待开发
        </div>
    );
}

export default RightBarSelectDayDetail;
