import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { MsCalendarContext, DayForwardCount } from "../../../context/index.js";
import {DayCell} from "./DayCell";

function MonthLarge() {
    const { SelectedDateString, SetSelectedDateString } = useContext(MsCalendarContext);

    const initDate = dayjs(SelectedDateString, "YYYY-M-D").toDate();
    const yyyy = initDate.getFullYear();
    const m = initDate.getMonth();
    const d = initDate.getDate();

    //!! 输入人类直接可读的年月日
    // 当月第一天是星期几
    const theDayOfThisMonthFirstDay = new Date(yyyy, m, 1).getDay();
    // console.log("theDayOfThisMonthFirstDay:" + theDayOfThisMonthFirstDay);
    const froward = DayForwardCount[theDayOfThisMonthFirstDay];

    let isToday = " ";
    let isSelected = " ";
    let isThisMonth=false;

    const daysItems = [];

    var _styledId = "uniqueIdPrefix-" + SelectedDateString;

    // !弹出提示的部分
    // const { ToDoPopoverPosition, SetToDoPopoverPosition, TodoComponentVisibility, SetTodoComponentVisibility } = useContext(TodoContext);
    // const [isVisible, setIsVisible] = useState(false);

    // const [referenceElement, setReferenceElement] = useState(null);
    // const [popperElement, setPopperElement] = useState(null);
    // const [arrowElement, setArrowElement] = useState(null);
    // const { styles, attributes } = usePopper(referenceElement, popperElement, {
    //     modifiers: [{ name: "arrow", options: { element: arrowElement } }],
    // });
    // const todoElement=document.getElementById("little-todo-0");

    // !弹出提示的部分
    for (let x = 1; x <= 42; x++) {
        let _tempDayjsDate = new Date(yyyy, m, -froward + x);

        if (-froward+x<=0 || (-froward+x)> new Date(yyyy,m+1,0).getDate()) {
            isThisMonth=false;
        }else{
            isThisMonth=true;
        }

        if (dayjs(_tempDayjsDate).format("YYYY-M-D") == dayjs(new Date()).format("YYYY-M-D")) {
            isToday = true;
        } else {
            isToday = false;
        }

    

        daysItems.push(
            <DayCell  yearMonthDate={_tempDayjsDate} isThisMonth={isThisMonth} isToday={isToday} key={x}/>
        );
    }

    return (
        <div className="large-month">
            <div className="day-name-in-CN">星期一</div>
            <div className="day-name-in-CN">星期二</div>
            <div className="day-name-in-CN">星期三</div>
            <div className="day-name-in-CN">星期四</div>
            <div className="day-name-in-CN">星期五</div>
            <div className="day-name-in-CN">星期六</div>
            <div className="day-name-in-CN">星期日</div>
            {daysItems}
        </div>
    );
}

export {MonthLarge}