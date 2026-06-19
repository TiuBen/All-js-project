import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { ModalContext } from "../../../utils/index";
import { Modal } from "../../Modal";


function CompanyIcon({ name, type, status }) {
    // dd=鼎 aw=安 hjw=韩 hdl=海迪龙
    // type 日历= 进度= 供应商= 订单= 资料= 财务
    var _name, _typeColor, _statusColor;
    switch (name) {
        case "dd":
            _name = "鼎";
            break;
        case "hjw":
            _name = "韩";
            break;
        case "aw":
            _name = "安";
            break;
        case "hdl":
            _name = "海";
            break;
        default:
            _name = "鼎";
            break;
    }

    switch (type) {
        case "fiance":
            _typeColor = "fianceColor";
            break;
        case "goods":
            _typeColor = "goodsColor";
            break;
        case "daily":
            _typeColor = "dailyColor";
            break;
        default:
            _typeColor = "dailyColor";
            break;
    }
    switch (status) {
        case "begin":
            _statusColor = "beginColor";
            break;
        case "running":
            _statusColor = "runningColor";
            break;
        case "finish":
            _statusColor = "finishColor";
            break;
        case "danger":
            _statusColor = "dangerColor";
            break;
        default:
            _statusColor = "runningColor";
            break;
    }

    return (
        <span className={`circle-word ${_typeColor} ${_statusColor}`} style={{ display: "inline-flex" }}>
            {_name}
        </span>
    );
}

function DayCell({ day, activities = [] }) {
    return (
        <div className="className">
            <title>月/月日{day}</title>
            <ul>
                {activities.map((act, index) => {
                    return (
                        <li key={index} className="flex flex-row items-center content-start	">
                            <div style={{ textOverflow: "ellipsis" }}>
                                <CompanyIcon name={act.company} type={act.type} status={act.status} />
                                <a href={act.id} style={{ textOverflow: "ellipsis" }}>
                                    {act.title}
                                </a>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function MonthLarge(props) {
    // const { SelectedDateString, SetSelectedDateString } = useContext(MsCalendarContext);

    // const initDate = dayjs(SelectedDateString, "YYYY-M-D").toDate();
    // const yyyy = initDate.getFullYear();
    // const m = initDate.getMonth();
    // const d = initDate.getDate();

    // //!! 输入人类直接可读的年月日
    // // 当月第一天是星期几
    // const theDayOfThisMonthFirstDay = new Date(yyyy, m, 1).getDay();
    // // console.log("theDayOfThisMonthFirstDay:" + theDayOfThisMonthFirstDay);
    // const froward = DayForwardCount[theDayOfThisMonthFirstDay];

    // let isToday = " ";
    // let isSelected = " ";
    // let isThisMonth = false;

    // const daysItems = [];

    // var _styledId = "uniqueIdPrefix-" + SelectedDateString;

    // for (let x = 1; x <= 42; x++) {
    //     let _tempDayjsDate = new Date(yyyy, m, -froward + x);

    //     if (-froward + x <= 0 || -froward + x > new Date(yyyy, m + 1, 0).getDate()) {
    //         isThisMonth = false;
    //     } else {
    //         isThisMonth = true;
    //     }

    //     if (dayjs(_tempDayjsDate).format("YYYY-M-D") == dayjs(new Date()).format("YYYY-M-D")) {
    //         isToday = true;
    //     } else {
    //         isToday = false;
    //     }

    //     daysItems.push(<DayCell yearMonthDate={_tempDayjsDate} isThisMonth={isThisMonth} isToday={isToday} key={x} />);
    // }
    const {SetModalVisibility}=useContext(ModalContext)

    return (
        <div className="grid grid-cols-7 gap-2 flex-1" style={{ gridTemplateRows: "24px" }}>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期一</div>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期二</div>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期三</div>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期四</div>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期五</div>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期六</div>
            <div className="day-name-in-CN h-6 max-h-6 bg-blue-200">星期日</div>
            {Array(42)
                .fill({})
                .map((x, index) => {
                    return (
                        <section className="one-day-cell border-solid border-4 border-blue-500 overflow-y-auto	" onClick={(e)=>{
                            // console.log(e);
                            SetModalVisibility(true);
                        }}>
                            {props.children}
                        </section>
                    );
                })}
        </div>
    );
}

export { MonthLarge, DayCell };
