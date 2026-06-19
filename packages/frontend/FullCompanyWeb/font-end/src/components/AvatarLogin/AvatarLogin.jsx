import React, { useState, useEffect } from "react";
import styles from "./AvatarLogin.module.css";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Badge } from "antd";
import FormItem from "antd/es/form/FormItem";

function LoggedIn() {
    return (
        <div className={styles.avatarLoginContainer}>
            <span className="avatar-item">
                <Badge count={1}>
                    <Avatar shape="square" size="large" icon={<UserOutlined />} />
                </Badge>
            </span>
            <a
                className={styles.underlineHyperlink}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                姓名
            </a>
        </div>
    );
}

function LoggedOut() {
    return (
        <a
            className={styles.underlineHyperlink}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            退出
        </a>
    );
}

export default function AvatarLogin(props) {
    const [isLogin, setIsLogin] = useState(true);

    var ele = isLogin ? <LoggedIn /> : <LoggedOut />;
    return ele;
}
