import { useState } from "react";
import { useUser } from "../../utils/index";
function Login() {
    const { login } = useUser();
    const [user, setUser] = useState({ name: "", password: "" });
    // const navigate = useNavigate();
    const [remember, setRemember] = useState(false);

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            登录员工账号
                        </h1>
                        <form className="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    姓名
                                </label>
                                <input
                                    name="text"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder=""
                                    required
                                    onChange={(e) => {
                                        setUser({ ...user, name: e.target.value });
                                    }}
                                    value={user.name}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    密码
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                    value={user.password}
                                    onChange={(e) => {
                                        setUser({ ...user, password: e.target.value });
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="remember"
                                            aria-describedby="remember"
                                            type="checkbox"
                                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                                            defaultChecked={remember}
                                            onClick={() => {
                                                setRemember(!remember);
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                                            记住我
                                        </label>
                                    </div>
                                </div>
                                <a
                                    href="#"
                                    className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                                >
                                    忘记密码?
                                </a>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                onClick={(e) => {
                                    e.preventDefault();
                                    login(user)
                                }}
                            >
                                登录
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                联系管理员
                                <a
                                    href="#"
                                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                                >
                                    注册
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>

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
