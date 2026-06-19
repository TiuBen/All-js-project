import React, { useState } from "react";
import DDJW from "../../assert/DDJW_LOGO.jpg";
import "./layouts.scss";

function CompanyLogo() {
    return (
        <img
            src={DDJW}
            alt="这里应该是公司的LOGO "
            width="58rem"
            height="58rem"
            style={{ marginLeft: "1rem", marginRight: "1rem" }}
        />
    );
}
function SearchInput() {
    const [active, setActive] = useState("active");
    return (
        <div id="search-container" className={active}>
            <input
                id="search"
                type="text"
                maxLength="128"
                autoComplete="off"
                tabIndex="1"
                onClick={() => {
                    setActive("active");
                }}
                onMouseLeave={() => {
                    setActive("");
                }}
            />
            <div id="search-result" className="box"></div>
        </div>
    );
}

const TopBannerItems = [
    {
        name: "这里应该是公司的LOGO",
        element: <CompanyLogo />,
        style: { color: "Blue", display: "flex", minWidth: "10rem" },
    },
    { name: "搜索框🔍", element: <SearchInput /> },
    { name: "重要通知", style: { flexGrow: "1" }, href: "/notifications:?" },
    { name: "公司网盘", href: "/webpan" },
    { name: "员工沈宁", href: "/member:id" },
    { name: "公司留言簿", href: "/notes:?" },
    { name: "时间轴", href: "/timeline" },
    { name: "设置", href: "/setting" },
    { name: "退出登陆", href: "/" },
];

function TopBanner() {
    return (
        <div
            id="Top"
            className={"flex-row"}
            style={{ height: "4rem", alignItems: "center", justifyContent: "space-between", flexGrow: "1" }}
        >
            {TopBannerItems.map((item, index) => {
                if (item.element) {
                    return <div key={index}> {item.element}</div>;
                }

                return (
                    <a className={" top"} key={index} style={item.style} href={item.href}>
                        {item.element ? item.element : item.name}
                    </a>
                );
            })}
        </div>
    );
}


export {TopBanner}