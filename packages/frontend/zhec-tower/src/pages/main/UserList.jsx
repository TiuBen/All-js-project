import { useEffect, useState } from "react";
import { usernames } from "../../lib/CONST";
import { useLocalStorageState } from "ahooks";
export default function TestPrepare() {
    const [username, setUsername] = useLocalStorageState("username", { defaultValue: "", listenStorageChange: true });

    return (
        <div>
            <h3 className="text-xl font-bold text-blue-600 ">请先选好名称</h3>
            <ul className="flex flex-row flex-wrap gap-2 text-sm ">
                {usernames.map((name, index) => {
                    return (
                        <li className="border rounded bg-white px-1 flex flex-row gap-1" key={index}>
                            <label key={index} htmlFor={"username" + index}>
                                {name}
                            </label>
                            <input
                                type="radio"
                                name="test-name"
                                value={name}
                                id={"username" + index}
                                defaultChecked={name === username}
                                onClick={() => {
                                    setUsername(name);
                                }}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
