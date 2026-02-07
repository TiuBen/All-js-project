import React, { createContext, useState, useEffect } from "react";
import { useNetwork, useLocalStorageState } from "ahooks";
import { PositionsWithDutyType, server } from "../../lib/CONST";
import dayjs from "dayjs";

export const OnDutyUserContext = createContext();

export const OnDutyUserContextProvider = ({ children }) => {
    const [onDutyUser, setOnDutyUser] = useState([]); // ! 必须默认是【】
    // single user on duty data
    const [singleUserOnDutyData, setSingleUserOnDutyData] = useState([]);
    const { online } = useNetwork();
    const [offlineOnDutyUser, setOfflineOnDutyUser] = useLocalStorageState("offlineOnDutyUser", {
        defaultValue: onDutyUser,
        listenStorageChange: true,
    });

    function groupDutiesByPositionAndType(position, dutyType) {
        console.log("groupDutiesByPositionAndType");
        const _temp = onDutyUser.filter((item) => item.position === position && item.dutyType === dutyType);

        console.log(_temp);
        return _temp;
    }

    const [needReloadData, setNeedReloadData] = useState({});

    function postToServerUserGetIn(props) {
        console.log("postToServerUserGetIn");
        console.log(props);

        if (online) {
            let postData = {
                username: props.username,
                position: props.position,
                dutyType: props.dutyType,
            };
            if (props.roleType === "见习") {
                postData = {
                    username: props.username,
                    position: props.position,
                    dutyType: props.dutyType,
                    roleType: "见习",
                    relatedDutyTableRowId: props.id,
                };
            }

            console.log(postData);
            fetch(`${server}/duty`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            })
                .then((response) => response.json())
                .then((data) => {
                    // console.log("Success:", data);
                    return data;
                })
                .then(() => {
                    setNeedReloadData(Date.now());
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        } else {
            const temp = [...offlineOnDutyUser];
            // ! check if this user is already in some Position
            const index = temp.findIndex((user) => {
                return user.username === props.username && user.outTime === null;
            });
            console.log(index);

            if (index >= 0) {
                // ! use this method to make sure
                alert("离线模式, 还在某个席位上，请先退出！");
            } else {
                // ! now we can make a new user

                let newUserGetIn = {
                    id: "offline" + dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    username: props.username,
                    dutyType: props.dutyType,
                    inTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    outTime: null,
                    position: props.position,
                    roleType: null,
                    relatedDutyTableRowId: props.id,
                    roleStartTime: null,
                    roleEndTime: null,
                    roleTimes: null,
                    status: { isOffline: "true", isSync: "false", modifiedValue: "newUserGetIn" },
                };

                if (props.roleType === "见习") {
                    // ! if this user is a student
                    // ! we need update the teacher

                    newUserGetIn.roleType = "见习";
                    newUserGetIn.roleStartTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

                    const teacherIndex = temp.findIndex((user) => {
                        return user.username === props.excludeUser && user.outTime === null;
                    });

                    console.log("teacher");
                    console.log(temp[teacherIndex]);

                    if (teacherIndex >= 0) {
                        // ! found the teacher
                        // ! update the teacher

                        temp[teacherIndex].roleType = `教员`;
                        if (temp[teacherIndex].relatedDutyTableRowId) {
                            temp[teacherIndex].relatedDutyTableRowId += `;${newUserGetIn.id}`;
                        } else {
                            temp[teacherIndex].relatedDutyTableRowId = newUserGetIn.id + ";";
                        }

                        temp[teacherIndex].roleStartTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                        temp[teacherIndex].status = {
                            isOffline: "true",
                            isSync: "false",
                            modifiedValue: "relatedDutyTableRowId",
                        };
                    }
                }

                console.log(newUserGetIn);

                temp.push(newUserGetIn);
                console.log(temp);
                // setOnDutyUser(temp)
            }
            setOfflineOnDutyUser(temp);
        }
    }

    function putToServerUserGetOut(props) {
        console.log("putToServerUserGetOut");
        console.log(props);

        if (props?.id) {
            if (online) {
                fetch(`${server}/duty`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(props),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log("Success:", data);
                        setNeedReloadData(new Date());
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            } else {
                const temp = [...offlineOnDutyUser];

                const userIndex = temp.findIndex((user) => {
                    return user.id === props.id;
                });

                if (props.roleType === "教员") {
                    // first get this user  id
                    temp[userIndex].outTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[userIndex].roleEndTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[userIndex].roleType = null;
                    temp[userIndex].status = {
                        isOffline: "true",
                        isSync: "false",
                        modifiedValue: "outTime",
                    };

                    const ids = temp[userIndex].relatedDutyTableRowId.split(";");
                    console.log(ids);
                    const studentId = ids[ids.length - 2];
                    console.log("studentId");
                    console.log(studentId);

                    const studentIndex = temp.findIndex((user) => {
                        return user.id === studentId;
                    });

                    console.log("studentIndex");
                    console.log(studentIndex);

                    temp[studentIndex].outTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[studentIndex].roleEndTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[studentIndex].status = {
                        isOffline: "true",
                        isSync: "false",
                        modifiedValue: "outTime",
                    };
                } else if (props.roleType === "见习") {
                    temp[userIndex].outTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[userIndex].roleEndTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

                    temp[userIndex].status = {
                        isOffline: "true",
                        isSync: "false",
                        modifiedValue: "outTime",
                    };

                    // ! find the teacher
                    const teacherIndex = temp.findIndex((user) => {
                        return user.id === props.relatedDutyTableRowId;
                    });

                    temp[teacherIndex].outTime = null;
                    temp[teacherIndex].roleEndTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[teacherIndex].roleType = null;
                    temp[teacherIndex].status = {
                        isOffline: "true",
                        isSync: "false",
                        modifiedValue: "outTime",
                    };
                } else {
                    temp[userIndex].outTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
                    temp[userIndex].status = {
                        isOffline: "true",
                        isSync: "false",
                        modifiedValue: "outTime",
                    };
                }
                setOfflineOnDutyUser(temp);
            }
        }
    }

    // get data by user
    function getDataByUser(props) {
        console.log("getDataByUser");
        console.log(props);

        if (props.username && online) {
            const query = new URLSearchParams();

            Object.entries(props).forEach(([key, value]) => {
                // If the value is an array (or any type), it can be serialized differently
                // In this case, position is an empty array, so we convert it to '[]'
                if (key === "positions") {
                    if (Array.isArray(value)) {
                        query.append(key, JSON.stringify(value.length > 0 ? value.join(";") : ""));
                    }
                } else {
                    query.append(key, value);
                }
               
            });
            console.log(query.toString());

            fetch(`${server}/duty/?${query}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("Success:", data);
                    setSingleUserOnDutyData(data);
                });
        }
    }

    useEffect(() => {
        async function fetchData() {
            console.log("fetchData");
            const _temp = [];

            const fetchPromises = [];

            for (const { position, dutyType } of PositionsWithDutyType) {
                if (dutyType !== undefined) {
                    for (const _dutyType of dutyType) {
                        const params = new URLSearchParams({ position });
                        params.append("dutyType", _dutyType);
                        // console.log(params);
                        const fetchPromise = fetch(`${server}/duty?${params}`)
                            .then((res) => res.json())
                            .then((data) => {
                                _temp.push(...data);
                            })
                            .catch((e) => console.log(e));
                        fetchPromises.push(fetchPromise);
                    }
                } else {
                    const params = new URLSearchParams({ position });

                    const fetchPromise = fetch(`${server}/duty?${params}`)
                        .then((res) => res.json())
                        .then((data) => {
                            _temp.push(...data);
                        })
                        .catch((e) => console.log(e));
                    fetchPromises.push(fetchPromise);
                }
            }

            await Promise.all(fetchPromises);
            const uniqueData = Array.from(new Set(_temp.map((item) => JSON.stringify(item)))).map((item) =>
                JSON.parse(item)
            );
            console.log(_temp);
            console.log(uniqueData);
            setOnDutyUser([...uniqueData]);
            return uniqueData;
            // setOfflineOnDutyUser(uniqueData);
        }

        fetchData().then((data) => {
            setOfflineOnDutyUser(data);
        });
    }, [needReloadData]);

    // ! this part is the code about offline
    // when is offline the users displayed on page should be the same
    // and then
    // useEffect(() => {
    //     if (online) {
    //     } else {
    //         const onDutyOfflineUser = offlineOnDutyUser.filter((user) => {
    //             return user.outTime === null;
    //         });
    //         setOnDutyUser(onDutyOfflineUser);
    //     }
    // }, [online, offlineOnDutyUser]);

    return (
        <OnDutyUserContext.Provider
            value={{
                onDutyUser,
                setOnDutyUser,
                groupDutiesByPositionAndType,
                postToServerUserGetIn,

                putToServerUserGetOut,
                getDataByUser,
                singleUserOnDutyData,
            }}
        >
            {children}
        </OnDutyUserContext.Provider>
    );
};
