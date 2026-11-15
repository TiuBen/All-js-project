/*
this it the way I want to use the month calender

<MonthCalender data={data} onDateButtonClick={onDateButtonClick} />


*/

import React, { useState, useEffect, useRef, useCallback } from "react";
import dayjs from "dayjs";

// 1. 封装一个通用的节流 Hook
function useThrottle(fn, delay) {
    const lastCall = useRef(0);
    const timer = useRef(null);

    return useCallback(
        (...args) => {
            const now = Date.now();
            const remaining = delay - (now - lastCall.current);

            if (remaining <= 0) {
                // 如果距离上次执行已经超过了 delay，立即执行
                if (timer.current) {
                    clearTimeout(timer.current);
                    timer.current = null;
                }
                lastCall.current = now;
                fn(...args);
            } else if (!timer.current) {
                // 如果还在冷却期内，且没有等待中的定时器，则设置一个定时器
                timer.current = setTimeout(() => {
                    lastCall.current = Date.now();
                    timer.current = null;
                    fn(...args);
                }, remaining);
            }
        },
        [fn, delay]
    );
}

function useCalendar(initialYear, initialMonth) {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month());

    const handleAddMonth = useCallback(() => {
        setMonth((prevMonth) => {
            if (prevMonth === 11) {
                // 跨年时，同时更新年份
                setYear((prevYear) => prevYear + 1);
                return 0;
            }
            return prevMonth + 1;
        });
    }, []);

    const handleSubMonth = useCallback(() => {
        setMonth((prevMonth) => {
            if (prevMonth === 0) {
                // 跨年时，同时更新年份
                setYear((prevYear) => prevYear - 1);
                return 11;
            }
            return prevMonth - 1;
        });
    }, []);

    // 3. 使用节流包装，假设限制为 300ms 内最多触发一次
    const addOneMonth = useThrottle(handleAddMonth, 800);
    const subOneMonth = useThrottle(handleSubMonth, 800);

    // 4. 组件卸载时清理可能存在的定时器（好习惯）
    useEffect(() => {
        return () => {
            // 如果需要清理，可以在这里处理，但简单的节流通常不需要
        };
    }, []);

    return { year, month, addOneMonth, subOneMonth };
}

export { useCalendar };
