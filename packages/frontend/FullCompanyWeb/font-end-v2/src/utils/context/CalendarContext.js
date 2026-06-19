import dayjs from "dayjs";
import { createContext, useState } from "react";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

function getYYYYMMDDString(date) {
    if (date instanceof Date) {
        return dayjs(date).format("YYYY年MM月DD日");
    } else {
        return "0000年00月00日";
    }
}

// const CALENDER_CONTENT_TYPES = [
//     "SELF_DEFINE_DAYS_COUNT", // 1,2,3,4,5,6,7
//     "WORKING_5DAYS",//从周一到周五
//     "FULL_WEEK",//从周一到周五
//     "MONTH",//显示 12个月份 供选择
//     "YEAR",// 显示 N个年份 供选择
// ];

const CALENDER_CONTENT_TYPES = {
    // DAY: "DAY",
    SELF_DEFINE_DAYS_COUNT: "SELF_DEFINE_DAYS_COUNT", // 1,2,3,4,5,6,7
    WORKING_5DAYS: "WORKING_5DAYS",
    FULL_WEEK: "FULL_WEEK",
    MONTH: "MONTH",
};

const WEEK_SIMPLE_NAME = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const MONTH_FULL_NAME = [
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

const CalendarContext = createContext({
    Today: new Date(),
    TodayDateString: getYYYYMMDDString(new Date()),
    DaysRange: 1, //选项有 1-7天
    SetDaysRange:null,
    StartDate: "",
    EndDate: "",
    // CalendarContentType: CALENDER_CONTENT_TYPES.MONTH,
    // 1,2,3,4,5,6,7,
    CalendarContentType: CALENDER_CONTENT_TYPES.MONTH,
    SetCalendarContentType:null,
    YYYY: 2023, //年
    MM: 1,// js 的 月是 0-11 我们使用正常人用的 1-12
    DD: 12, // 1-31
    SetYYYY: null,
    SetMM: null,
    SetDD: null,
    SelectedDateYYYYMMDDString: "", //From mini Calendar click
    SetSelectedDateYYYYMMDDString: null,
    RelatedDate:[],
    SetRelatedDate:null,
});

const DayForwardCount = [6, 0, 1, 2, 3, 4, 5];

function getRelatedDate(type, initDateString, range = 1, containInput = false) {
    //type=CalendarContentType
    //initDateString YYYY-M-D
    //range 1-7
    //是否包含输入的日期

    const relatedDate = [];
    let _inputDate = dayjs(initDateString, "YYYY-M-D").toDate();
    const yyyy = _inputDate.getFullYear(); //
    const mm = _inputDate.getMonth(); // 0-11
    const dd = _inputDate.getDate(); // 1-31

    // 包括 输入的 date
    if (type == CALENDER_CONTENT_TYPES.DAY || type == CALENDER_CONTENT_TYPES.SELF_DEFINE_DAYS_COUNT) {
        // 包括输入的,从输入后面的开始
        for (let i = 0; i < range; i++) {
            let _d = new Date(yyyy, mm, dd + i);
            relatedDate.push(_d);
        }
    } else if (type == CALENDER_CONTENT_TYPES.WORKING_5DAYS) {
        // 获取一周 然后 用 移除的方法
        const forwardCount = DayForwardCount[_inputDate.getDay()];
        // 先获取一周
        for (let index = 0; index < 7; index++) {
            relatedDate.push(new Date(yyyy, mm, dd - forwardCount + index));
        }
        relatedDate.filter((d) => d.getDay() == 6); //移除周六
        relatedDate.filter((d) => d.getDay() == 0); //移除周日
    } else if (type == CALENDER_CONTENT_TYPES.FULL_WEEK) {
        // 获取一周 然后 用 移除的方法
        const forwardCount = DayForwardCount[_inputDate.getDay()];
        // 先获取一周
        for (let index = 0; index < 7; index++) {
            relatedDate.push(new Date(yyyy, mm, dd - forwardCount + index));
        }
        relatedDate.filter((d) => d.getDay() == _inputDate.getDay()); //移除 input date
    } else if (type == CALENDER_CONTENT_TYPES.MONTH) {
        relatedDate.push(new Date(yyyy, mm, dd));
    } else {
        console.error(" getRelatedDate wrong!");
    }
    if (containInput === false) {
        relatedDate.filter((d) => d.getDay() == _inputDate.getDay()); //移除 input date
    }

    return relatedDate;
}

export {
    CalendarContext,
    getYYYYMMDDString,
    CALENDER_CONTENT_TYPES,
    WEEK_SIMPLE_NAME,
    MONTH_FULL_NAME,
    getRelatedDate,
};
