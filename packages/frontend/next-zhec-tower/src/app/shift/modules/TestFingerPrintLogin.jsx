"use client";
import { useEffect, useState } from "react";
import { Box, Button } from "@radix-ui/themes";
import { GetOneRandomName, server, serverActions } from "@/lib/CONST";
import FingerPrint from "@/components/FingerPrint";
export default function TestFingerPrintLogin() {
    const [name, setName] = useState("");

    const [peoplePrepared, setPeoplePrepared] = useState(null);

    useEffect(() => {
        fetch(server, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: serverActions.GetWhoIsPrepared,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (!data?.error) {
                    
                    setPeoplePrepared(data);
                }
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <div>
            <div>因为是测试请选择一个已经完成岗前准备的人</div>
       
            <ul>
                {peoplePrepared&&peoplePrepared.map((person, index) => {
                    return (
                        <li key={index}>
                            <label>
                                <input
                                    type="radio"
                                    key={index}
                                    onClick={() => {
                                        setName(person.username);
                                    }}
                                    value={person.username}
                                />
                                {person.username} {person.shiftType}
                            </label>
                        </li>
                    );
                })}
            </ul>

        </div>
    );
}
