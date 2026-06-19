import { createContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Request, ServerURL, useLocalStorage } from "../index";

const UserContext = createContext({ user: {}, setUser: () => {}, login: () => {}, logout: () => {} });

const UserProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("user", null);
    const [token, setToken] = useLocalStorage("token", null);
    const navigate = useNavigate();

    const login = async (data) => {
        // 发送数据到服务器 后端传来数据 进行是否登录的判断
        console.log(`发送数据:${JSON.stringify(data)} 到服务器 后端传来数据 进行是否登录的判断`);

        Request.post("/login", data).then(data=>{return data})
            .then((data) => {
                console.log("点击登陆按钮后,从服务器发送回的数据");
                console.log(data);
                if (data.token) {
                    // 如果有token 就代表token有效
                    navigate("/", { replace: true });
                    setUser({name:data.username,uuid:data.uuid});
                    setToken(data.token);

                    Request.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                    console.log(Request.defaults.headers);
                } else {
                    navigate("/login", { replace: true });
                    setUser(null);
                    setToken(null);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    };

    const value = useMemo(
        () => ({
            user,
            setUser,
            token,
            login,
            logout,
        }),
        [user]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
