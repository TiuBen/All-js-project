import { Icon } from "@mui/material";
import React from "react";

function TodoPage() {
    return (
        <div className="bg-neudival-100 p-4 h-full flex flex-col gap-4">
            <div className="todo-title-bar h-[1.5rem] bg-neudival-200">新事件-日历-{" snbenjamin@live.cn"}</div>
            <div className="todo-tool-bar h-[3.5rem] rounded-md bg-white shadow shadow-slate-100">新事件-日历</div>
            <div className="todo-main-container flex flex-row gap-8 min-h-0 relative">
                <div className="todo-content-editor flex-1 h-fit bg-white">
                    <form action="" className="flex flex-col gap-4 p-2">
                        <div className="flex flex-row gap-4 ">
                            <button className="px-4 py-1 rounded text-white   bg-blue-600 flex flex-row gap-2">
                                <Icon>save </Icon>
                                保存
                            </button>
                            <menu> 日历的下拉菜单</menu>
                        </div>
                        <div className="flex flex-row gap-4 inset-4">
                            <Icon className="text-neudival-400 ">emoji_symbols</Icon>
                            <input
                                type="text"
                                placeholder="添加标题"
                                className="font-semibold text-2xl flex-1 border-b-[0.5px] border-b-neudival-200"
                            />
                        </div>
                        <div className="flex flex-row gap-4">
                            <Icon className="text-neudival-400">people</Icon>
                            <input
                                type="text"
                                placeholder="邀请参与者"
                                className="flex-1 border-b-[0.5px] border-b-neudival-200"
                            />
                        </div>
                        <div className="flex flex-row gap-4 ">
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
                        <div className="flex flex-row gap-4">
                            <Icon className="text-neudival-400">place</Icon>
                            <input
                                type="text"
                                placeholder="位置"
                                className="flex-1 border-b-[0.5px] border-b-neudival-200"
                            />
                        </div>
                        <div className="flex flex-row gap-4">
                            <Icon className="text-neudival-400">description</Icon>
                            <textarea
                                placeholder="添加详细描述"
                                style={{ resize: "none" }}
                                rows={4}
                                className="flex-1 border-b-[0.5px] border-b-neudival-200"
                            />
                        </div>
                    </form>
                </div>
                <div className="todo-time-scroll-selector relative bg-white w-1/5 min-h-0 block  overflow-auto ">
                    <div className="absolute inset-0 sticky bg-neudival-400">
                        <input
                            type="month"
                            placeholder="添加标题"
                            className=" font-semibold text-2xl flex-1 border-b-[0.5px] border-b-neudival-200"
                        />
                    </div>
                    <div className="block  overflow-auto">
                        <div className=" flex flex-row " style={{ height: "60px" }}>
                            0
                         
                        </div>
                        <div style={{ height: "60px" }}>
                            <div className="border border-slate-300 ">1</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            <div className="border border-slate-300 ">2</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">3</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">4</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">5</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">6</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">7</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">8</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">9</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">10</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">11</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">12</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">13</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">14</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">15</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">16</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">17</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">18</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">19</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">20</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">21</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">22</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                        <div style={{ height: "60px" }}>
                            {" "}
                            <div className="border border-slate-300 ">23</div>
                            <div className="border border-slate-300 ">ddd</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodoPage;
