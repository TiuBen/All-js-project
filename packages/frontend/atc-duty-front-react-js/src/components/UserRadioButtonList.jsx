import React from "react";
import { useUserStore } from "@/store/user.store";
export default function UserRadioButtonList({ selectedUser = null, onChange }) {
    const { allDetailUsers } = useUserStore();
    return (
        <aside className="grid grid-cols-2 w-[13rem] overflow-auto min-h-0  content-start gap-1 p-2 ">
            {allDetailUsers.map((item, i) => {
                return (
                    <label
                        key={i}
                        className="border  border-slate-500 text-nowrap  rounded-md  flex flex-row gap-1  px-2 py-1    text-center"
                    >
                        <input
                            type="radio"
                            value={item.username}
                            checked={i === selectedUser}
                            onChange={(e) => {
                                console.log(e.target.value);
                                onChange(i);
                            }}
                        />
                        {item.username}
                    </label>
                );
            })}
        </aside>
    );
}
