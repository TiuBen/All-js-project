import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "antd";
import PropTypes from "prop-types";
import { plans } from "../../data/index";
// import useGetPlanByUUID from "../../hooks/useGetPlanByUUID";
// import useGetPlansByName from "../../hooks/useGetPlansByName";


// |     姓名|  more
// |-----------------
// |   短期  |   长期
// |
// import data from '../../data/员工2023年任务总结.json'

function PlanItem(props) {
    const { uuid } = props;
    // const content = useGetPlanByUUID(uuid);
    return (
        <li >
            <label>{"content"}</label>
        </li>
    );
}

function PlanCard(props) {
    const { name} = props;
    // const plans=useGetPlansByName(name);

    // plans={
    //     name:"",
    //     short:[],
    //     long:[]
    // }

    const [_activeTabKey, setActiveTabKey] = useState("short");
    const tabList = [
        { key: "tab1", tab: "短期" },
        { key: "tab2", tab: "长期" },
    ];


    return (
        <div>
            <Card
                title={name}
                extra={<a>详细</a>}
                tabList={tabList}
                activeTabKey={_activeTabKey}
                onTabChange={(key) => {
                    _activeTabKey === "short" ? setActiveTabKey("long") : setActiveTabKey("short");
                    console.log(_activeTabKey);
                }}
            >
                <ul
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        textAlign: "left",
                    }}
                >
                    {plans[_activeTabKey].map((uuid, index) => {
                        return <PlanItem uuid={uuid} key={index}/>
                    })} 
                </ul>
            </Card>
        </div>
    );
}

// PlanCard.propTypes={
//     title:PropTypes.string.isRequired,
//     plans:PropTypes.shape({
//         type:PropTypes.string.isRequired,
//         plan:PropTypes.arrayOf(
//             PropTypes.shape({
//                 content:PropTypes.string.isRequired,
//                 comment:PropTypes.string
//             })
//         )
//     }
//     )
// }

export default PlanCard;

// function MyCard({ plans }) {
//     const [_activeTabKey, setActiveTabKey] = useState("short");
//     return (
//         <div style={{ width: "300px" }}>
//             <Card
//                 style={{
//                     width: "100%",
//                 }}
//                 title={plans.name}
//                 extra={<a href="#">More</a>}
//                 tabList={tabList}
//                 activeTabKey={_activeTabKey}
//                 onTabChange={(key) => {
//                     _activeTabKey === "short" ? setActiveTabKey("long") : setActiveTabKey("short");
//                     console.log(_activeTabKey);
//                 }}
//             >
//                 <ul style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start",textAlign:'left' }}>
//                     {plans[_activeTabKey].map((p) => {
//                         return (
//                             <li>
//                                 <samp>{p}</samp>
//                                 <br />
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </Card>
//         </div>
//     );
// }
