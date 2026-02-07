import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import RadioButtonUserList from "./RadioButtonUserList/RadioButtonUserList";
import LikeExcel from "./LikeExcel/LikeExcel";
import dayjs from "dayjs";
import { SERVER_URL, FETCHER } from "@utils";

function Sheet() {
    const [month, setMonth] = useState(dayjs().month());
    const [queryName, setQueryName] = useState("");

    const [dutyRows, setDutyRows] = useState([]);
    const [dutyStatics, setDutyStatics] = useState([]);

    useEffect(() => {
        // append 可以添加多个相同名称的参数

        if (month !== null && queryName !== "") {
            let q = new URLSearchParams();

            q.append("username", queryName);

            // Append startDate and startTime
            q.append("startDate", dayjs().month(month).date(1).format("YYYY-MM-DD"));
            q.append("startTime", "00:00:00");

            // Append endDate and endTime
            q.append(
                "endDate",
                dayjs()
                    .month(month + 1)
                    .date(1)
                    .format("YYYY-MM-DD")
            );
            q.append("endTime", "00:00:01");

            fetch(`${SERVER_URL}/query/statics?${q}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log("data", data);
                    setDutyRows(data);
                });

            q.append("year", dayjs().get("year"));
            q.append("month", dayjs().get("month"));

            fetch(`${SERVER_URL}/query/statics?${q}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setDutyStatics(data);
                });
        } else {
            setDutyRows([]);
        }
    }, [month, queryName]);

    return (
        <div className="flex flex-row flex-nowrap">
            <div className="flex flex-1 flex-col flex-nowrap text-nowrap">
                <LikeExcel selectedMonth={month} onClick={setMonth} dutyRows={dutyRows} dutyStatics={dutyStatics} />
            </div>
            <aside className=" border-l px-2 w-64">
                <RadioButtonUserList queryName={queryName} onClick={setQueryName} />
            </aside>
        </div>
    );
}

export default Sheet;

{
    /* <div  className="sheet-item border border-gray-600 items-center flex">
<ChevronLeft size={16} absoluteStrokeWidth />
</div>
<div  className="sheet-item border border-gray-600 items-center flex">
<ChevronRight size={16} absoluteStrokeWidth />
</div>
<div  className="sheet-item border border-gray-600 items-center flex">
<Ellipsis size={16} absoluteStrokeWidth />
</div>
{Array(20)
 .fill(0)
 .map((x, i) => {
     return (
         <div key={i} className="sheet-item border border-gray-600">
             <div className="sheet-item-title px-2">Sheet {i + 1}</div>
         </div>
     );
 })} */
}
