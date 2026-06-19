import React, { useState, useEffect } from "react";
import "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/font-end-v2/src/App.scss";
import DDLW_LOGO from "../../Asserts/DDJW_LOGO.jpg";
import { Request, useUser } from "../../utils";

// * 员工名片 的 预览 和下载PDF格式
function TestPDFPage() {
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        console.log("这是员工名片" + JSON.stringify(user));
        Request.get("/user", {params: {name:user.username} }).then((res) => {
            console.log("res");
            console.log(res);
            setUserInfo(res);
        });
    }, []);
    return (
        <div className="id-card-font">
            <div className="container">
                <div className="container-1">
                    <img id="logo-img" src={DDLW_LOGO} alt="logo" />
                    <div style={{ position: "relative", bottom: "-4px", marginLeft: "14px" }}>
                        <div id="shenzhen-name">深圳市鼎道晶威科技有限公司</div>
                        <div id="dongguan-name">东莞市鼎道电子科技有限公司</div>
                    </div>
                </div>
                <div className="container-2">
                    <div id="name">
                        {userInfo?.name ?? "吴d笛"}
                        <span id="title" style={{ fontFamily: "smiley-sans" }}>
                            {userInfo?.job ?? "职务"}
                        </span>
                    </div>
                    <div style={{ lineHeight: "20pt" }}>
                        <div id="phone">电话: +86 13928478249 </div>
                        <div id="email">邮箱:carina.wu@kcv.net.cn</div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="container-3">
                    <div id="shenzhen-address" style={{ lineHeight: "20pt",fontSize:"12pt" }}>公司地址:深圳市宝安区石岩街道长城电脑石岩基地8栋1楼</div>
                    <div id="dongguan-address" style={{ lineHeight: "20pt",fontSize:"12pt" }}>工厂地址:广东省东莞市石碣镇西南第二工业园深潭路5号</div>
                    <div id="site"  style={{ lineHeight: "20pt",fontSize:"12pt" }}>公司网站:www.kcv.net.cn</div>
                </div>
            </div>

            <div className="no-print">
                {/* <a
                    className="no-print border border-black m-5"
                    rel="noopener noreferrer"
                    href="http://url.com"
                    target="_blank"
                >
                    预览
                </a>
                <button className="no-print border border-black m-5">下载PDF</button>

                <div>网页的其他元素 不会被打印出来</div> */}
                <h1 style={{color:"red",marginTop:"30px",marginLeft:"30px"}}>右键选择"打印",然后保存PDF,选择自己需要的页面</h1>

            </div>
        </div>
    );
}

export default TestPDFPage;
