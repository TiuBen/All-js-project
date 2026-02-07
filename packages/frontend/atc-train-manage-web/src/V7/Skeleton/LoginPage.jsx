import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/const/Const";
import { useLocalStorageState } from "ahooks";

export default function LoginPage() {
    const [password, setPassword] = useState("");

    const [token, setToken] = useLocalStorageState("token", {
        defaultValue: null,
        listenStorageChange: true,
    });
    const [username, setUsername] = useLocalStorageState("username", {
        defaultValue: null,
        listenStorageChange: true,
    });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL.login}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        console.log(data);
        if (res.ok) {
            setToken(data.accessToken);
            setUsername(data.username);
            navigate("/admin"); // 登录成功跳转
        } else {
            alert(data.message || "登录失败");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
                    登录
                </button>
            </form>
        </div>
    );
}
