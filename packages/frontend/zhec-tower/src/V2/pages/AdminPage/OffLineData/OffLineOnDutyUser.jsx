import React, { useState, useEffect } from "react";
import { useOnDutyUser } from "../../../hooks/index";
import { useLocalStorageState } from "ahooks";
import PostObjects from "./OffLineData";


function OffLineOnDutyUser() {
    const { onDutyUser, setOnDutyUser } = useOnDutyUser();
    const [offlineOnDutyUser, setOfflineOnDutyUser] = useLocalStorageState("offlineOnDutyUser", {
        defaultValue: onDutyUser,
        listenStorageChange: true,
    });


    
    const [needPost, setNeedPost] = useState([]);

    useEffect(() => {
      const _temp = offlineOnDutyUser.filter((user) => {
            console.log(user);
            return (
                user.id.toString().includes("offline") && user.relatedDutyTableRowId.includes("offline") && user.status !== null
            );
        });
        console.log("needPost", _temp);
        setNeedPost(_temp);
        
    }, [offlineOnDutyUser]);

    return (
        <div>
           
            <PostObjects objects={needPost}/>


            {needPost && (
                <table className="table-auto">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium border-r">index</th>
                            <th className="px-6 py-3 text-sm font-medium ">user</th>
                        </tr>
                    </thead>
                    <tbody>
                        {needPost.map((user, index) => (
                            <tr key={index} className={` ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                                <td className="border text-center">{index + 1}</td>
                                <td className="border px-4 py-2 text-sm">{JSON.stringify(user)}</td>{" "}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OffLineOnDutyUser;
