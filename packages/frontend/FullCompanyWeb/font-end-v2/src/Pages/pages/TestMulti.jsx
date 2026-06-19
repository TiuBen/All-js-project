import {
    BrowserRouter,
    Routes,
    Route,
    createBrowserRouter,
    useRouteError,
    useNavigate,
    useLocation,
    Navigate,
    Outlet,
} from "react-router-dom";

import { useState, useEffect, useContext, createContext } from "react";

const UserContext = createContext({ user: "", isLogin: false });

const LoginPage = () => {
    const {  setUser,  setIsLogin } = useContext(UserContext);
    const navigate = useNavigate();
    return (
        <div>
            <h3>点击登录后到这个界面 </h3>
            不能通过React Develop tools 修改状态 表示自己登录
            <div>
                <button
                    onClick={() => {
                        console.log("登陆 普通用户");
                        fetch("http://192.168.0.68:3100/api/v2/login", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ user: "普通用户" }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(data);
                                setIsLogin(true);
                                setUser(data.user);
                                navigate("/home")
                            })
                            .catch((err) => console.error(err));
                    }}
                >
                    登陆 普通用户
                </button>
                <button> 登陆 主管用户 </button>
                <button> 登陆 超级管理员用户 </button>
            </div>
        </div>
    );
};

const Layout = () => {
    return <Outlet />;
};
const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1>欢迎大家来到主页</h1>
            <Outlet />
            <button
                onClick={() => {
                    navigate("/login", { replace: true });
                }}
            >
                登录
            </button>
        </div>
    );
};

const CommonerUserPage = () => {
    return (
        <div className="border p-2  ">
            这这页面 只要用户登录了 就可以看看到
            <div className="">
                这个地方 普通用户向 服务器发送数据 服务器要检验 这个用户是不是有上传这部分数据的资格
                <button>提交数据</button>
                <div>展示提交后 服务器返回的数据 </div>
            </div>
            <button>退出登录</button>
        </div>
    );
};
const ManagerUserPage = () => {
    return (
        <div>
            这个页面 主管可以 可以看看到
            <div>
                切换角色后,可以完成的一些功能
                <br />
                比如财务人员也是普通员工,他需要报销界面,但是审核人 不能是他自己
                <button>切换角色按钮 </button>
            </div>
            <div>这是 主管界面 可以比普通用户多显示出来的 内容</div>
            <button>退出登录</button>
        </div>
    );
};

const AdminUserPage = () => {
    return (
        <div>
            <div>这个页面 只有管理员可以看到</div>;<button>退出登录</button>
        </div>
    );
};

// 路由拦截
// 元素展示
// 是否登录 需要从后台服务器获取 登陆信息

const Auth = () => {
    const { isLogin } = useContext(UserContext);
    if (!isLogin) {
        return <Navigate to="/login" replace />;
    }
    return (
        <div>
            <button>退出登录</button>
            <Outlet />
        </div>
    );
};

function AppTest() {
    // 从服务器获取数据
    // 为了避免重复登录 应该在本地里先获取信息
    // 如果是点击了退出 应该清空信息
    const [user, setUser] = useState("");
    const [isLogin, setIsLogin] = useState(false);

    return (
        <UserContext.Provider
            value={{
                user: user,
                setUser: setUser,
                isLogin: isLogin,
                setIsLogin: setIsLogin,
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<Auth />}>
                            <Route path="/home" element={<CommonerUserPage />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    );
}

export { AppTest };
