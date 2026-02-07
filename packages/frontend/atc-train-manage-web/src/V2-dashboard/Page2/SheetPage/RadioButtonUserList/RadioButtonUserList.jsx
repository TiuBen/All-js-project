import React from "react";
import useSWR from "swr";
import { SERVER_URL, FETCHER } from "@utils";
function RadioButtonUserList({queryName,onClick}) {
   

    const { data: userList, error, isLoading } = useSWR(`${SERVER_URL}/query/orderedusername`, FETCHER);

    if (error) return <div>Failed to load</div>;
    if (isLoading) return <div>Loading...</div>;
    return (
        <div className="flex flex-row flex-wrap text-nowrap flex-1  content-start gap-1 ">
            {userList.flat().map((username, i) => {
                return (
                    <label
                        key={i}
                        className="border border-1 border-green-500  rounded-md  flex flex-row gap-1  px-2 py-1    text-center"
                    >
                        <input
                            type="radio"
                            value={username}
                            checked={username === queryName}
                            onChange={(e) => {
                                onClick(e.target.value);
                            }}
                        />
                        {username}
                    </label>
                );
            })}
        </div>
    );
}

export default RadioButtonUserList;
