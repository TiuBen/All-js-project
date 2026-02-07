"use client";

import React from "react";
import { useEffect, useState } from "react";
import { server, serverActions } from "@/lib/CONST";
import { useLocalStorageState } from "ahooks";

function Position() {
  
    const [position, ] = useLocalStorageState("position",{ listenStorageChange: true });

    const [displayPosition, setDisplayPosition] = useState(null);


    // useEffect(() => {
    //     fetch(server, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             action: serverActions.GetThisPosition,
    //         }),
    //     })
    //         .then((res) => {
    //             console.log(res);
    //             return res.text();
    //         })
    //         .then((data) => {
    //             console.log(data);
    //             setPosition(data);
    //         })
    //         .catch((err) => console.log(err));
    // }, []);


    useEffect(() => {
        if (position !== "") {
            setDisplayPosition(position);
        }
    }, [position]);


    return <div>{displayPosition!==""&& displayPosition}</div>;
}

export default Position;
