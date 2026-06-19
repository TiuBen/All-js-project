import React,{useState} from "react";
import { Outlet,Link } from "react-router-dom";
import "../../index.css";
import "./DefaultPage.scss";
import { useWebSocket } from "../../utils";
import {WebSocketTest} from '../../Components/index'

// *这个页面是网页打开后的 默认页面
// *中间显示些内容
// *右侧显示打卡考勤之类的
// *模仿的是V2EX的主页

function DefaultPage() {
    const webSocket = useWebSocket();
    const [message, setMessage] = useState('');
    
    const sendMessage = () => {
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(message);
      }
    };

    return (
        <div className="default-page-container">
            <section className="center-container ">
                <Outlet />
             
            </section>
            <section className="right-container">
                <div className="item-container">
                    <span className="material-icons-outlined">card_giftcard</span>
                    <Link to="mission/daily">今日上班打卡</Link>
                </div>
                <WebSocketTest />
            </section>
        </div>
    );
}

export default DefaultPage;
