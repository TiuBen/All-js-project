import dayjs from "dayjs";
import React, { useEffect, useState, useCallback } from "react";
import { Request, useUser } from "../../../utils";
// import "../DefaultPage.scss";

const _2023Holiday = [
    "2022-12-31",
    "2023-01-01",
    "2023-01-02",
    "2023-01-21",
    "2023-01-22",
    "2023-01-23",
    "2023-01-24",
    "2023-01-25",
    "2023-01-26",
    "2023-01-27",
    "2023-04-05",
    "2023-04-29",
    "2023-04-30",
    "2023-05-01",
    "2023-05-02",
    "2023-05-03",
    "2023-06-22",
    "2023-06-23",
    "2023-06-24",
    "2023-09-29",
    "2023-09-30",
    "2023-10-01",
    "2023-10-02",
    "2023-10-03",
    "2023-10-04",
    "2023-10-05",
    "2023-10-06",
    "2023-12-31",
];

function isChickInF(dataArray, searchString) {
    return dataArray.some((obj) =>obj["checkin_time"]?.includes(searchString));
    // // console.log();
    // return dataArray.some((obj) => {
    //     console.log(obj["checkin_time"]);
    //     return obj["checkin_time"] !== null;
    // });
}

function CheckInYearIndicator({isChecked}) {
    const today = new Date();
    const _yeatFirsday = new Date(today.getFullYear(), 0, 1).getDay(); // 1-6,0
    // console.log(today.getFullYear());
    const perFix = _yeatFirsday === 0 ? 6 : _yeatFirsday - 1;
    // console.log(perFix);
    // console.log(dayjs(new Date(today.getFullYear(), 0, -1)).format("YYYY-M-D"));

    const { user } = useUser();
    const [checkin, setCheckIn] = useState([]);
    const [holidays, setHolidays] = useState([]);
    useEffect(() => {
        Request.get("/checkins", { params: { uuid: user.uuid } }).then((data) => {
            // console.log(data);
            var _temp = [];
            var _tempHoliday = [];
            Array.from({ length: 7 * 53 }).map((x, index) => {
                _temp[index] = isChickInF(
                    data,
                    dayjs(new Date(today.getFullYear(), 0, 1 - perFix + index)).format("YYYY-MM-DD")
                );
                _tempHoliday[index] = _2023Holiday.includes(
                    dayjs(new Date(today.getFullYear(), 0, 1 - perFix + index)).format("YYYY-MM-DD")
                )
                    ? true
                    : false;
            });
            // console.log(_temp);

            setCheckIn(_temp);
            // console.log(_tempHoliday);
            setHolidays(_tempHoliday);
        });
    }, [isChecked]);

    return (
        <div className="flex flex-col flex-grow-0  items-start">
            <div>
                <div className="flex flex-row  w-full justify-evenly">
                    <div style={{ marginLeft: "1rem" }}>一月</div>
                    <div>二月</div>
                    <div>三月</div>
                    <div>四月</div>
                    <div>五月</div>
                    <div>六月</div>
                    <div>七月</div>
                    <div>八月</div>
                    <div>九月</div>
                    <div>十月</div>
                    <div>十一月</div>
                    <div>十二月</div>
                </div>
                <div className="check-in-year-indicator grid gap-[5px] grid-rows-[repeat(7,16px)] grid-cols-[3.5rem,16px] grid-flow-col  flex-grow-0">
                    <div className="date">一</div>
                    <div className="date">二</div>
                    <div className="date">三</div>
                    <div className="date">四</div>
                    <div className="date">五</div>
                    <div className="date">六</div>
                    <div className="date">日</div>
                    {Array.from({ length: 7 * 53 }).map((x, index) => {
                        return (
                            <div
                                key={index}
                                data-time={dayjs(new Date(today.getFullYear(), 0, 1 - perFix + index)).format(
                                    "YYYY-MM-DD"
                                )}
                                data-vacation={holidays[index] ? "法定假期" : null}
                                className="border relative rounded w-4 h-4"
                                // className={`checkin-date tooltip ${checkin[index] ? "full" : "not-yet"} ${
                                //     holidays[index] ? "vacation" : null
                                // }`}
                            ></div>
                        );
                    })}
                </div>
            </div>

            {/* <div className="check-in-year-indicator ">
                <div className="absent"></div>
                <div className="late"></div>
                <div className="early"></div>
                <div className="full"></div>
                <div className="not-yet"></div>
            </div> */}
        </div>
    );
}

export default CheckInYearIndicator;
