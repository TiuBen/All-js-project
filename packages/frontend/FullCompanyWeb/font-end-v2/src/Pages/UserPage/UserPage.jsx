import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Request, useUser } from "../../utils/index";
import PersonInfoCard from "./Component/PersonInfoCard";
import PersonProfile from "./Component/PersonProfile";
import {UserInfo} from "./Component/UserInfo";


function UserPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        Request.get("/user", { params: { name:user.username } }).then((res) => {
            console.log("res");
            console.log(res);
            setUserInfo(res);
        });
    }, []);



    return (
        <div className="flex flex-row gap-1 items-start divide-x-2">
            <PersonInfoCard user={userInfo}/>

            <section className="flex flex-col flex-1 pl-4 gap-5">
                <UserInfo user={userInfo}/>
                {/* <PersonProfile   user={userInfo} />
                <div className="grid grid-cols-2 gap-3">
                    <div className="  border border-slate-400 rounded-xl p-2 m-2">
                        <h3 className=" text-lg font-bold">正在进行的项目2</h3>
                        <p>关于这个项目的一些描述,超出的部分用省略号表示 </p>
                    </div>
                    <div className="  max-h-16  border border-slate-400 rounded-xl p-2 m-2 ">
                        <h3 className=" text-lg font-bold">正在进行的项目1</h3>
                        <p className=" truncate ">
                            关于这个项目的一些描述,超出的部分用省略号表示
                            ,超出的部分用省略号表示,超出的部分用省略号表示,超出的部分用省略号表示超出的部分用省略号表示
                        </p>
                    </div>
                    <div className=" max-h-16   border border-slate-400 rounded-xl p-2 m-2">
                        <h3 className=" text-lg font-bold">正在进行的项目2</h3>
                        <p className=" truncate ">
                            关于这个项目的一些描述,超出的部分用省略号表示 关于这个项目的一些描述,超出的部分用省略号表示
                            ,超出的部分用省略号表示,超出的部分用省略号表示,超出的部分用省略号表示超出的部分用省略号表示{" "}
                        </p>
                    </div>
                    <div className="  border border-slate-400 rounded-xl p-2 m-2">
                        <h3 className=" text-lg font-bold">正在进行的项目2</h3>
                        <p>关于这个项目的一些描述,超出的部分用省略号表示 </p>
                    </div>
                </div> */}

                {/* <Attendance /> */}

                {/* <SaleData /> */}
                {/* <label>
                    姓名<input></input>
                </label>

                <section>个人事务</section>
                <section>信息栏</section>
                <section>老板后台数据</section>
                <input type="text" className="form-input" /> */}
            </section>
        </div>
    );
}

export default UserPage;
