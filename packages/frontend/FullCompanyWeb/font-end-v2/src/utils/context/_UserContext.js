import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const useLocalStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.localStorage.getItem(keyName);

            if (value) {
                return JSON.parse(value);
            } else {
                window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });

    const setValue = (newValue) => {
        try {
            window.localStorage.setItem(keyName, JSON.stringify(newValue));
        } catch (err) {}
        setStoredValue(newValue);
    };

    return [storedValue, setValue];
};

const UserContext = createContext({
    User: { name: "沈宁", loginTime: Date.now() },
    SetUser: () => {},
    IsAuth: {},
    SetIsAuth: () => {},
});
UserContext.displayName = "UserContext";

const UserProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("user", null);
    const navigate = useNavigate();

    const login = async (data) => {
        // 发送数据到服务器 后端传来数据 进行是否登录的判断
        fetch(`http://localhost:3100/api/v2/login`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("data");
                console.log(data);
                if (data?.canLogin) {
                    navigate('/',{replace:true})
                    setUser(data);
                }else{
                    navigate('/login',{replace:true})
                }
               
            }).catch(err=>{
                console.log(err);
            })
      };
    


    const logout = () => {
        setUser(null);
        navigate("/login", { replace: true });
    };

    const value = useMemo(() => ({
        user,
        login,
        logout,

    }), [user]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const  useUser=()=>{
    return useContext(UserContext);
}


export { UserContext,UserProvider,useUser };
