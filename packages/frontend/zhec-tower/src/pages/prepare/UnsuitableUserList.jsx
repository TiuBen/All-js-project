import React, { useState, useEffect } from "react";
import { server } from "../../lib/CONST";
import dayjs from "dayjs";
import { Button } from "@radix-ui/themes";
function UnsuitableUserList(props) {
    const [unsuitableUserList, setUnsuitableUserList] = useState(null);
    const { needReload, setNeedReload } = props;

    // const [needReload, setNeedReload] = useState(true);
    useEffect(() => {
        fetch(
            server +
                "/prepare?" +
                new URLSearchParams({
                    isPrepared: 0,
                })
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
                setUnsuitableUserList([...data]);
            })
            .catch((err) => console.log(err))
            .finally(() => {
                // setNeedReload(false);
            });
    }, []);

    useEffect(() => {
        if (needReload) {
            fetch(
                server +
                    "/prepare?" +
                    new URLSearchParams({
                        isPrepared: 0,
                    })
            )
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    setUnsuitableUserList([...data]);
                })
                .catch((err) => console.log(err))
                .finally(() => {
                    // setNeedReload(false);
                });
        }
    }, [needReload]);

    // useEffect(() => {
    //     if (watchReload) {
    //         setNeedReload({});
    //     }
    //     setNeedReload({});
    // }, [unsuitableUserList]);

    return (
        <div>
            {unsuitableUserList && (
                <>
                    {
                        <ul className="flex flex-col gap-2">
                            {unsuitableUserList.map((item, index) => (
                                <li
                                    key={index}
                                    className="text-red-500 border rounded flex items-stretch flex-row gap-2 px-2 py-1"
                                >
                                    <div>{index + 1}、</div>
                                    <div className="flex-1">
                                        {item.username}：
                                        <span>
                                            在{dayjs(item.prepareTime).format("DD日HH:MM") + "的岗前准备不合格"}
                                        </span>
                                        <div>请休息30分钟后再进行岗前准备！</div>
                                    </div>
                                    <button
                                        className="border rounded-md bg-blue-600 text-white px-2 py-1 self-center"
                                        onClick={() => {
                                            fetch(server + "/prepare", {
                                                method: "PUT",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    ...item,
                                                    isPrepared: 1,
                                                }),
                                            })
                                                .then((res) => res.json())
                                                .then((data) => {
                                                    console.log(data);
                                                })
                                                .catch((err) => console.log(err));

                                            setNeedReload({});
                                        }}
                                    >
                                        处理
                                    </button>
                                </li>
                            ))}
                        </ul>
                    }
                </>
            )}
        </div>
    );
}

export default UnsuitableUserList;
