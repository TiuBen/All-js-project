import React, { useEffect, useState } from "react";
import RadioButtonUserList from "../../BarRight/RadioButtonUserList";
import LikeExcel from "./LikeExcel/LikeExcel";
import useSWR, { mutate } from "swr";
import { FETCHER, usePage } from "@utils";
import { API_URL } from "../../../utils/const/Const";
import useStore from "../../../utils/store/userStore";
import dayjs from "dayjs";

function Sheet() {
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
    const { payload, setPayload } = usePage();
    const { selectedUser } = useStore();
    const [searchParams, setSearchParams] = useState(null);
    const { data: selectedUserDutyRows, mutate: reGetSelectedUserDutyRows } = useSWR(
        searchParams ? `${API_URL.duty}?${searchParams}` : null,
        FETCHER,
        {
            // 可选配置：防抖等逻辑通常需要在输入框层面处理，这里可以配置一些SWR选项
            revalidateOnFocus: true, // 例如，搜索结果可能不需要在窗口聚焦时重新验证
            fallbackData: [],
        }
    );

    const { data: selectedUserDutyStatistics, mutate: reGetSelectedUserDutyStatistics } = useSWR(
        searchParams ? `${API_URL.users}/${searchParams.get("userId")}/dutyStatistics?${searchParams}` : null,
        FETCHER,
        {
            // 可选配置：防抖等逻辑通常需要在输入框层面处理，这里可以配置一些SWR选项
            revalidateOnFocus: true, // 例如，搜索结果可能不需要在窗口聚焦时重新验证
            fallbackData: {},
        }
    );

    useEffect(() => {
        // append 可以添加多个相同名称的参数
       
             console.log("selectedMonth", selectedMonth);
        console.log("selectedUser", selectedUser);
            let q = new URLSearchParams();

            q.append("userId", selectedUser?.id);
            q.append("username", selectedUser?.username);

            // Append startDate and startTime
            q.append("startDate", dayjs().month(selectedMonth).date(1).format("YYYY-MM-DD"));
            q.append("startTime", "00:00:00");

            // Append endDate and endTime
            q.append(
                "endDate",
                dayjs()
                    .month(selectedMonth + 1)
                    .date(1)
                    .format("YYYY-MM-DD")
            );
            q.append("endTime", "00:00:01");
            console.log("q", q.toString());

            setSearchParams(q);
    }, [selectedMonth, selectedUser, payload]);

    return (
        <>
            <div className="flex-1 flex flex-col  text-nowrap overflow-auto  p-2 gap-2 w-full    ">
                <LikeExcel
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedUserDutyRows={selectedUserDutyRows}
                    selectedUserDutyStatistics={selectedUserDutyStatistics}
                    reGetSelectedUserDutyRows={reGetSelectedUserDutyRows}
                    reGetSelectedUserDutyStatistics={reGetSelectedUserDutyStatistics}
                />
            </div>
            <RadioButtonUserList />
        </>
    );
}

export default Sheet;
