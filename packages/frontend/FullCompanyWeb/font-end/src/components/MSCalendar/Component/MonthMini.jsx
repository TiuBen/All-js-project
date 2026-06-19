import { useContext } from "react";
import dayjs from "dayjs";
import {
    CALENDER_CONTENT_TYPES,
    MsCalendarContext,
    DayForwardCount,
    getRelatedDate,
} from "../../../context/index.js";

function MonthMini() {
    const { ContentType, SelectedDateString, SetSelectedDateString, RangedDays } = useContext(MsCalendarContext);

    const initDate = dayjs(SelectedDateString, "YYYY-M-D").toDate();
    // console.log("mini c: " + initDate.toLocaleString());
    const yyyy = initDate.getFullYear();
    const m = initDate.getMonth();
    const d = initDate.getDate();

    //!! 输入人类直接可读的年月日
    // 当月第一天是星期几
    const theDayOfThisMonthFirstDay = new Date(yyyy, m, 1).getDay();
    // console.log("theDayOfThisMonthFirstDay: " + theDayOfThisMonthFirstDay);

    const froward = DayForwardCount[theDayOfThisMonthFirstDay];
    const daysItems = [];
    let lightOrDark = "Dark";
    let todayStyle = " ";

    var mouseOverDays = [];

    for (let x = 1; x <= 42; x++) {
        lightOrDark = "Dark";

        // let _tempDayjsDate = new Date(yyyy, m, -theDayOfThisMonthFirstDay + x+1);
        let _tempDayjsDate = new Date(yyyy, m, -froward + x);
        //不是这个月的日期是 灰色
        if (_tempDayjsDate.getMonth() != m) {
            lightOrDark = "light";
        }

        if (dayjs(_tempDayjsDate).format("YYYY-M-D") == dayjs().format("YYYY-M-D")) {
            todayStyle = "red-background-color zIndex1";
        } else {
            todayStyle = "";
        }

        let isSelected = "";
        RangedDays.forEach((d) => {
            if (dayjs(d).format("YYYY-M-D") == dayjs(_tempDayjsDate).format("YYYY-M-D")) {
                isSelected = "test-border";
            }
        });

        daysItems.push(
            <td
                className={lightOrDark + " " + todayStyle + " day-item " + isSelected}
                key={dayjs(_tempDayjsDate).format("YYYY-M-D")}
                id={dayjs(_tempDayjsDate).format("YYYY-M-D")}
                onClick={(e) => {
                    SetSelectedDateString(e.target.id);
                }}
                onMouseEnter={(e) => {
                    // console.log("onMouseEnter");
                    const id = e.target.id;
                    // console.log(`要改变ID: ${id} 附近的效果了 `);

                    mouseOverDays = getRelatedDate(ContentType, id, false);

                    mouseOverDays.forEach((d) => {
                        var element = document.getElementById(dayjs(d).format("YYYY-M-D"));
                        element.setAttribute("style", "background-color:yellow");
                    });

                    // console.log();
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onMouseLeave={(e) => {
                    // console.log("onMouseLeave");
                    // const id = e.target.id;
                    // console.log(`要改变ID: ${id} 附近的效果了 `);

                    mouseOverDays.forEach((d) => {
                        var element = document.getElementById(dayjs(d).format("YYYY-M-D"));
                        element.removeAttribute("style");
                    });

                    // console.log();
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                {dayjs(_tempDayjsDate).date()}
            </td>
        );
    }

    // daysItems.forEach(d => {
    //     if (RangeDays.con) {

    //     }

    // });

    const array = [];
    for (let row = 0; row < 6; row++) {
        const rowElements = (
            <tr key={row}>
                {daysItems[row * 7 + 0]}
                {daysItems[row * 7 + 1]}
                {daysItems[row * 7 + 2]}
                {daysItems[row * 7 + 3]}
                {daysItems[row * 7 + 4]}
                {daysItems[row * 7 + 5]}
                {daysItems[row * 7 + 6]}
            </tr>
        );
        array.push(rowElements);
    }

    return (
        <div className="mini-month test-border">
            <div className="mini-month-control test-border">
                {<h3>{dayjs(RangedDays[0]).format("YYYY年M月")}</h3>}
                <button>往前</button>
                <button>往后</button>
            </div>

            <table className="test-border" style={{ cursor: "pointer", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td>一</td>
                        <td>二</td>
                        <td>三</td>
                        <td>四</td>
                        <td>五</td>
                        <td>六</td>
                        <td>日</td>
                    </tr>
                    {array}
                </tbody>
            </table>
        </div>
    );
}

export {MonthMini}