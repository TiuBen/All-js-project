import React from "react";
import "./SwitchDayWeekMonthYear.css";

export default function SwitchDayWeekMonthYear({onClick}) {
    var isInYear=false;

    return (
            <div class="btn-group" role="group" aria-label="Basic example">
                <button type="button" class="btn btn-secondary" value='DAY' onClick={onClick}>
                    日
                </button>
                <button type="button" class="btn btn-secondary" value='WEEK' onClick={onClick}>
                    周
                </button>
                <button type="button" class="btn btn-secondary" value='MONTH' onClick={(e)=>{onClick(e,isInYear)} }>
                    月
                </button>
                <button type="button" class="btn btn-secondary" value='YEAR' onClick={onClick}>
                    年
                </button>
            </div>
    );
}
