import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import {
    CalendarContext,
    getYYYYMMDDString,
    CALENDER_CONTENT_TYPES,
    WEEK_SIMPLE_NAME,
    MONTH_FULL_NAME,
    getRelatedDate,
} from "context/CalendarContext.js";

export default function ContainerForSelectedDaysContent() {
    const { DaysRange, SelectedDateYYYYMMDDString, setSelectedDate, CalendarContentType } = useContext(CalendarContext);

    const selectedDate = getRelatedDate(CalendarContentType, SelectedDateYYYYMMDDString, DaysRange, true);

    return (
        <div className="flex-row">
            {selectedDate.map((d, index) => {
                return (
                    <div className="test-border" key={index}>
                        {dayjs(d).format("YYYY-MM-DD dddd")}
                    </div>
                );
            })}
        </div>
    );
}
