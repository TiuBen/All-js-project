import React, { useState, useEffect, useContext } from "react";
import { LittleMsTodo } from "./LittleMsTodo";
import { MiddleMsTodo } from "./MiddleMsTodo";
import { LargeMsTodo } from "./LargeMsTodo";
import "./MsTodo.scss";
import { TodoContext } from "../../../context/index.js";
import PropTypes from "prop-types";
import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json())






function MsTodo(props) {
    const { editorType } = props;

    // const [editorType, setEditorType] = useState("LITTLE");
    const [isEdit, setIsEditor] = useState(false);
    const [todo, setTodo] = useState(null);

    const { TempTodo, SetTempTodo, TodoList, SetTodoList, TodoType, SetTodoType } = useContext(TodoContext);

    var todoElement;
    switch (editorType) {
        case "LITTLE":
            todoElement = <LittleMsTodo todo={TempTodo} setTodo={SetTempTodo} isEdit={isEdit} setEditorType={SetTodoType} />;
            break;
        case "MIDDLE":
            todoElement = <MiddleMsTodo todo={TempTodo} setTodo={SetTempTodo} setEditorType={SetTodoType} />;
            break;
        case "LARGE":
            todoElement = <LargeMsTodo todo={TempTodo} setTodo={SetTempTodo} />;
            break;
        default:
            todoElement = (
                <div className="test-border">
                    <h2 style={{ color: "red" }}>测试 </h2>
                    <LittleMsTodo todo={null} />
                    <MiddleMsTodo todo={null} />
                    <LargeMsTodo />
                </div>
            );
            break;
    }

    return (
        <div
            style={{
                position: "relative",
                backgroundColor: "whitesmoke",
                display: "flex",
                flexGrow: "1",
            }}
        >
            {todoElement}
        </div>
    );
}
MsTodo.propTypes = {
    isVisible: PropTypes.bool,
    editorType: PropTypes.oneOf(["LITTLE", "MIDDLE", "LARGE"]),
};

export { MsTodo };
