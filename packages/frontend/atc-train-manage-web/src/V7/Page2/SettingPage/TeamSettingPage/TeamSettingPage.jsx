import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { API_URL } from "../../../../utils/const/Const";
import useSWR, { mutate } from "swr";
import { usePage, SERVER_URL, FETCHER } from "@utils";
import { Minus, Plus } from "lucide-react";
import useStore from "../../../../utils/store/userStore";
function TeamSettingPage() {
    // const { data: users } = useSWR(`${API_URL.users}`, FETCHER);

    const { users, groupedUsers } = useStore();
    const [teamCount, setTeamCount] = useState(2);

    const [teams, setTeams] = useState([]);

    const [editedUser, setEditedUser] = useState(users);
    const [dragUser, setDragUser] = useState(null);

    // 根据团队数量初始化团队
    // 根据团队数量和用户现有团队分配初始化团队
    useEffect(() => {
        if (groupedUsers) {
            setEditedUser(users);
            setTeamCount(groupedUsers.length);
        }
    }, [groupedUsers]);

    useEffect(() => {
        setTeams(Array.from({ length: teamCount }, (_, i) => i));
        
    }, [teamCount]);


    // 处理拖拽开始
    const handleDragStart = (user) => {
        console.log("handleDragStart", user);

        setDragUser(user);
    };
    // 处理拖拽结束
    const handleDrop = (teamId) => {
        if (dragUser) {
            setEditedUser((prevData) =>
                prevData.map((u) => (u.username === dragUser.username ? { ...u, team: teamId } : u))
            );
            setDragUser(null);
        }
    };

    const handleUnassignedDrop = () => {
        if (dragUser) {
            setEditedUser((prevData) =>
                prevData.map((u) => (u.username === dragUser.username ? { ...u, team: "" } : u))
            );
            setDragUser(null);
        }
    };

    // 提交分配结果
    //   const handleSubmit = () => {
    //     const result = teams.map(team => ({
    //       teamId: team.id,
    //       teamName: team.name,
    //       members: team.members.map(memberId =>
    //         users.find(user => user.id === Number(memberId))
    //     }));

    //     console.log('Allocation Result:', result);
    //     alert('分配结果已提交到控制台');
    //   };

    // 获取未分配的用户   // 获取未分配的用户
    const getUnassignedUsers = (teamCount) => {
        return editedUser
            .filter((user) => user.team >= teamCount)
            .map((user) => (
                <div
                    key={user.username}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", user.username);

                        handleDragStart(user);
                    }}
                    className="bg-blue-200 hover:bg-blue-700 hover:cursor-grabbing text-white font-bold py-1 px-2   text-base rounded"
                >
                    {user.username}
                </div>
            ));
    };

    const renderUsers = (teamId) => {
        return editedUser
            .filter((user) => user.team === teamId)
            .map((user) => (
                <div
                    key={user.username}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", user.username);

                        handleDragStart(user);
                    }}
                    className="bg-blue-400 hover:bg-blue-700 hover:cursor-grabbing text-white font-bold py-1 px-2   text-base rounded"
                >
                    {user.username}
                </div>
            ));
    };

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-blue-500">将修改班组分组</h1>
            <form className="flex flex-col gap-4">
                <fieldset className="border  rounded-md  p-2">
                    <legend className="text-lg font-bold">设置班组数<span className="text-sm text-blue-700">(最小设置1个班组，最大8个班组)</span> </legend>
                    <div>
                        <label className="text font-bold">当前班组数：{teamCount}</label>
                        <div>
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4   text-lg rounded  mr-2"
                                disabled={teamCount <= 1}
                                onClick={() => {
                                    setTeamCount((prev) => {
                                        return Math.max(1, prev - 1);
                                    });
                                }}
                            >
                                <Minus />
                            </button>
                            <input
                                type="range"
                                max={8}
                                value={teamCount}
                                onChange={(e) => {
                                    e.preventDefault();
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value >= 1 && value <= 8) {
                                        setTeamCount(value);
                                    }
                                }}
                                className="border border-1 border-green-500  rounded-md   text-lg   text-center"
                            />
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4   text-lg rounded ml-2"
                                disabled={teamCount >= 8}
                                onClick={() => {
                                    if (teamCount < 8) {
                                        setTeamCount((prev) => prev + 1);
                                    }
                                }}
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="border  rounded-md  p-2">
                    <legend className="text-lg font-bold">
                        全体成员 
                    </legend>
                    <div className="flex flex-row gap-2 text-nowrap flex-wrap">
                        {users &&
                            users.map((user, i) => {
                                return (
                                    <div
                                        className=" hover:bg-blue-700 hover:cursor-grabbing  py-[2px] px-[4px]  text-sm border rounded"
                                        key={user.id}
                                    >
                                        {user.username}
                                    </div>
                                );
                            })}
                    </div>
                </fieldset>
                {/* 未分配用户区域 */}

                <fieldset
                    onDragOver={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onDrop={handleUnassignedDrop}
                    className="border p-4 rounded"
                >
                    <legend className="font-bold">未分组 <span className="text-sm text-blue-700">(拖放分组)</span></legend>
                    {/* <div className="flex flex-row gap-2 text-nowrap flex-wrap">{renderUsers("")}</div> */}
                    <div className="flex flex-row gap-2 text-nowrap flex-wrap">{getUnassignedUsers(teamCount)}</div>
                </fieldset>

                {/* 团队区域 */}
                {teams.map((i) => (
                    <fieldset
                        key={i}
                        onDragOver={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onDrop={() => {
                            handleDrop(i);
                        }}
                        className="border p-4 rounded"
                    >
                        <legend className="font-bold">Team {i} <span className="text-sm text-blue-700">(拖放分组)</span></legend>
                        <div className="flex flex-row gap-2 text-nowrap flex-wrap">{renderUsers(i)}</div>
                    </fieldset>
                ))}
            </form>
            <Button>保存</Button>
        </div>
    );
}

export default TeamSettingPage;

{
    /* <RadioGroup.Root
name="example"
style={{
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "0.6rem",
    justifyContent: "flex-start",
    alignItems: "center",
    alignContent: "flex-start",
    width: "100%",
    height: "100%",
}}
onValueChange={(value) => {}}
>
{users &&
    users.map((item, i) => {
        return (
            <RadioGroup.Item
                value={item.id}
                key={i}
                style={{ gap: "0.25rem" }}
                className=" hover:font-bold hover:text-blue-700"
            >
                {item.username}
            </RadioGroup.Item>
        );
    })}
</RadioGroup.Root> */
}

{
    /* <fieldset className="border  rounded-md  p-2">
<legend className="text-lg font-bold">分类班组</legend>

{users &&
    Object.entries(
        users.reduce((acc, user) => {
            if (!acc[user.team]) acc[user.team] = [];
            acc[user.team].push(user);
            return acc;
        }, {})
    ).map(([teamId, teamUsers]) => (
        <fieldset key={`team-${teamId}`} style={{ marginBottom: "1rem" }}>
            <legend style={{ fontWeight: "bold" }}>Team:{teamId}</legend>
            <RadioGroup.Root
                name={`team-${teamId}-selection`}
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    alignContent: "flex-start",
                    width: "100%",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "0.2rem",
                }}
                onValueChange={(value) => {
                    console.log(`Selected user ${value} from team ${teamId}`);
                }}
            >
                {teamUsers.map((user, i) => (
                    <RadioGroup.Item
                        value={user.id}
                        key={user.id}
                        style={{ gap: "0.25rem" }}
                        className="hover:font-bold hover:text-blue-700"
                    >
                        {user.username}
                    </RadioGroup.Item>
                ))}
            </RadioGroup.Root>
        </fieldset>
    ))}
</fieldset> */
}
