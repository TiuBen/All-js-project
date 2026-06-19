import {useContext} from "react";
import dayjs from "dayjs";
import { CALENDER_CONTENT_TYPES, MsCalendarContext } from "../../../context/index.js";


 function ForwardBackwardTodayControl() {
    const { ContentType, SetSelectedDateString, RangedDays } = useContext(MsCalendarContext);

    return (
        <div className="flex-row fixed-days-schedular-banner">
            <button
                onClick={() => {
                    SetSelectedDateString(dayjs().format("YYYY-M-D"));
                }}
            >
                今天
            </button>

            <button
                onClick={() => {
                    let _startDate = RangedDays[0];
                    let yyyy = _startDate.getFullYear(); //
                    let m = _startDate.getMonth(); // 0-11
                    let d = _startDate.getDate(); // 1-31
                    let _newStartDate;

                    switch (ContentType) {
                        case CALENDER_CONTENT_TYPES.WORKING_5DAYS:
                            _newStartDate = new Date(yyyy, m, d - 7);
                            break;
                        case CALENDER_CONTENT_TYPES.FULL_WEEK:
                            _newStartDate = new Date(yyyy, m, d - 7);
                            break;
                        case CALENDER_CONTENT_TYPES.ONE_DAY:
                            _newStartDate = new Date(yyyy, m, d - 1);
                            break;
                        case CALENDER_CONTENT_TYPES.TWO_DAY:
                            _newStartDate = new Date(yyyy, m, d - 2);
                            break;
                        case CALENDER_CONTENT_TYPES.THREE_DAY:
                            _newStartDate = new Date(yyyy, m, d - 3);
                            break;
                        case CALENDER_CONTENT_TYPES.FOUR_DAY:
                            _newStartDate = new Date(yyyy, m, d - 4);
                            break;
                        case CALENDER_CONTENT_TYPES.FIVE_DAY:
                            _newStartDate = new Date(yyyy, m, d - 5);
                            break;
                        case CALENDER_CONTENT_TYPES.SIX_DAY:
                            _newStartDate = new Date(yyyy, m, d - 6);
                            break;
                        case CALENDER_CONTENT_TYPES.SEVEN_DAY:
                            _newStartDate = new Date(yyyy, m, d - 7);
                            break;
                        case CALENDER_CONTENT_TYPES.ONE_MONTH:
                            _newStartDate = new Date(yyyy, m - 1, 1);
                            break;
                        default:
                            console.log("something wrong !");
                    }

                  
                    SetSelectedDateString(dayjs(_newStartDate).format("YYYY-M-D"));
                }}
            >
                往前
            </button>
            <button
                onClick={() => {
                    let _startDate = RangedDays[0];
                    let yyyy = _startDate.getFullYear(); //
                    let m = _startDate.getMonth(); // 0-11
                    let d = _startDate.getDate(); // 1-31
                    let _newStartDate;

                    switch (ContentType) {
                        case CALENDER_CONTENT_TYPES.WORKING_5DAYS:
                            _newStartDate = new Date(yyyy, m, d + 7);
                            break;
                        case CALENDER_CONTENT_TYPES.FULL_WEEK:
                            _newStartDate = new Date(yyyy, m, d + 7);
                            break;
                        case CALENDER_CONTENT_TYPES.ONE_DAY:
                            _newStartDate = new Date(yyyy, m, d + 1);
                            break;
                        case CALENDER_CONTENT_TYPES.TWO_DAY:
                            _newStartDate = new Date(yyyy, m, d + 2);
                            break;
                        case CALENDER_CONTENT_TYPES.THREE_DAY:
                            _newStartDate = new Date(yyyy, m, d + 3);
                            break;
                        case CALENDER_CONTENT_TYPES.FOUR_DAY:
                            _newStartDate = new Date(yyyy, m, d + 4);
                            break;
                        case CALENDER_CONTENT_TYPES.FIVE_DAY:
                            _newStartDate = new Date(yyyy, m, d + 5);
                            break;
                        case CALENDER_CONTENT_TYPES.SIX_DAY:
                            _newStartDate = new Date(yyyy, m, d + 6);
                            break;
                        case CALENDER_CONTENT_TYPES.SEVEN_DAY:
                            _newStartDate = new Date(yyyy, m, d + 7);
                            break;
                        case CALENDER_CONTENT_TYPES.ONE_MONTH:
                            _newStartDate = new Date(yyyy, m + 1, 1);
                            break;
                        default:
                            console.log("something wrong !");
                    }

                  
                    SetSelectedDateString( dayjs(_newStartDate).format("YYYY-M-D"));
                }}
            >
                往后
            </button>

           
        </div>
    );
}

export {ForwardBackwardTodayControl}
