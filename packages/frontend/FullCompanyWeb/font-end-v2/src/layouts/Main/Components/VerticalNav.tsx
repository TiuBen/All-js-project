import { Link } from "react-router-dom";

const allNavItem = [
  {
      icon: "calendar_month",
      title: "日历",
      url: "calendar",
      subContent: ["日程安排", "请假"],
  },
  {
      icon: "grading",
      title: "项目",
      url: "gantt",
      subContent: ["新建项目", "已有项目", "完结项目"],
  },
  {
      icon: "perm_contact_calendar",
      title: "供应链",
      url: "supplier",
      subContent: ["供应商", {title:"客户",url:'client'}, "进销存管理"],
  },
  {
      icon: "inventory",
      title: "订单",
      url: "order",
      subContent: ["进行中", "已完成", "意向", "订单数据"],
  },
  {
      icon: "hive",
      title: "资料",
      url: "tools",
      subContent: ["已有合同", {title:"工具",url:"tools"}, "产品知识", "文件模版", "培训文档"],
  },
  {
      icon: "local_atm",
      title: "财务",
      url: "fiance",
      subContent: ["财务状况", {title:"报销",url:"expense"}, "公司资产", "人力资源"],
  },
];

// function VerticalNavItem({ icon, title, baseUrl, url, subContent }) {
//   return (
//       <li className="flex-1  text-[20px] mx-2 font-bold  cursor-pointer text-zinc-800">
//           <div className="m-0 p-0 flex flex-row flex-1  items-center text-align-justify self-start  whitespace-pre ">
//               <span className=" material-icons">{icon}</span>
//               <div className="text-align-last-justify flex-1 mx-2 text-align-justify ">{title}</div>
//           </div>
//           {subContent.map((item, index) => {
//               return (
//                   <div key={index} className="ml-[1rem] text-[16px] font-normal text-neutral-600 whitespace-nowrap">
//                       <Link className="m-0 p-0 flex flex-row items-center hover:underline" to={`/${item?.url??item}`}>
//                           {item?.title??item}
//                       </Link>
//                   </div>
//               );
//           })}
//       </li>
//   );
// }

export const VerticalNav = () => {
  return (
    <div>VerticalNav</div>
  )
}
