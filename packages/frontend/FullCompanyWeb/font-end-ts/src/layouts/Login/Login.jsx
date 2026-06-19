import { useState } from "react";
import { useUser } from "../../utils/index";
import { Link } from "react-router-dom";
function Login() {
    const { login, message } = useUser();
    const [user, setUser] = useState({ name: "", password: "" });
    // const navigate = useNavigate();
    const [remember, setRemember] = useState(false);

    return (
        <div className=" m-auto border bg-gray-50 rounded-lg shadow flex flex-col items-center justify-center  p-5 gap-2">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900">登录员工账号</h1>
            <form
                className="flex flex-col gap-2 "
                method="post"
                onSubmit={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    login(user);
                }}
            >
                <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                        姓名
                    </label>
                    <input
                        name="text"
                        id="name"
                        className=" px-5 py-1.5  rounded-lg "
                        placeholder=""
                        required
                        onChange={(e) => {
                            setUser({ ...user, name: e.target.value });
                        }}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                        密码
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className="px-5 py-1.5  rounded-lg    "
                        required
                        onChange={(e) => {
                            setUser({ ...user, password: e.target.value });
                        }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="remember" className="text-sm">
                        <input
                            id="remember"
                            aria-describedby="remember"
                            type="checkbox"
                            className="mx-2 rounded bg-gray-50 "
                            defaultChecked={remember}
                            onClick={() => {
                                setRemember(!remember);
                            }}
                        />
                        记住我
                    </label>
                    <Link to="forget" className="text-sm text-blue-400 hover:underline">
                        忘记密码?
                    </Link>
                </div>

                <button
                    type="submit"
                    className=" rounded-lg px-5 py-1.5 text-center  disabled:border-red-500"
                    disabled={!(user.name!==""&&user.password!=="")}
                   
                >
                    登录
                </button>
                <div className="text-sm font-light text-gray-500 ">
                    联系管理员
                    <Link to="/register" className="ml-2 text-blue-400 hover:underline ">
                        注册
                    </Link>
                </div>
            </form>
            <h1 className=" self-start text-red-500">{message || ""}</h1>
       
        </div>

        //    <div>
        //         Login
        //         <button
        //             onClick={() => {
        //                 fetch("http:192.168.0.68:3100/login", {
        //                     method: "POST",
        //                     mode: "cors", // no-cors, *cors, same-origin
        //                     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        //                     credentials: "same-origin", // include, *same-origin, omit
        //                     headers: {
        //                         "Content-Type": "application/json",
        //                         // 'Content-Type': 'application/x-www-form-urlencoded',
        //                     },
        //                 })
        //                     .then((res) => res.json)
        //                     .then((data) => {
        //                         console.log(data);
        //                         SetIsAuth(true);
        //                         navigate('/')
        //                     });
        //             }}
        //         >
        //             登录
        //         </button>
        //         <button
        //             onClick={() => {
        //                 SetIsAuth(false);
        //             }}
        //         >
        //             退出
        //         </button>
        //     </div>
    );
}

export default Login;
