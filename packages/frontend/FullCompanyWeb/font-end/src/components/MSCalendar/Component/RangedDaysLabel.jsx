import dayjs from "dayjs";
import { useContext } from "react";
import { MsCalendarContext } from "../../../context/index.js";

 function RangedDaysLabel() {
    const { RangedDays } = useContext(MsCalendarContext);

    return (
        <div className="ranged-day-label">
            {dayjs(RangedDays[0]).format("M月D日")}-{dayjs(RangedDays[RangedDays.length - 1]).format("M月D日")}
            <div style={{ backgroundColor: "red" }}>
                这里还需要个控件
              
            </div>
        </div>
    );
}


export {RangedDaysLabel}