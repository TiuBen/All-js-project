import { Link } from "react-router-dom";

const LeftMenuItems = [
    { name: "公司内网ERP", linkTo: "/erp", pills: true, active: true, subLink: null },
    { name: "销售数据表格", linkTo: "", pills: true, active: false, subLink: null },
    { name: "订单情况汇总" },
    { name: "仓库库存" },
    { name: "公司常用文件" },
    { name: "客户资料" },
    { name: "文件模版" },
    { name: "快递管理" },
    { name: "日程安排" },
    { name: "工作计划" },
    { name: "财务情况" },
    { name: "采购网站列表" },
    { name: "打印的发票并且反馈" },
    { name: "常见CE 认证 之类的 资料" },

    { name: "风扇规" },
    { name: "公章管理" },
    { name: "公司章程" },
    { name: "制作过的代理PDF" },
    { element: <div style={{ border: "2px solid blue", flexGrow: "1" }}>占位符</div> },
    { element: <button style={{ color: "red" }}>和外沟通</button> }, //同步消息 让工厂看到我们的需求
    { element: <button style={{ color: "red" }}>管理员模块</button> },
    { element: <button style={{ color: "red" }}>人力模块</button> },
    { element: <button style={{ color: "red" }}>财务模块</button> },
    { element: <button style={{ color: "red" }}>老板模块</button> },
    { element: <div style={{ border: "2px solid blue", flexGrow: "1" }}>占位符</div> },

    { element: <button style={{ color: "red" }}>收缩/扩展</button> },
];

function LeftBanner() {
    return (
        <ul className="nav nav-pills flex-column">
            {LeftMenuItems.map((item, index) => {
                if (item.element) {
                    return <div key={index}>{item.element}</div>;
                }
                return (
                    <li className="nav-item" key={index} style={item.style}>
                        <Link className={`nav-link ${item.active ? 'active' : ''}`} to={item.linkTo}>{item.element ? item.element : item.name}</Link>
                    </li>
                );
            })}
        </ul>
    );
}

export { LeftBanner };
