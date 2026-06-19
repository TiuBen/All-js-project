import { createContext } from "react";

const TodoContext = createContext({
    TempTodo: {
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
        reminderType: "",
        tags: [],
        isComplete: false,
        isDelete: false,
    },
    SetTempTodo: null,
    TodoList: [
        {
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
            reminderType: "",
            tags: [],
            isComplete: false,
            isDelete: false,
        },
    ],
    SetTodoList: null,
    TodoType: "SMALL",
    SetTodoType: () => {},
});

export { TodoContext };
