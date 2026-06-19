import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { ServerWebsocketURL, useLocalStorage } from "../index";

const WebSocketContext = createContext({
    message: "",
    setMessage: () => {},
    ws: null,
    setWebSocket: () => {},
    isReady:false
});

function WebSocketProvider({ children }) {
    const [webSocket, setWebSocket] = useState(undefined);
    const [message, setMessage] = useState(JSON.stringify([]));
    const [isReady, setIsReady] = useState(false);

    const ws = useRef(null);

    useEffect(() => {
        const socket = new WebSocket(ServerWebsocketURL,);

        socket.onmessage = (e) => {
            console.log("该WS收到的信息 : " + e.data);
            setMessage(e.data);
        };
        socket.onopen = (event) => {
            console.log("ws open " + JSON.stringify(event));
            socket.send("前端发来的 Open 的时候的信息 Hello Server!");
            setIsReady(true);
        };
        socket.onclose = (event) => {
            console.log(JSON.stringify(event) + "ws on close");
            setIsReady(false)
        };

        ws.current = socket;

        return () => {
            // Clean up the WebSocket when the component unmounts
            socket.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{ ws: ws.current?.send.bind(ws.current), isReady:isReady, message: message, setMessage: setMessage }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export { WebSocketProvider, WebSocketContext };
