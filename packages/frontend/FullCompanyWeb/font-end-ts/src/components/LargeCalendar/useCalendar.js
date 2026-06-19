import React, { createContext, useContext, useState } from 'react';

// // Create a context to hold the selected date
const CalendarContext = createContext({
      selectedDate: null,
      setSelectedDate: () => {
            console.log("const CalendarContext = createContext" );

      }
});

// Custom hook to use the selected date
export const useCalendar = () => useContext(CalendarContext);


// export const useCalendar = () => {
//     const [selectedDate, setSelectedDate] = useState(null);

//     const selectDate = (date) => {
//         setSelectedDate(date);
//     };

//     // Additional functions for managing the calendar can be added here

//     return {
//         selectedDate,
//         selectDate,
//         // Other properties or functions related to the calendar can be returned here
//     };
// };


// usecon