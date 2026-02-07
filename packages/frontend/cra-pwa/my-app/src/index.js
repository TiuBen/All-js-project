import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router";

import Avatar from "./components/Avatar";
const root = ReactDOM.createRoot(document.getElementById("root"));
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

const Home = () => {
    return (
        <div>
            Home
            <div>
                {usernames.map((item, index) => {
                    return <Avatar key={index} username={item} />;
                })}
            </div>
        </div>
    );
};
const Test = () => {
    const [data, setData] = useState({});

    useEffect(() => {
        const testFetch = async () => {
            await fetch("https://localhost:3104/test")
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setData(data);
                });
        };
        testFetch();
    }, []);
    return (
        <div>
            {" "}
            <h1> {JSON.stringify(data)}</h1>Test
        </div>
    );
};


// Check if service workers are supported by the browser
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      (registration) => {
        console.log('Service Worker registered with scope: ', registration.scope);
      },
      (error) => {
        console.log('Service Worker registration failed: ', error);
      }
    );
  });
}

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index path="touxiang" element={<Home />} />
                <Route path="test" element={<Test />} />
            </Routes>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
