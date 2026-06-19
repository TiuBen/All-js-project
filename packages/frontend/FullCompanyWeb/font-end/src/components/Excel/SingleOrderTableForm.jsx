import React, { useEffect ,useState } from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, message, Space, Tooltip,DatePicker } from "antd";
import dayjs from 'dayjs';
import locale from 'antd/locale/zh_CN';
import SingleOrderDetail from "./SingleOrderDetail";


const handleMenuClick = (e) => {
    message.info("Click on menu item.");
    console.log("click", e);
};
// const items = [
//     {
//         label: "",
//         key: "1",
//         icon: <UserOutlined />,
//     },
//     {
//         label: "2nd menu item",
//         key: "2",
//         icon: <UserOutlined />,
//     },
//     {
//         label: "3rd menu item",
//         key: "3",
//         icon: <UserOutlined />,
//     },
// ];
// const menuProps = {
//     items,
//     onClick: handleMenuClick,
// };

const onChange = (date, dateString) => {
  console.log(date, dateString);
};


export default function SingleOrderTableForm() {
    //下单人  （必填)
    const [StaffName, setStaffName] = useState({});

    useEffect(() => {
        fetch("http://localhost:3100/csv", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ lookUpKey: "下单人  （必填）" }),
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                console.log("获取的CSV数据");
                console.log(json);
                const items=[];
               
                json.map((staffName,index)=>{
                  items.push({
                    label:staffName,
                    key:index,
                    icon: <UserOutlined />,
                  })

                });
               
                var _menuProps= {
                  items,
                 onClick: handleMenuClick,
                }
                 console.log(_menuProps);
                setStaffName(_menuProps)


            });
    }, {});

    return (
        <div>
            <div>
                <Dropdown.Button menu={StaffName} placement="bottom" icon={<UserOutlined />}>
                    下单人
                </Dropdown.Button>
                <DatePicker defaultValue={dayjs() }/>

                <SingleOrderDetail />

            </div>
        </div>
    );
}
