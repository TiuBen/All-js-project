import React from "react";
import { Icon } from "@mui/material";
import DeleteForeverSharpIcon from "@mui/icons-material/DeleteForeverSharp";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
function TodoFormMini() {
    return (
        <div className="todo-content-editor flex flex-col  flex-1 h-fit bg-white relative">
            <div className="min-h-[1.5rem] bg-zinc-200 py-2 px-4 flex flex-row justify-between ">
                日历
                <button>
                    <OpenInFullIcon />
                </button>
            </div>
            <div className="flex flex-row justify-between p-2 border-b">
                <button className="px-4 py-1 rounded text-white   bg-blue-600 flex flex-row gap-2">
                    <Icon>save </Icon>
                    保存
                </button>
                <button className="px-4 py-1 rounded  flex flex-row gap-2 border">
                    <DeleteForeverSharpIcon />
                    放弃
                </button>
            </div>
            <div className="flex flex-col px-4 gap-2">
                <div className="flex flex-row gap-4 inset-4  items-center">
                    <Icon className="text-neudival-400 ">emoji_symbols</Icon>
                    <input
                        type="text"
                        placeholder="添加标题"
                        className="font-semibold text-2xl flex-1 border-b-[0.5px] border-b-neudival-200"
                    />
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Icon className="text-neudival-400">people</Icon>
                    <input
                        type="text"
                        placeholder="邀请参与者"
                        className="flex-1 border-b-[0.5px] border-b-neudival-200"
                    />
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Icon className="text-neudival-400">alarm_add</Icon>
                    <div className="grid grid-rows-2 grid-cols-3 gap-4">
                        <input type="date" className="rounded px-4 py-1  border-[0.5px] border-neudival-200" />
                        <input type="time" className="rounded px-4 py-1  border-[0.5px] border-neudival-200" />
                        <div>dddd</div>
                        <input type="date" className="rounded px-4 py-1  border-[0.5px] border-neudival-200" />
                        <input type="time" className="rounded px-4 py-1  border-[0.5px] border-neudival-200" />
                        <div>dddd</div>
                    </div>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Icon className="text-neudival-400">place</Icon>
                    <input type="text" placeholder="位置" className="flex-1 border-b-[0.5px] border-b-neudival-200" />
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Icon className="text-neudival-400">description</Icon>
                    <input
                        type="text"
                        placeholder="添加详细描述"
                        className="flex-1 border-b-[0.5px] border-b-neudival-200"
                    />
                </div>
            </div>
            <button className="p-4 self-end"> 更多选项</button>
        </div>
    );
}

export default TodoFormMini;
