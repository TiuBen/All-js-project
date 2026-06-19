import React, { useState, useEffect } from 'react'
import './Calendar.css';


export default function Calendar() {
    const Months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

    const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    //getday   方法根据本地时间，返回一个具体日期中一周的第几天，0 表示星期天。

    //getdate 根据本地时间，返回一个指定的日期对象为一个月中的哪一日（从1--31）。

    //getFullYear() 方法根据本地时间返回指定日期的年份。
    //get month  根据本地时间，返回一个指定的日期对象的月份，为基于0的值（0表示一年中的第一月）。
    const [YYYY, setYYYY] = useState(2020);// 1900-2200
    const [MM, setMM] = useState(11);// 0~11
    const [DD, setDD] = useState(28); //1-31

    //const [first, setFirst] = useState((new Date(YYYY, MM, 1)).getDate());
    const first = 1;//一个月的第一天 永远是1号
    const [firstDay, setFirstDay] = useState(0);//确定1号是星期几
    const [last, setLast] = useState(27);//确定这月有多少天
    const [lastDay, setLastDay] = useState(0);//确定这个月最后一天是星期几

    const [selectedYYYYMMDD, setselectedYYYYMMDD] = useState(Date());

    useEffect(() => {
        const today = new Date();
        setYYYY(today.getFullYear());
        setMM(today.getMonth());
        setDD(today.getDate());

        setFirstDay((new Date(YYYY, MM, 1)).getDay());
        setLast((new Date(YYYY, MM + 1, 0)).getDate());
        setLastDay((new Date(YYYY, MM + 1, 0)).getDay());

    }, [])



    const onLastYYYYClick = () => {
        setYYYY(YYYY - 1);

        const howManyDate = (new Date(YYYY - 1, MM, 0)).getDate();//28,29,30,31
        if ((MM === 1) && (DD >= howManyDate)) {
            setDD(howManyDate);
        }
        setFirstDay((new Date(YYYY - 1, MM, 1)).getDay());
        setLast((new Date(YYYY - 1, MM + 1, 0)).getDate());
        setLastDay((new Date(YYYY - 1, MM + 1, 0)).getDay());
    }
    const onLastMMClick = () => {
        console.log("onLastMMClick");
        if (MM === 0) {
            setYYYY(YYYY - 1);
            setMM(11);
            setFirstDay((new Date(YYYY - 1, 11, 1)).getDay());
            setLast((new Date(YYYY - 1, 11 + 1, 0)).getDate());
            setLastDay((new Date(YYYY - 1, 11 + 1, 0)).getDay());
        } else {
            setMM(MM - 1);
            setFirstDay((new Date(YYYY, MM - 1, 1)).getDay());
            setLast((new Date(YYYY, MM - 1 + 1, 0)).getDate());
            setLastDay((new Date(YYYY, MM - 1 + 1, 0)).getDay());
        }
        const howManyDate = (new Date(YYYY, MM, 0)).getDate();//28,29,30,31
        if (DD >= howManyDate) {
            setDD(howManyDate);

        }

    }
    const onNextMMClick = () => {
        if (MM === 11) {
            setYYYY(YYYY + 1);
            setMM(0);
            setFirstDay((new Date(YYYY + 1, 0, 1)).getDay());
            setLast((new Date(YYYY + 1, 1, 0)).getDate());
            setLastDay((new Date(YYYY + 1, 1, 0)).getDay());
        } else {
            setMM(MM + 1);
            setFirstDay((new Date(YYYY, MM + 11, 1)).getDay());
            setLast((new Date(YYYY, MM + 11 + 1, 0)).getDate());
            setLastDay((new Date(YYYY, MM + 11 + 1, 0)).getDay());
        }
        const howManyDate = (new Date(YYYY, MM, 0)).getDate();//28,29,30,31
        if (DD >= howManyDate) {
            setDD(howManyDate);
        }
    }
    const onNextYYYYClick = () => {
        setYYYY(YYYY + 1);
        const howManyDate = (new Date(YYYY + 1, MM, 0)).getDate();//28,29,30,31

        if ((MM === 1) && (DD >= howManyDate)) {
            setDD(howManyDate);
        }
        setFirstDay((new Date(YYYY + 1, MM, 1)).getDay());
        setLast((new Date(YYYY + 1, MM + 1, 0)).getDate());
        setLastDay((new Date(YYYY + 1, MM + 1, 0)).getDay());



    }

    const onDDClick = (e, value) => {
        //setDD(Number(e));
    }

    const ontest = (e) => {
        setDD(parseInt(e.target.textContent, 10));

        console.log(parseInt(e.target.textContent, 10));
    }

    const getTable = () => {
        var cells = [];

        var prefix;// = prefixMM();
        var suffix;//= suffixMM();
        if (firstDay === 0) {
            prefix = 6;
        }
        else {
            prefix = firstDay - 1;
        }
        if (lastDay === 0) {
            suffix = 0;
        }
        else {
            suffix = 7 - lastDay;
        }
        var monthPage = prefix + last + suffix;
        var _y = YYYY;
        var _m = MM;
        console.log(prefix + " " + suffix + " " + _y + " " + _m + " " + monthPage);

        for (let x1 = 0; x1 < prefix; x1++) {
            let date = (new Date(_y, _m, -prefix + x1 + 1)).getDate();
            if (date === DD) {
                cells[x1] = <td class="selected-date" onClick={(e) => ontest(e)} >{date}</td>;
            }
            cells[x1] = <td class="last-date">{date}</td>;
        }
        for (let x2 = prefix; x2 < prefix + last; x2++) {
            let date = (new Date(_y, _m, x2 - prefix + 1)).getDate();
            cells[x2] = <td class={DD === date ? "selected-date" : "calendar-dateToday-cell"} onClick={(e) => ontest(e)} >{date}</td>;
        }
        for (let x3 = prefix + last; x3 < monthPage; x3++) {
            let date = (new Date(_y, _m, x3 - prefix + 1)).getDate();
            cells[x3] = <td class="next-date">{date}</td>;
        }


        var table = [];
        for (let index = 0; index < monthPage / 7; index++) {

            table.push(cells.slice(index * 7, (index + 1) * 7));
        }
        return table;
    }

    const style = {

    }


    return (
        <>
        
            <div>
                calendar
                <h2>今天是{selectedYYYYMMDD}</h2>
                <h1> 选中了 {YYYY}年-{Months[MM]}[{MM}]-{DD}号</h1>
                <h2>{Months[MM]}第一天是{first}号-是{week[firstDay]} [{firstDay}] </h2>
                <h2>{Months[MM]}最后一天是{last}号-是{week[lastDay]} [{lastDay}]</h2>
                {/*<h3>monthPage {monthPage}={prefixMM()}+{last}+{suffixMM()} </h3>*/}
            </div>
            <table class="calendar">
                <thead class="calendar-nav">
                    <div class="svg-container" onClick={() => onLastYYYYClick()}>
                        <svg viewBox="0 0 24 24" transform="rotate(180)"  >
                            <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path><path d="M8.5 5H4l5 7-5 7h4.5l5-7z"></path>
                        </svg>
                    </div>
                    <div class="svg-container" onClick={() => onLastMMClick()}>
                        <svg viewBox="0 0 24 24" transform="rotate(180)"  >
                            <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path>
                        </svg>
                    </div>
                    <div class="calendar-header" >{YYYY + "年" + Months[MM]}</div>
                    <div class="svg-container" onClick={() => onNextMMClick()}>
                        <svg viewBox="0 0 24 24"   >
                            <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path>
                        </svg>
                    </div>
                    <div class="svg-container" onClick={() => onNextYYYYClick()}>
                        <svg viewBox="0 0 24 24"   >
                            <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path><path d="M8.5 5H4l5 7-5 7h4.5l5-7z"></path>
                        </svg>
                    </div>

                </thead>
                <tbody class="calendar-body">
                    <tr class="calendar-week-row">

                        {["一", "二", "三", "四", "五", "六", "日"].map(day => {
                            return (
                                <td key={day} className="calendar-dayToday-cell">
                                    {day}
                                </td>
                            )
                        })}
                    </tr>
                    {getTable().map((r, i) => {
                        return <tr key={i} class="calendar-week-row">
                            {r}
                        </tr>
                    })}
                </tbody>
            </table>
        </>

    )
}
