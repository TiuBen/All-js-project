import { useState, useEffect } from "react";
import useSWR from "swr";
import { useLocalStorage } from "../utils";
import { Link } from "react-router-dom";

const ATCTIKU = [
    {
        sec: "第一部分基础知识",
        sub: [
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
        sec: "第二部分 专业知识",
        sub: [
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
        sec: "第三部分 英语知识",
        sub: ["英语单选", "英语阅读"],
    },
];

function SideNav({ setSub }) {
    // 只做错题
    const [onlyTheWrongs, setOnlyTheWrongs] = useLocalStorage("onlyTheWrongs", false);
    return (
        <nav className=" relative m-2 p-2 overflow-y-auto w-auto ">
            {ATCTIKU.map((item, key) => {
                return (
                    <section key={key}>
                        <h2 className=" text-cyan-800 font-mono font-semibold">{item.sec}</h2>
                        <ul className="ml-2">
                            {item.sub.map((sub, key2) => {
                                return (
                                    <li key={key2}>
                                        {/* <a
                                            href={`/tiku?section=${sub}`}
                                            onClick={(e) => {
                                                console.log("fdsafa");
                                                e.preventDefault();
                                                setSub(sub);
                                                // setSelectSub(1)
                                            }}
                                        >
                                            {sub}
                                        </a>   */}
                                        <Link
                                            to={`/tiku?section=${sub}${onlyTheWrongs ? "&onlyTheWrongs=true" : ""}`}
                                            onClick={(e) => {
                                                setSub(sub);
                                                // setSelectSub(1)
                                            }}
                                        >
                                            {sub}
                                        </Link>
                                        {/* <button
                                            onClick={() => {
                                                console.log("同步答案");
                                                fetch(`http://localhost:3103/ans?section=${sub}`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                });
                                            }}
                                        >
                                            读取答案
                                        </button> */}
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
                        <label>
                            <input
                                type="checkbox"
                                checked={onlyTheWrongs}
                                onChange={(e) => {
                                    setOnlyTheWrongs(!onlyTheWrongs);
                                }}
                            />
                            仅背错题
                        </label>
                    </li>
                </ul>
            </section>
        </nav>
    );
}

export default SideNav;
