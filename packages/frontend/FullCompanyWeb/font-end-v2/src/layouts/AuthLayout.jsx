import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../utils/index";
import { MainSkeleton } from "./MainSkeleton";

const AuthLayout = () => {

    // console.log("AuthLayout!!!!!!!!!!!!!");

    const { user } = useUser();
    if (!user) {
        console.log("没有user 信息 需要跳转到 /login");
        console.log(user);
        return <Navigate to="/login" replace />;
    }else{
        // console.log("正常登录到 / 页面");
        console.log(user);
        return (
            <MainSkeleton/>
        );
    }


};

export { AuthLayout };
