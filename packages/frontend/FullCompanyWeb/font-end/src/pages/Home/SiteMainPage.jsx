import React, { useState } from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
    CalendarFilled,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";

import { red } from "@mui/material/colors";

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children, path) {
    return {
        key,
        icon,
        children,
        label,
        path,
    };
}
const items = [
    getItem("销售数据表格 ", "1", <PieChartOutlined />, null, "/csv"),
    getItem("Option ", "2", <DesktopOutlined />),
    getItem("本公司常用文件", "3", <UserOutlined />, null, "/files"),
    getItem("客户资料", "4", <TeamOutlined />, [getItem("Team 1", "7"), getItem("Team 2", "8")]),
    getItem("常用文件模版", "5", <FileOutlined />, null, "/temp"),
    getItem("日程安排", "6", <FileOutlined />, null, "/calendar"),
    getItem("工作计划", "9", <FileOutlined />, null, "/plan"),
    getItem("公司留言板", "10", <FileOutlined />, null, "/note"),
    // getItem("规格书", "11", <FileOutlined />, null, "/guigesu"),
];


//      -------------------------    
//      |    TopBanner          |
//      -------------------------    
//      |LeftBanner  |          |      
//      |            | Content  |             
//      |            |          |
//      |  clps      |          |
//      -------------------------    
//      |    BottomBanner       |   
//      -------------------------    


function SiteSkeleton() {
    return (
        <div className={"test-border"} style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <div className={"test-border"+" site-nav"} style={{ display: "flex", flexDirection: "row" }}>
                {/* {<TopBanner />} */}
            </div>
            <div className={"test-border"} style={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {/* <LeftBanner /> */}
                </div>
                <div className={"test-border"} style={{ flexGrow: 1 }}>
                    {/* <Outlet /> */}
                </div>
            </div>
            <div className={"test-border"}>底部,用来弹出重要消息</div>
        </div>
    );
}
const SiteMainPage = () => {
    // const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <SiteSkeleton />
    );
};
export default SiteMainPage;