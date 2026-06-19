import dayjs from "dayjs";
import { useContext } from "react";
import { CALENDER_CONTENT_TYPES, MsCalendarContext,WEEK_SIMPLE_NAME } from "../../../context/index.js";
import customParseFormat from "dayjs/plugin/customParseFormat";
// var updateLocale = require('dayjs/plugin/updateLocale')
dayjs.extend(customParseFormat);
// dayjs.extend(updateLocale);
// dayjs.updateLocale('en', {
//     months : String[]
//   })
  

function RangedDaysDetail() {
    const { RangedDays } = useContext(MsCalendarContext);

    return (
        <div className="flex-row">
            {RangedDays.map((d, index) => {
                return (
                    <>
                        <h3 key={index}>{dayjs(d).format("M月D日")}</h3>
                        <h3 >{WEEK_SIMPLE_NAME[d.getDay()]} </h3>

                        <span style={{ height: "400px", width: "4px", backgroundColor: "black" }}></span>
                    </>
                );
            })}
        </div>
    );
}

export {RangedDaysDetail}