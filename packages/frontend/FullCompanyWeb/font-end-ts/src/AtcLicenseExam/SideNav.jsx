import { useState, useEffect } from "react";
import useSWR from "swr";
// import { useLocalStorage } from "../utils";
import { Link } from "react-router-dom";
import {useLocalStorageState} from "ahooks"


const ATCTIKU = [
    {
        "部分": "第一部分基础知识",
        "章节": [
            "航空气象",
            "空中导航",
            "通信、导航和监视设备",
            "飞行原理",
            "航空器及应用",
            "航空情报",
            "空中交通管制一般规定",
            "空域",
            "人为因素",
            "通用航空",
        ],
    },

    {
        "部分": "第二部分 专业知识",
        "章节": [
            "机场管制",
            "进近管制",
            "进近雷达管制",
            "区域管制",
            "区域雷达管制",
            "飞行服务",
            "运行监控（地区)",
            "运行监控（民航局）",
            "特殊技能ADS-B",
            "机坪管制",
        ],
    },

    {
        "部分": "第三部分 英语知识",
        "章节": ["英语单选", "英语阅读"],
    },
];

function SideNav({ setSection }) {

    // const [section,setSection]= useLocalStorageState("章节",{defaultValue:null,listenStorageChange:true})
    // 只做错题
    // const [onlyTheWrongs, setOnlyTheWrongs] = useLocalStorage("onlyTheWrongs", false);
    return (
        <nav className=" relative m-2 p-2 overflow-y-auto w-auto ">
            {ATCTIKU.map((item, key) => {
                return (
                    <section key={key}>
                        <h2 className=" text-cyan-800 font-mono font-semibold">{item["部分"]}</h2>
                        <ul className="ml-2">
                            {item["章节"].map((x, key2) => {
                                return (
                                    <li key={key2}>
                                        <a
                                            href={`/tiku?section=${x}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSection(x);
                                                // setSub(sub);
                                                // setSelectSub(1)
                                            }}
                                        >
                                            {x}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
            <section className="pt-[2rem] text-blue-700 font-semibold  italic">
                <h2>设置</h2>
                <ul>
                    <li>
                        <label className="flex items-baseline gap-1">
                            <input
                                type="checkbox"
                                // checked={onlyTheWrongs}
                                onChange={(e) => {
                                    // setOnlyTheWrongs(!onlyTheWrongs);
                                }}
                            />
                            仅背错题
                        </label>
                    </li>
                    <li>
                        <label className="flex items-baseline gap-1">
                            <input
                                type="checkbox"
                                // checked={onlyTheWrongs}
                                onChange={(e) => {
                                    // setOnlyTheWrongs(!onlyTheWrongs);
                                }}
                            />
                            题目乱序
                        </label>
                    </li>
                    <li>
                        <label className="flex items-baseline gap-1">
                            <input
                                type="checkbox"
                                // checked={onlyTheWrongs}
                                onChange={(e) => {
                                    // setOnlyTheWrongs(!onlyTheWrongs);
                                }}
                            />
                            答案乱序
                        </label>
                    </li>
                </ul>
            </section>
        </nav>
    );
}

export default SideNav;
