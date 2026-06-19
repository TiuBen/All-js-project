import { useEffect, useState } from "react";
import { Request } from "../../utils";
import { Link, useNavigate } from "react-router-dom";

function RedirectToLogin() {
    const navigate = useNavigate();
    useEffect(() => {
        const interval = setTimeout(() => {
            navigate("/login");
        }, 2000);
        return () => {
            clearTimeout(interval);
        };
    }, [navigate]);

    return (
        <div className="m-auto p-7  rounded-lg  shadow-lg bg-slate-50 border text-lg font-yahei  font-semibold text-blue-400">
            注册成功
            <br />
            正在跳转到登录页面...
        </div>
    );
}

function Register() {
    const [user, setUser] = useState({});
    const [isSame, setIsSame] = useState(true);
    const [message, setMessage] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            {redirect ? (
                <RedirectToLogin />
            ) : (
                <div className="m-auto w-3/6">
                    {message?<h1 className="mb-4 text-center border-2 border-red-500 text-red-500 font-bold rounded-lg shadow-lg">{message}</h1>:""}

                    <div class="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4">
                        <h2 class="text-2xl font-semibold text-gray-700 mb-6">注册账号</h2>
                        <form
                            method="post"
                            encType="application/x-www-form-urlencoded"
                            onSubmit={(e) => {
                                console.log("onSubmit");
                                console.log(user);
                                if (user.password === user.rePassword) {
                                    setIsSame(true);
                                    Request.post("/register", user)
                                        .then((res) => {
                                            console.log("resresresresresresresres");
                                            console.log(res.status);
                                            console.log(window.location.hostname);
                                            // 如果错误是什么情况
                                            // 如果跳转是什么情况
                                            switch (res.status) {
                                                case 401:
                                                    setMessage("用户名或者email被占用");
                                                    break;
                                                case 500:
                                                    setMessage("发生了错误,请联系管理员");

                                                    break;
                                                case 301:
                                                    setMessage("跳转到登录页面");
                                                    setRedirect(true);
                                                    // // window.location.replace("/login");
                                                    // navigate("/login");
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })
                                        .catch((e) => {
                                            console.log("errrrror");
                                            console.error(e);
                                        });
                                } else {
                                    setIsSame(false);
                                }
                                e.preventDefault();
                            }}
                        >
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                    姓名
                                </label>
                                <input
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="username"
                                    type="text"
                                    placeholder="Username"
                                    required
                                    onChange={(e) => {
                                        setUser({ ...user, username: e.target.value });
                                    }}
                                />
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                                    邮箱
                                </label>
                                <input
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    required
                                    onChange={(e) => {
                                        setUser({ ...user, email: e.target.value });
                                    }}
                                />
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                                    密码
                                </label>
                                <input
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    required
                                    onChange={(e) => {
                                        setUser({ ...user, password: e.target.value });
                                    }}
                                />
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="confirmPassword">
                                    确认密码 <span className=" text-red-500">{isSame ? "" : "请再次确认密码"}</span>{" "}
                                </label>
                                <input
                                    class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${user.rePassword}`}
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm Password"
                                    required
                                    onChange={(e) => {
                                        setUser({ ...user, rePassword: e.target.value });
                                    }}
                                />
                            </div>
                            <div class="flex items-center justify-between">
                                <button
                                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit"
                                >
                                    Register
                                </button>
                                <Link to="/" className="text-blue-500 underline underline-offset-4 ">返回首页</Link>
                            </div>
                        </form>
                    </div>
               
                </div>
            )}
        </>
    );
}

export default Register;
