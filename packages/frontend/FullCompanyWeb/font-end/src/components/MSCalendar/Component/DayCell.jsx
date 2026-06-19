import { useContext, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { MsCalendarContext, DayForwardCount, TodoContext, AnchorContext,getPosition } from "../../../context/index.js";
import "./MsCalendar.scss";

function DayCell(props) {
    const { yearMonthDate, isThisMonth, isToday } = props;
    // 本来的功能
    let todayStyle = " ";
    let isSelected = " ";
    const { SelectedDateString, SetSelectedDateString } = useContext(MsCalendarContext);
    if (isToday) {
        todayStyle = "is-today";
    } else {
        todayStyle = "";
    }
    if (dayjs(yearMonthDate).format("YYYY-M-D") == SelectedDateString) {
        isSelected = "is-selected";
    } else {
        isSelected = "";
    }

    // Todo模块的功能
    const _fake_todo = ["待做清单1", "待做清单2", "待做清单3", "待做清单4"];
    const { SetAnchorStyle } = useContext(AnchorContext);
    const {TodoList,TempTodo,SetTempTodo,SetTodoType}=useContext(TodoContext);

    return (
        <div className={"day-cell test-border " + todayStyle + " " + isSelected}>
            <button
                type="button"
                onClick={(e) => {
                    console.log("鼠标左键单击了");
                    e.preventDefault();
                    e.stopPropagation();
                    // !
                    const _newAnchorStyle=getPosition(e.target,500,360);
                    console.log(_newAnchorStyle);
                    SetAnchorStyle(_newAnchorStyle);
                    // !
                    SetTempTodo({title:'新建一个计划'})
                    SetTodoType("MIDDLE");
                }}
                onContextMenu={(e) => {
                   
                }}
            >
                {isThisMonth ? dayjs(yearMonthDate).format("D日") : dayjs(yearMonthDate).format("M月D日")}
            </button>
            {TodoList.filter(
                (x) => dayjs(x.startTime).format("YYYY-M-D") == dayjs(yearMonthDate).format("YYYY-M-D")
            ).map((x, index) => {
                return (
                    <div
                        className="single-todo"
                        key={index}
                        data-value={x}
                        onClick={(e) => {
                            console.log(e.target.getAttribute("data-value"));
                            // SetTodoComponentVisibility(!TodoComponentVisibility);
                        }}
                    >
                        {x.title}
                    </div>
                );
            })}
        </div>
    );
}

export { DayCell };
