import React from "react";
import ErpCards from "./ErpCards";
import TestReactTable from "./TestReactTable";

const ddErpModules = [
    {
        name: "鼎道",
        type: "供应商",
        link: "dd/supplier",
        linkTitle: "详细",
        backgroundImage: "bi-cart",
    },
    {
        name: "鼎道",
        type: "客户",
        link: "dd/customer",
        linkTitle: "详细",
        backgroundImage: "bi-cash-coin",
    },
    {
        name: "鼎道",
        type: "报价数据库",
        link: "dd/price",
        linkTitle: "详细",
        backgroundImage: "bi-gear",
    },
];
const hjwErpModules = [
    {
        name: "韩晶威",
        type: "供应商",

        link: "hjw/supplier",
        linkTitle: "详细",
        backgroundImage: "bi-cart",
    },
    {
        name: "韩晶威",
        type: "客户",
        link: "hjw/customer",
        linkTitle: "详细",
        backgroundImage: "bi-cash-coin",
    },
];

function ErpMainPage() {
    return (
        <div className="d-flex flex-column">
            <div className="d-flex ">
                {ddErpModules.map((x, index) => {
                    return (
                        <ErpCards
                            key={index}
                            name={x.name}
                            type={x.type}
                            backgroundImage={x.backgroundImage}
                            link={x.link}
                            linkTitle={x.linkTitle}
                        />
                    );
                })}
            </div>
            <br />
            <div className="d-flex ">
                {hjwErpModules.map((x, index) => {
                    return (
                        <ErpCards
                            key={index}
                            name={x.name}
                            type={x.type}
                            backgroundImage={x.backgroundImage}
                            link={x.link}
                            linkTitle={x.linkTitle}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default ErpMainPage;
