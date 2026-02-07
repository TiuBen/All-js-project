import React, { useState } from "react";
import useSWR from "swr";
import {  FETCHER, usePage } from "@utils";
import { API_URL } from "../../utils/const/Const";

// function RadioButtonUserList({ queryName, onClick }) {
function RadioButtonUserList() {
    const { data: userList, error, isLoading } = useSWR(`${API_URL.users}?orderBy=team`, FETCHER);
    const [selectedUserName, setSelectedUserName] = useState("");
    const { payload, setPayload } = usePage();

    if (error) return <div>Failed to load</div>;
    if (isLoading) return <div>Loading...</div>;
    return (
        <div className="flex flex-row flex-wrap text-nowrap flex-1  content-start gap-1 m-2">
            {userList.flat().map((item, i) => {
                return (
                    <label
                        key={i}
                        className="border border-1 border-slate-500  rounded-md  flex flex-row gap-1  px-2 py-1    text-center"
                    >
                        <input
                            type="radio"
                            value={item.username}
                            checked={item.username === selectedUserName}
                            onChange={(e) => {
                                setSelectedUserName(e.target.value);
                                setPayload(item);
                            }}
                        />
                        {item.username}
                    </label>
                );
            })}
        </div>
    );
}

export default RadioButtonUserList;
