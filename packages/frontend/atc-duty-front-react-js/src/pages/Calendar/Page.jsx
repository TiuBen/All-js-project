import React, { useEffect, useState } from "react";
// import { MonthCalender } from "@sn/MonthCalender";
// import { useCalendar } from "@sn/useCalender";
// import { Button } from "@radix-ui/themes";
// import dayjs from "dayjs";
// import { ArrowLeft, ArrowRight } from "lucide-react";
// import { API_URL } from "../../../utils/const/Const";
// import RightBarSelectDayDetail from "./RightBarSelectDayDetail";

import { TestButton } from "@sn/ui";

// function DayCellElement({ date, onClick }) {
//     const startDate = dayjs(date, "YYYY-MM-DD").format("YYYY-MM-DD");
//     const startTime = "00:00:00";
//     const endDate = dayjs(date, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD");
//     const endTime = "00:00:01";

//     const query = new URLSearchParams({ startDate, startTime, endDate, endTime });
//     query.append("calculate", "day");

//     const { data, error, isLoading } = useSWR(`${SERVER_URL}/duty?${query}`, fetcher);

//     if (error) return <div>failed to load</div>;
//     if (isLoading) return <div>loading...</div>;
//     const usernameSet = new Set(data.map((item) => item.username));
//     const usernameArray = Array.from(usernameSet);
//     return (
//         <div className="flex flex-col items-start justify-center  overflow-y-scroll" onClick={() => onClick(date)}>
//             <div className="text-sm text-gray-500 px-1 text-ellipsis">{usernameArray.join(",")}</div>
//         </div>
//     );
// }

// function TimeLineSidebar({ date }) {
//     const startDate = dayjs(date, "YYYY-MM-DD").format("YYYY-MM-DD");
//     const startTime = "00:00:00";
//     const endDate = dayjs(date, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD");
//     const endTime = "00:00:01";

//     const query = new URLSearchParams({ startDate, startTime, endDate, endTime });
//     query.append("calculate", "month");

//     const { data, error, isLoading } = useSWR(`${API_URL.query_statics}/${query}`, fetcher);

//     if (error) return <div>failed to load</div>;
//     if (isLoading) return <div>loading...</div>;

//     return (
//         <div className="flex flex-col items-start justify-center  overflow-auto p-4">
//             <ul className="text-sm text-gray-500 px-1">
//                 {data.map((x, index) => {
//                     return <li key={index}>{x.username}</li>;
//                 })}
//             </ul>
//         </div>
//     );
// }

function Page() {
    // const { year, month, addOneMonth, subOneMonth } = useCalendar();

    // useEffect(() => {
    // const _data = getDuty(new URLSearchParams({ year: year, month: month }));
    // }, [year, month]);

    // const [date, setDate] = useState("");

    return (
        <div className=" flex flex-row flex-1 items-stretch w-full h-full ">
            <div className="flex-1 p-2 items-stretch justify-stretch flex">
                ddddd
                <TestButton>dddd</TestButton>
            </div>
        </div>
    );
}
