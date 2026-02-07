/*
this it the way I want to use the month calender

<MonthCalender data={data} onDateButtonClick={onDateButtonClick} />


*/

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";


 function useCalendar(initialYear = 2025, initialMonth = 1) {
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() );

  const addOneMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const subOneMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  return { year, month, addOneMonth, subOneMonth };
}



export  {useCalendar};
