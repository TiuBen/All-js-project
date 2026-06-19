import { monthsShort } from "moment";
import React from "react";

const week_FullName = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const week_SimpleName = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const month_FullName = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
];
const month_SimpleName = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
// Date.prototype.getMonth()
//     根据本地时间，返回一个指定的 Date 对象的月份（0–11），0 表示一年中的第一月。
// Date.prototype.getDate()
//     根据本地时间，返回一个指定的 Date 对象为一个月中的哪一日（1-31）。
// Date.prototype.getDay()
//     根据本地时间，返回一个指定的 Date 对象是在一周中的第几天（0-6），0 表示星期天。

function MonthItem(year, month) {
    //
    console.log("Month: " + new Date(year, month, 1).toLocaleDateString());
    // 当月有多少天
    const daysCountOfThisMonth = new Date(year, month + 1, 0).getDate();
    console.log("daysCountOfThisMonth: " + daysCountOfThisMonth);
    // 当月第一天是星期几
    const theDayOfThisMonthFirstDay = new Date(year, month, 1).getDay();

    const daysItems = [];
    let lightOrDark = "Dark";

    for (let x = 1; x <= 42; x++) {
        lightOrDark = "Dark";
        if (new Date(year, month, -theDayOfThisMonthFirstDay + x).getMonth() !== month) {
            lightOrDark = "light";
        }

        const day = new Date(year, month, -theDayOfThisMonthFirstDay + x).getDate();
        const yyyymmdd = new Date(year, month, -theDayOfThisMonthFirstDay + x).toDateString();

        daysItems.push(
            <td className={lightOrDark} key={yyyymmdd}>
                {day}
            </td>
        );
    }

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
        <div>
            <table>
                <tbody>

                <tr>
                    <td>{month_FullName[month]}</td>
                </tr>
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

export default function YearItem(props) {
    const _style = { display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start" };

    const { year } = props;
    console.log("YearItem :" + year);
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <ul>
                <li style={_style}>
                    {MonthItem(year, 0)}
                    {MonthItem(year, 1)}
                    {MonthItem(year, 2)}
                    {MonthItem(year, 3)}
                </li>
                <li style={_style}>
                    {MonthItem(year, 4)}
                    {MonthItem(year, 5)}
                    {MonthItem(year, 6)}
                    {MonthItem(year, 7)}
                </li>
                <li style={_style}>
                    {MonthItem(year, 8)}
                    {MonthItem(year, 9)}
                    {MonthItem(year, 10)}
                    {MonthItem(year, 11)}
                </li>
            </ul>
        </div>
    );
}
