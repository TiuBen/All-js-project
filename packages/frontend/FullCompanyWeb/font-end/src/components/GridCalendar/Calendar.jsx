import React, { useState } from "react";
import SwitchDayWeekMonthYear from "./SwitchDayWeekMonthYear";
import GridYear from "./GridYear";
import GridMonth from "./GridMonth";
import GridWeek from "./GridWeek";
import dayjs from "dayjs";
import "./Calendar.css";

function InnerComponent({ type, year, month, date, isInYear }) {
    switch (type) {
        case "YEAR":
            return <GridYear year={year} month={month} date={date} />;
        case "MONTH":
            return <GridMonth year={year} month={month} date={date} isInYear={isInYear} />;
        case "WEEK":
            return <GridWeek />;
        default:
            return <div>{type}</div>;
    }
}

export default function Calendar() {
    const [component, setComponent] = useState("WEEK");
    const [YYYY, setYYYY] = useState(dayjs().year());
    const [MM, setMM] = useState(dayjs().month());
    const [DD, setDD] = useState(0);

    return (
        <div
            className="grid-calendar"
            style={{ display: "flex", flex: 1, flexDirection: "column", border: "2px dashed red" }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row ",
                    border: "2px dashed red",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2>
                    {YYYY}年{MM}月
                </h2>
                <SwitchDayWeekMonthYear
                    onClick={(i, isInYear) => {
                        console.log(i.target.value);
                        setComponent(i.target.value);
                        console.log(isInYear);
                    }}
                />
            </div>
            <InnerComponent type={component} year={YYYY} month={MM} day={DD} />
        </div>
    );
}
