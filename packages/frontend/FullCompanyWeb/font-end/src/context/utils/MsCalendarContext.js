import dayjs from "dayjs";
import { createContext, useState } from "react";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const CALENDER_CONTENT_TYPES = {
    ONE_DAY: "ONE_DAY",
    TWO_DAY: "TWO_DAY",
    THREE_DAY: "THREE_DAY",
    FOUR_DAY: "FOUR_DAY",
    FIVE_DAY: "FIVE_DAY",
    SIX_DAY: "SIX_DAY",
    SEVEN_DAY: "SEVEN_DAY",
    WORKING_5DAYS: "WORKING_5DAYS",
    FULL_WEEK: "FULL_WEEK",
    ONE_MONTH: "ONE_MONTH",
    FULL_MONTH: "FULL_MONTH",
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

const MsCalendarContext = createContext({
    RangedDays: [],
    SetRangedDays: null,
    SelectedDateString: dayjs().format("YYYY-M-D"),
    SetSelectedDateString: null,
    ContentType: CALENDER_CONTENT_TYPES.ONE_MONTH,
    SetContentType: null,
});

const DayForwardCount = [6, 0, 1, 2, 3, 4, 5];

function getRelatedDate(cType, inputDayjsDateString, containInputDate = false) {
    //type=CalendarContentType
    //initDateString YYYY-M-D
    //range 1-7
    //是否包含输入的日期

    var relatedDate = [];
    let _inputDate = dayjs(inputDayjsDateString, "YYYY-M-D").toDate();
    const yyyy = _inputDate.getFullYear(); //
    const m = _inputDate.getMonth(); // 0-11
    const d = _inputDate.getDate(); // 1-31

    // 包括 输入的 date
    if (cType == CALENDER_CONTENT_TYPES.WORKING_5DAYS) {
        const forwardCount = DayForwardCount[_inputDate.getDay()];
        // 先获取一周
        for (let index = 0; index < 7; index++) {
            relatedDate.push(new Date(yyyy, m, d - forwardCount + index));
        }
        const _temp= relatedDate.filter(d => d.getDay() != 6 && d.getDay() != 0); //移除周六 移除周日
        relatedDate=_temp;
    } else if (cType == CALENDER_CONTENT_TYPES.FULL_WEEK) {
        // 获取一周 然后 用 移除的方法
        const forwardCount = DayForwardCount[_inputDate.getDay()];
        // 先获取一周
        for (let index = 0; index < 7; index++) {
            relatedDate.push(new Date(yyyy, m, d - forwardCount + index));
        }
        
    } else {
        let range = 1;
        switch (cType) {
            case CALENDER_CONTENT_TYPES.ONE_DAY:
                range = 1;
                break;
            case CALENDER_CONTENT_TYPES.TWO_DAY:
                range = 2;
                break;
            case CALENDER_CONTENT_TYPES.THREE_DAY:
                range = 3;
                break;
            case CALENDER_CONTENT_TYPES.FOUR_DAY:
                range = 4;
                break;
            case CALENDER_CONTENT_TYPES.FIVE_DAY:
                range = 5;
                break;
            case CALENDER_CONTENT_TYPES.SIX_DAY:
                range = 6;
                break;
            case CALENDER_CONTENT_TYPES.SEVEN_DAY:
                range = 7;
                break;
            case CALENDER_CONTENT_TYPES.ONE_MONTH:
                range = 1;
                break;
            default:
                range=1
        }
        for (let i = 0; i < range; i++) {
            let _d = new Date(yyyy, m, d + i);
            relatedDate.push(_d);
        }
    }

    // // 不管怎么样 RangeDate大于等于1
    // if (relatedDate.length=1) {
        
    // }


    // //!移除 input date
    // if (!containInputDate) {
    //     relatedDate.filter((d) => d.getDay() == _inputDate.getDay());
    // }



    return relatedDate;
}

export { CALENDER_CONTENT_TYPES, WEEK_SIMPLE_NAME, MONTH_FULL_NAME, MsCalendarContext,DayForwardCount, getRelatedDate };
