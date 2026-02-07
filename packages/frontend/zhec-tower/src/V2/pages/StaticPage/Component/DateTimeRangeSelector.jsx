import React, { useState, useEffect } from "react";
import { Button } from "@radix-ui/themes";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";

function DateTimeRangeSelector(props) {
    // console.log(props);
    const { startDate,startTime,endDate,endTime,setDateRange } = props;
    const [userData, setUserData] = useState({});

    // const [startDate, setStartDate] = useState(props.startDate);
    // const [startTime, setStartTime] = useState(props.startTime);
    // const [endDate, setEndDate] = useState(props.endDate);
    // const [endTime, setEndTime] = useState(props.endTime);
    const [isQueryButtonDisabled, setIsQueryButtonDisabled] = useState(false);
    const [dateArray, setDateArray] = useState(null);
    const [extended, setExtended] = useState(true);

    useEffect(() => {
        // console.log(dayjs(startDate).isBefore(dayjs(endDate)));
        // console.log(dayjs(startTime,"HH:mm"));
        // console.log(dayjs(endTime,"HH:mm"));
        // console.log(dayjs(startTime, "HH:mm").isBefore(dayjs(endTime, "HH:mm")));
        if (dayjs(startDate).isBefore(dayjs(endDate)) && dayjs(endTime, "HH:mm").isAfter(dayjs(startTime, "HH:mm"))) {
            setIsQueryButtonDisabled(false);
        } else {
            setIsQueryButtonDisabled(true);
        }
        //
        const _dateArray = [];
        const _startDate = dayjs(startDate, "YYYY-MM-DD");
        const daysCount = dayjs(endDate, "YYYY-MM-DD").diff(_startDate, "day");
        // console.log(daysCount);
        for (let index = 0; index < daysCount + 1; index++) {
            const _d = _startDate.add(index, "d").format("YYYY-MM-DD");
            _dateArray.push(_d);
        }
        setDateArray(_dateArray);
        // console.log(_dateArray);
    }, [startDate, startTime, endDate, endTime]);

    return (
        <div className="flex flex-col  gap-2    px-2 border  text-nowrap">
            <label
                className="font-semibold flex flex-row gap-1"
                onClick={() => {
                    console.log("extended");
                    setExtended(!extended);
                }}
            >
                选择时间:
                <ChevronDown
                    className={` shrink-0 text-muted-foreground transition-transform duration-200 ${
                        extended ? "rotate-180" : ""
                    } }`}
                />
            </label>

            <div
                className={`flex flex-col sm:flex-row  gap-2 ${
                    extended ? "" : "hidden"
                } transition-all duration-500 ease-in-out`}
            >
                <div className="flex flex-col sm:flex-row  gap-2  items-center">
                    <label htmlFor="end-time-input " className=" text-nowrap">
                        开始时间
                    </label>

                    <div className="flex flex-col sm:flex-row sm:gap-2 ">
                        <input
                            id="end-time-input"
                            type="date"
                            className="border border-spacing-2 p-[0.1rem]  rounded-sm"
                            defaultValue={startDate}
                            onChange={(e) => {
                                setDateRange((prev) => {
                                    return { ...prev, startDate: e.target.value };
                                });
                            }}
                        />
                        <input
                            id="start-time-input"
                            type="time"
                            className="border border-spacing-2 p-[0.1rem]  rounded-sm"
                            defaultValue={startTime}
                            onChange={(e) =>{
                                setDateRange((prev) => {
                                    return { ...prev, startTime: e.target.value };
                                });
                            }}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row  gap-2  items-center">
                    <label htmlFor="end-time-input">结束时间</label>

                    <div className="flex flex-col sm:flex-row sm:gap-2 ">
                        <input
                            id="end-time-input"
                            type="date"
                            className="border border-spacing-2 p-[0.1rem]  rounded-sm"
                            defaultValue={endDate}
                            min={startDate}
                            onChange={(e) => {
                                setDateRange((prev) => {
                                    return { ...prev, endDate: e.target.value };
                                });
                            }}
                        />
                        <input
                            id="start-time-input"
                            type="time"
                            className="border border-spacing-2 p-[0.1rem]  rounded-sm"
                            defaultValue={endTime}
                            onChange={(e) => {
                                setDateRange((prev) => {
                                    return { ...prev, endTime: e.target.value };
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DateTimeRangeSelector;
