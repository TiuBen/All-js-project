import React from "react";
import { useNavigate } from "react-router-dom";

function PersonInfoCard({ user }) {
    const navigate = useNavigate();

    return (
        <section className=" w-[260px] flex flex-col justify-center items-center self-start mt-6 relative ">
            <div className=" shadow-md shadow-slate-600 rounded-2xl  cursor-pointer">
                <img
                    src="https://random.imagecdn.app/500/150"
                    className="avatar rounded-2xl w-40 h-40 object-cover"
                    alt="头像"
                />
            </div>
            <span
                className={`pt-4 text-2xl ${
                    user?.name !== undefined && user?.name.length !== 0 ? "text-blue-900" : "text-red-600"
                } font-bold font-sans cursor-pointer`}
            >
                {user?.name || "姓名"}
            </span>
            <span
                className={`text-xl  font-bold font-sans   ${
                    user?.job !== undefined && user?.job.length !== 0 ? "text-black" : "text-red-600"
                }  cursor-pointer`}
            >
                {user?.job || "职位"}
            </span>
            <ul className=" bg-slate-100 border border-slate-400 p-1 rounded-xl flex flex-col mt-4 text-sm w-44 divide-y-2 divide-slate-400  cursor-pointer ">
                <li className=" h-8 inline-flex  items-center  ">
                    <span className="material-icons-outlined  mr-2">phone</span>
                    <span className="">{user?.personalPhone}</span>
                </li>
                <li className=" h-8 inline-flex items-center">
                    <span className="material-icons-outlined  mr-2">email</span>
                    <span className="">{user?.email||user?.companyEmail}</span>
                </li>
                <li className="h-8 inline-flex items-center">
                    <span className="material-icons-outlined mr-2">person_pin_circle</span>
                    <span>中国深圳 </span>
                </li>
            </ul>

            <ul className=" p-1 rounded-xl flex flex-col mt-4 text-sm w-44 divide-y-2 divide-slate-400  cursor-pointer ">
                <li
                    className="h-8 inline-flex  items-center  "
                    onClick={() => {
                        navigate("");
                    }}
                >
                    <span className="material-icons-outlined  mr-2">edit_note</span>
                    编辑个人信息
                </li>
                <li className="h-8 inline-flex  items-center ">
                    <a href="http://192.168.0.68:3001/名片" target="_tab">
                        <span className="material-icons-outlined  mr-2">file_download</span>
                        下载个人名片
                    </a>
                </li>
                <li></li>
            </ul>
        </section>
    );
}

export default PersonInfoCard;
