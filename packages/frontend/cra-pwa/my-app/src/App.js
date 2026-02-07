import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Avatar from "./components/Avatar";
import { Link } from "react-router";

const usernames = [
    "巴富毅",
    "刘琦",
    "姜文夫",
    "董志华",
    "金鼎",
    "徐万友",
    "马莲花",
    "李秋实",
    "明嘉",
    "边昊",
    "温若春",
    "李明",
    "刘国莲",
    "黄恩",
    "叶大鹏",
    "潘伟生",
    "周岸",
    "张文中",
    "詹泽彬",
    "张虎",
    "胡鑫",
    "王建超",
    "朱永春",
    "郭永杰",
    "吴疆",
    "张宗根",
    "王风瑞",
    "杜涛",
    "耿若岩",
    "邓心豪",
    "蔡昊霖",
    "张笑延",
    "严亮",
    "宋天霖",
    "沈宁",
    "蓝宇航",
    "郑文卓",
    "陈宏伟",
    "蒋露裕",
    "程卓",
];

function App() {
    return (
        <div className="App">
            dddd
            <nav style={{ display: "flex", flexDirection: "column" }}>
                <Link to="..">Home</Link>

                <Link to="../touxiang">touxiang</Link>
                <Link to="../test">test</Link>
            </nav>
            
        </div>
    );
}

export default App;
