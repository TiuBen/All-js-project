import DatePicker from "components/MsComponent/DatePicker";
import "./MsTodo.scss";

function LittleMsTodo(props) {
    const { todo={}, setTodo, isEdit } = props;

    const changeValue = (e) => {
        setTodo({ ...todo, [e.target.name]: e.target.value });
    };
    return (
        <div id="little-todo-0" className="ms-todo ms-little-todo">
            <div className="ms-title-bar">
                <div>日历</div>
                <button role="放大">
                    <span class="material-symbols-outlined">expand_content</span>
                </button>
            </div>
            <div className="ms-editor-main">
                <span role="占位符" />
                <input type="text"  placeholder="biaoti" name="title" onChange={e=>changeValue(e)} value={todo?.title}/> 
                <span class="material-symbols-outlined">schedule</span>
                <div className="flex-row">
                    <input type="text"  placeholder="时间" name="startTime" value={todo.startTime}/>
                    {/* <DatePicker /> */}
                </div>
                <span role="占位符" />
                <div className="flex-row">
                    <button className="border">
                        <span class="material-symbols-outlined">edit</span>
                        编辑
                    </button>
                    <button className="border">
                        <span class="material-symbols-outlined">delete</span>删除
                    </button>
                </div>
            </div>
        </div>
    );
}

export { LittleMsTodo };
