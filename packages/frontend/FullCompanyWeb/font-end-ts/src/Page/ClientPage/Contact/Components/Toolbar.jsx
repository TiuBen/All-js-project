
export default function Toolbar({
    newButtonAvailable,
    newButtonClick,
    editButtonAvailable,
    editButtonClick,
    saveButtonAvailable,
    saveButtonClick,
    deleteButtonAvailable,
    deleteButtonClick,
    discardButtonClick,
}) {
    return (
        <div className="flex flex-row gap-2 self-start bg-zinc-50 rounded-lg shadow-md w-full p-2">
            <button
                className="flex items-center  gap-1   border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400 disabled:cursor-not-allowed"
                disabled={newButtonAvailable}
                onClick={newButtonClick}
            >
                <span className="material-symbols-outlined">add_box</span>
                新建
            </button>
            <div className="mx-2 border-l border-gray-300 h-auto"></div>
            <button
                className="flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={editButtonAvailable}
                onClick={editButtonClick}
            >
                <span className="material-symbols-outlined">edit_note</span>
                编辑
            </button>
            <button
                className="flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={saveButtonAvailable}
                onClick={saveButtonClick}
            >
                <span className="material-symbols-outlined">save</span>
                保存
            </button>
            {/* <button
                  className="flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                  disabled={!selectedItem}
              >
                  <span className="material-symbols-outlined">file_copy</span>
                  复制
              </button> */}
            <button
                className=" flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                disabled={deleteButtonAvailable}
                onClick={deleteButtonClick}
            >
                <span className="material-symbols-outlined">delete</span>
                删除
            </button>
            <div className="mx-2 border-l border-gray-300 h-auto"></div>
            <button
                className="  flex items-center gap-1 border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
                onClick={discardButtonClick}
            >
                <span className="material-symbols-outlined">reply_all</span>
                取消
            </button>
            <button
                onClick={editButtonClick}
                className="border border-blue-700 rounded px-2 py-1 text-blue-700 disabled:text-gray-700 disabled:border-gray-400"
            >
                外观切换
            </button>
        </div>
    );
}
