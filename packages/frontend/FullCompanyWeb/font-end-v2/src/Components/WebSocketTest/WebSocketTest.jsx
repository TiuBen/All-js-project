import React, { useState, useEffect } from "react";
import { useWebSocket } from "../../utils";

function WebSocketTest() {
    const { ws, setWebSocket, message, isReady } = useWebSocket();
    const [isOnline, setIsOnline] = useState(null);

    useEffect(() => {}, [isReady]);

    return (
        <div className=" text-2xl font-bold flex flex-col">
            WebSokcetTest
            <button
                className="border border-blue-600"
                onClick={(e) => {
                    e.preventDefault();
                    // ws.close();
                    const _ws = new WebSocket("ws:192.168.0.68:3100");
                    _ws.onmessage = (e) => {
                        console.log("该WS收到的信息 : " + e.data);

                        // setMessage(e.data);
                    };
                    _ws.onopen = (event) => {
                        console.log("ws open " + JSON.stringify(event));
                        _ws.send("前端发来的 Open 的时候的信息 Hello Server!");
                    };
                    _ws.onclose = (event) => {
                        console.log(event + "ws on close");
                    };
                    setWebSocket(_ws);
                }}
            >
                尝试和Server 建立websocket连接
            </button>
            <div>
                <label htmlFor="">实时显示和服务器的连接状态</label>
                <span>服务器上的连接数目</span>
                <button>获取</button>
            </div>
            <div>
                <label htmlFor="">Echo</label>
                <span>Echod的内容:</span>
                <label htmlFor="">
                    <input type="text" />
                </label>
                <button className="border border-blue-600">发送到websocket服务器</button>
            </div>
            <div>
                单人对单人发送消息
                <button
                    className="border border-blue-600"
                    onClick={(e) => {
                        e.preventDefault();
                        ws.send("单人对单人发送消息");
                    }}
                >
                    发送消息
                </button>
            </div>
            <div>单人广播发送消息</div>
            <button
                className="border border-blue-600"
                onClick={(e) => {
                    e.preventDefault();
                    ws.send("message", "我要关闭了");
                    ws.close(1000, "从前端关闭");
                    setWebSocket(null);
                }}
            >
                关闭ws连接
            </button>
            <div className=" text-lime-600">
                {/* {isReady ? "true" : "false"} dddd {Array.isArray(message) ? "array" : JSON.parse(message).length} */}
            </div>
            {/* <ul className=" text-lime-600">
                {[...JSON.parse(message)].map((msg, index) => {
                    return (
                        <li>
                            <div key={index}>{msg.content} </div>
                              #TODO 这里应该有个广播信息的跳转链接 
                        </li>
                    );
                })}
            </ul> */}
            <div>是否连接到服务器</div>
        </div>
    );
}

export { WebSocketTest };
