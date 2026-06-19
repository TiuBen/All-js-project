import { useState, useEffect } from "react";

function useGetPlansByName(name) {
    const [plans, setPlans] = useState({
        "name":name,
        'short':[],
        'long':[]
    });

    useEffect(() => {
        console.log("hooks 通过 name 用传统SQL 获取 该name下的 所有 plan 的 ID");
        fetch("http://localhost:3100/plan?" + new URLSearchParams({ "name":name}), {
            method: "get",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => {
            return res.json()
        }).then((json) => {
            console.log(json);


        });
    }, [name]);

    return plans;
}

export { useGetPlansByName };
