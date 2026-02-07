// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useLocalStorageState } from "ahooks";

export default function ProtectedRoute({ children }) {
    const [token, setToken] = useLocalStorageState("token", {
        defaultValue: null,
        listenStorageChange: true,
    });
    if (token === null) {
        // 未登录，跳转到登录页
        return <Navigate to="/login" replace />;
    }
    // 已登录，显示子组件
    return children;
}
