import { useContext } from "react";
import { CALENDER_CONTENT_TYPES, MsCalendarContext } from "../../../context/index.js";
 function TypeRangeSwitch() {
    const { SetContentType } = useContext(MsCalendarContext);

    return (
        <div className="test-border type-range-switch-control">
            <div className="dropdown">
                日
                <span className="dropdown-content">
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.ONE_DAY);
                        }}
                    >
                        1
                    </button>
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.TWO_DAY);
                        }}
                    >
                        2
                    </button>
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.THREE_DAY);
                        }}
                    >
                        3
                    </button>
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.FOUR_DAY);
                        }}
                    >
                        4
                    </button>
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.FIVE_DAY);
                        }}
                    >
                        5
                    </button>
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.SIX_DAY);
                        }}
                    >
                        6
                    </button>
                    <button
                        onClick={() => {
                            SetContentType(CALENDER_CONTENT_TYPES.SEVEN_DAY);
                        }}
                    >
                        7
                    </button>
                </span>
            </div>

            <button
                onClick={() => {
                    SetContentType(CALENDER_CONTENT_TYPES.WORKING_5DAYS);
                }}
            >
                工作周
            </button>

            <button
                onClick={() => {
                    SetContentType(CALENDER_CONTENT_TYPES.FULL_WEEK);
                }}
            >
                周
            </button>

            <button
                onClick={() => {
                    SetContentType(CALENDER_CONTENT_TYPES.ONE_MONTH);
                }}
            >
                月
            </button>
        </div>
    );
}

export {TypeRangeSwitch}