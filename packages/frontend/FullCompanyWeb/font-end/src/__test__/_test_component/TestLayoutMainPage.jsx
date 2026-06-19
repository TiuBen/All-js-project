import React, { useContext, useEffect, useState } from "react";
import { MainPage, TopBanner, LeftBanner, Anchor } from "../../layouts/index.js";
import { MsCalendar } from "../../components/MSCalendar/index.js";
import { MsTodo } from "../../components/MsTodo/index.js";
import { mockTodo } from "data/index.js";
import { TodoContext, AnchorContext, getPosition } from "context/index.js";
import { Outlet } from "react-router-dom";


function TestLayoutMainPage(){
    const [tempTodo, setTempTodo] = useState( {
        id: "",
        author: "",
        createdAt: "Mon Apr 26 06:01:55 +0000 2015",
        title: "Fake todo Title",
        content: "",
        users: "",
        isPrivate: false,
        startTime: "",
        endTime: "",
        duration: "",
        needResponse: "",
        response: "",
        reminderType: true,
        tags: [],
        isComplete: false,
        isDelete: false,
    });
    const [todoList, setTodoList] = useState([]);
    const [todoType, setTodoType] = useState("LITTLE"); //little,middle,large

    const [anchorStyle, setAnchorStyle] = useState({
        position: "TOP",
        anchorSize:15,
        color:'red',
        x: "20px",
        y: "40px",
        width: 400,
        height: 260,
        display: false,// none block modal
    }); 
 
    useEffect(() => {
        setTodoList(mockTodo());
    }, []);


    return (
        <AnchorContext.Provider
            value={{
                AnchorStyle: anchorStyle,
                SetAnchorStyle: setAnchorStyle,
            }}
        >
            <TodoContext.Provider
                value={{
                    TempTodo: tempTodo,
                    SetTempTodo: setTempTodo,
                    TodoList: todoList,
                    SetTodoList: setTodoList,
                    TodoType: todoType,
                    SetTodoType: setTodoType,
                }}
            >
                <MainPage
                    top={<TopBanner />}
                    left={<LeftBanner />}
                    main={<MsCalendar />}
                    anchor={<MsTodo todo={tempTodo} setTodo={setTempTodo} editorType={todoType} saveTodo={null}/>}
                    footer={<div className="test-border">footer</div>}
                />
            </TodoContext.Provider>
        </AnchorContext.Provider>
    );
}

export { TestLayoutMainPage };
