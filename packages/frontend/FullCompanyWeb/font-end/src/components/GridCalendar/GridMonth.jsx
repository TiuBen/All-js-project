import React,{useEffect} from "react";
import * as dayjs from 'dayjs';

import "./GridMonth.css";

export default function GridMonth(props) {
    const {year,month,isInYear}=props;
     //
     console.log("Month: " + new Date(year, month, 1).toLocaleDateString());
     // 当月有多少天
     const daysCountOfThisMonth = new Date(year, month + 1, 0).getDate();
     console.log("daysCountOfThisMonth: " + daysCountOfThisMonth);
     // 当月第一天是星期几
     const theDayOfThisMonthFirstDay = new Date(year, month, 1).getDay();
     console.log("这个月的第一天是星期"+theDayOfThisMonthFirstDay);


     const daysItems = [];
     let lightOrDark = "Dark";
 
     for (let x = 1; x <= 42; x++) {
         lightOrDark = "Dark";
         if (new Date(year, month, -theDayOfThisMonthFirstDay + x).getMonth() !== month) {
             lightOrDark = "light";
         }
 
         const day = new Date(year, month, -theDayOfThisMonthFirstDay + x).getDate();
         const yyyymmdd = new Date(year, month, -theDayOfThisMonthFirstDay + x).toDateString();
 
         daysItems.push(
             <div className={lightOrDark} key={x}>
                 {day}
             </div>
         );
     }

    return (
        <div className={isInYear?"grid-month-container":'grid-month-container-in-month'}>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}一</div>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}二</div>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}三</div>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}四</div>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}五</div>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}六</div>
            <div className='text-center text-strong'>{isInYear===true?'':'周'}日</div>
            {daysItems.map((i,index) => {
                return <div key={year+'-'+month+'-'+index} className='text-center better-text-font'>{i}</div>;
            })}
        </div>
    );
}
