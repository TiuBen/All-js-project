import React from "react";
import { useUser } from "../../../utils";

function Account() {
    const { user } = useUser();

    return (
        <div className="flex flex-1   h-full flex-col p-8 gap-2 justify-between ">
            <h1 className="flex pb-[4px] border-b border-b-slate-300">个人设置</h1>
            <div className="flex-1 grid grid-cols-[2fr,1fr]">
                <div className="flex flex-col gap-1">
                    <label>姓名:{user.name}</label>

                    <div>职务</div>

                    <div>状态</div>
                    <div>联系方式</div>
                    <div>紧急联系方式</div>
                    <div>地址</div>
                    <div>公司分配</div>
                    <div>名片</div>
                </div>
                <div>头像</div>
            </div>
            <button className="flex-none self-start justify-end">提交修改</button>
        </div>
    );
}

export default Account;
