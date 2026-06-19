import React, { useState } from "react";
import "./MsTodo.scss";

function LargeMsTodo(props) {
    const [todo, setTodo] =props;

    const changeValue = (e) => {
        setTodo({ ...todo, [e.target.name]: e.target.value });
    };

    return (
        <div className="ms-todo test-border">
            <div className="ms-title-bar" style={{ backgroundColor: "red" }}>
                <span>{"title"}</span>
                <div className="button-group">
                    <span class="material-symbols-outlined">close</span>
                </div>
            </div>
            <div className="ms-menu-bar">
                <button className="ms-vertical-button">
                    <span class="material-symbols-outlined">edit_square</span>
                    编辑
                </button>
                <button className="ms-vertical-button">
                    <span class="material-symbols-outlined">delete</span>
                    删除
                </button>
                <button>答复选项</button>
                <button>空闲</button>
                <button>提醒</button>
                <button>分类</button>
                <button>私人</button>
            </div>
            <div className="ms-editor-panel">
                <div className="row save-bar">
                    <button>保存</button>
                </div>
                <div className="ms-editor-main">
                    <span class="material-symbols-outlined">app_registration</span>
                    <input
                        type="text"
                        placeholder="标题"
                        name="title"
                        value={todo.title}
                        onChange={(e) => changeValue(e)}
                    />
                    <span class="material-symbols-outlined">group_add</span>
                    <input type="text" placeholder="参与人员" />
                    <span class="material-symbols-outlined">schedule</span>
                    <div className="flex-col">
                        <input type="text" placeholder="开始时间" />
                        <input type="text" placeholder="结束时间" />
                    </div>
                    <span class="material-symbols-outlined">location_on</span>
                    <input type="text" placeholder="地点" />
                    <span class="material-symbols-outlined">notifications_active</span>
                    <input type="text" placeholder="提醒我" />
                    <span class="material-symbols-outlined">description</span>
                    <textarea />
                </div>
            </div>
        </div>
    );
}

export { LargeMsTodo };
