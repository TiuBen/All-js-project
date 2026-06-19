import { useState, useEffect } from "react";

function useGetPlanByUUID(uuid) {
    const [content, setContent] = useState("");

    useEffect(() => {
        fetch("http://localhost:3100/plan?" + new URLSearchParams({ uuid: uuid }), {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json)
            .then((data) => {
                setContent(data);
            });
    }, [uuid]);

    return content;
}

export { useGetPlanByUUID };
