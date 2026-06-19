import React from "react";
// import { Input, DatePicker } from "../MsComponent/index";
import "./MsTodo.scss";




function MiddleMsTodo(props) {
    const { todo, setTodo, setEditorType, isEdit } = props;
    return (
        <div className="ms-todo ms-middle-todo">
            <div className="ms-title-bar">
                <div>日历</div>
                <button role="放大">
                    <span class="material-symbols-outlined">expand_content</span>
                </button>
            </div>
            <div className="flex-row">
                <button className="border">
                    <span class="material-symbols-outlined">save</span>保存
                </button>
                <button className="border">
                    <span class="material-symbols-outlined">delete_forever</span>放弃
                </button>
            </div>
            <div>
                <div className="ms-editor-main">
                    <span class="material-symbols-outlined">interests</span>
                    <input
                        type="text"
                        placeholder="biaoti"
                        name="title"
                        value={todo.title}
                        onChange={(e) => {
                            setTodo({ ...todo, [e.target.name]: e.target.value });
                        }}
                    />
                    <span class="material-symbols-outlined">event</span>
                    <div className="flex-row" role="开始时间">
                        <input
                           type="datetime-local"
                            id="startTime"
                            name="startTime"
                            value={todo.startTime}
                            onChange={(e) => {
                                console.log(e.target.value);
                                setTodo({ ...todo, [e.target.name]: e.target.value });
                            }}
                        />
                        <div>
                            <input type='checkbox' className="switch-button" name='reminderType' checked={todo.reminderType} onChange={(e) => {
                            setTodo({ ...todo, [e.target.name]: e.target.checked });
                        }}/><label for="switch">Toggle</label>
                        </div>
                    </div>
                   <span class="material-symbols-outlined">event_available</span>
                    <div className="flex-row" role="结束时间">
                        <input
                            type="datetime-local"
                            id="endTime"
                            name="endTime"
                            value={todo.endTime}
                            onChange={(e) => {
                                console.log(e.target.value);
                                setTodo({ ...todo, [e.target.name]: e.target.value });
                            }}
                        />
                    </div>

                    <span role="占位符" />
                    <select name="repeat">
                        <option value="">
                            <span class="material-symbols-outlined">repeat</span>
                            不重复
                        </option>
                        <option value="every1Day">每天一次</option>
                        <option value="every2Day">每两天一次</option>
                        <option value="selfDefineDay">自定义</option>
                    </select>

                    <span class="material-symbols-outlined">location_on</span>
                    <input type="text" placeholder="地点" />
                    <span class="material-symbols-outlined">quick_reference</span>
                    <input type="text" placeholder="添加描述" />
                </div>
            </div>
            <a style={{}}>更多选项</a>
        </div>
    );
}

export { MiddleMsTodo };
