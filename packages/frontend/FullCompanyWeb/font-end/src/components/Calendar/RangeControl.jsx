import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { CalendarContext, CALENDER_CONTENT_TYPES } from "context/CalendarContext.js";

export default function RangeControl() {
    const { RelatedDate, CalendarContentType } = useContext(CalendarContext);


    


    var _rangeElement;
    if (CalendarContentType == CALENDER_CONTENT_TYPES.MONTH) {
        _rangeElement = <h3> {dayjs(RelatedDate[0]).format("YYYY年M月")}</h3>;
    } else {
        const lastIndex = RelatedDate.length;
        //
        if (lastIndex > 1) {
            let isInSameMonth = RelatedDate[0].getMonth() == RelatedDate[lastIndex].getMonth();
            let isInSameYear = RelatedDate[0].getFullYear() == RelatedDate[lastIndex].getFullYear();
            if (isInSameYear) {
                if (isInSameMonth) {
                    _rangeElement = (
                        <div>
                            <h3>{dayjs(RelatedDate[0]).format("M月D日")}</h3>
                            <h3>"-"+{dayjs(RelatedDate[lastIndex]).format("D日")}</h3>
                        </div>
                    );
                } else {
                    _rangeElement = (
                        <div>
                            <h3>{dayjs(RelatedDate[0]).format("M月D日")}</h3>
                            <h3>"-"+{dayjs(RelatedDate[lastIndex]).format("M月D日")}</h3>
                        </div>
                    );
                }
            } else {
                _rangeElement = (
                    <div>
                        <h3>{dayjs(RelatedDate[0]).format("YYYY年M月D日")}</h3>
                        <h3>"-"+{dayjs(RelatedDate[lastIndex]).format("YYYY年M月D日")}</h3>
                    </div>
                );
            }
        } else {
            _rangeElement = (
                <div>
                    <h3>{dayjs(RelatedDate[0]).format("M月D日")}</h3>
                </div>
            );
        }

        //
    }

    return _rangeElement;
}
