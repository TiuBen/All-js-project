import React, { createContext, useContext, useState, useEffect } from "react";
import { Route, Outlet, useLocation } from "react-router-dom";

import { MiniCalendar, MonthLarge, RangeType } from "components";
import ShortCutsNav from "./LeftSide/ShortCutsNav";
import { useModal } from "utils";
import  TodoFormMini from '../FormPage/forms/TodoForm/TodoFormMini'


const cellRender = (current) => {
    // console.log("cellRender");
    return {
        "2024-01-03": <ul>{<div>ddddddd</div>}</ul>,
    };
};

const CalendarContext = createContext({ selectedDate: null, setSelectedDate: null });

const CalendarPage = () => {
    const location = useLocation();
    console.log(location);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { setModalVisible, setModalContent } = useModal();

    useEffect(() => {
        setModalContent(<TodoFormMini/>);

        return () => {
            setModalContent(<div></div>);
        };
    }, []);

    return (
        <CalendarContext.Provider
            value={{
                selectedDate: selectedDate,
                setSelectedDate: (x) => {
                    setSelectedDate(x);
                    console.log("ddddddddddddddd");
                },
            }}
        >
            <div className="flex flex-1 flex-row gap-1 ">
                <div className=" max-w-[250px] min-w-[250px] bg-neutral-100">
                    <MiniCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                    <ShortCutsNav />
                </div>
                <div className="flex-1 h-full flex flex-col">
                    <div className="flex flex-row gap-1">
                        <button>新事件</button>
                        <button>天</button>
                        <button>工作周</button>
                        <button>周</button>
                        <button>月</button>
                    </div>
                    <MonthLarge
                        rangeType={RangeType.FullMonth}
                        selectedDate={selectedDate}
                        onSectionClick={() => {
                            console.log("setModalVisible");
                            setModalVisible((x) => !x);
                        }}
                    />
                </div>
            </div>
        </CalendarContext.Provider>
    );
};

const CalendarPageRoute = () => {
    useEffect(() => {
        console.log("CalendarPage");
    }, []);

    return <Route path="calendar" element={<CalendarPage />} />;
};

export { CalendarPageRoute };
