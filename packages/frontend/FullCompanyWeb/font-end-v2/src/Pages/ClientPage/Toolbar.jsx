import { useContext } from "react";
import { Request } from "../../utils";
import { DataState, DataContext } from "../../utils/context/DataContext";

function Toolbar({url}) {
    const { setTempData, tempData, selectedItem, setSelectedItem, editorState, setEditorState } =
        useContext(DataContext);

    //* 新建按钮点击
    const newButtonClick = () => {
        setTempData({});
    };
    //* 修改按钮点击
    const modiButtonClick=()=>{
        if (selectedItem) {
            setTempData(selectedItem);
        }else{
            window.alert("请先选中一个后再进行修改!");
        }
    }
    //* 保存按钮点击
    const saveButtonClick=()=>{
        // ! 这里其实最复杂了
        // 如果是修改 保存后 展示修改的内容
        // 如果是新建 保存后 展示新建的内容
    } 
    //* 删除按钮点击
    const deleteButtonClick=()=>{
        if ( window.confirm("确定删除此条目!")) {
            //* 确定删除
            if (selectedItem) {
                Request.delete(url,{data:selectedItem}).then((res)=>{
                    if (res) {
                        
                    }
                })
            } else {
                window.alert("没有任何选中条目,删除失败!")
                
            }
        } else {
            
        }
       
    }

    //* 取消按钮点击 
    const discardButtonClick=()=>{
        if (editorState===DataState.EDIT_Changed) {
            if(window.confirm("数据已经改变了,但是还未保存,是否直接离开?")){
                setSelectedItem(null);
                setEditorState(null);
            }
        } else {
            
        }
    }


    return (
        <div className="flex flex-row gap-2 self-start bg-zinc-50 rounded-lg shadow-md w-full p-2">
            <button
                className="flex items-center  gap-1   border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
                onClick={newButtonClick}
                disabled={tempData}
            >
                <span class="material-symbols-outlined">add_box</span>
                新建
            </button>
            <button
                className="flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={!selectedItem}
                onClick={modiButtonClick}
            >
                <span class="material-symbols-outlined">edit_note</span>
                编辑
            </button>
            <button
                className="flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={editorState !== DataState.EDIT_Changed}
                onClick={saveButtonClick}
            >
                <span class="material-symbols-outlined">save</span>
                保存
            </button>
            {/* <button
                className="flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={!selectedItem}
            >
                <span class="material-symbols-outlined">file_copy</span>
                复制
            </button> */}
            <button
                className=" flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={!selectedItem}
                onClick={deleteButtonClick}
            >
                <span class="material-symbols-outlined">delete</span>
                删除
            </button>
            <button
                className="  flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                onClick={() => {
                    if (editorState === "EDITOR") {
                        if (window.confirm("还未保存,确定离开?")) {
                            setSelectedItem(null);
                            setTempData(null);
                            setEditorState(null);
                        } else {
                        }
                    } else {
                        setSelectedItem(null);
                        setTempData(null);
                        setEditorState(null);
                    }
                }}
            >
                <span class="material-symbols-outlined">reply_all</span>
                取消
            </button>
            {/* <button className="border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400">
                外观切换
            </button> */}
        </div>
    );
}

export default Toolbar;
