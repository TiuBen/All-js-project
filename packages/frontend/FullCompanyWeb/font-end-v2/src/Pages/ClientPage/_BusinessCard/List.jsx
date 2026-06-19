import React, { useContext } from "react";
import { BitBusinessCardContext } from "../Context/BitBusinessCardContext";
import { EditStateContext } from "../../../utils";

function List() {
    const { cards, selectedUUID, setSelectedUUID } = useContext(BitBusinessCardContext);
    const {
        isInit,
        isCreateNewOrSelect,
        isEditingOrNot,
        isContentChangedOrNot,
        isSavedOrNot,
        setIsInit,
        setIsCreateNewOrSelect,
        setIsEditingOrNot,
    } = useContext(EditStateContext);

    return (
        <div className="w-96 px-4 gap-4 flex flex-col bg-zinc-50 rounded-lg shadow-md text-lg self-start ">
            {/* <div className=" text-red-700">
                {`${isInit ? "初始化" : "非初始化"}`}
                <br />
                {`${isCreateNewOrSelect ? "新建一个" : "选择了一个"}`}
                <br />
                {`${isEditingOrNot ? "在编辑状态" : "不在编辑状态"}`}
                <br />
                {`${isContentChangedOrNot ? "内容没变化" : "内容变化了"}`}
                <br />
                {`${isSavedOrNot ? "保存了" : "还没保存"}`}
            </div> */}
            <button
                className=" rounded-md flex flex-row  justify-center border-blue-600 text-blue-700 "
                onClick={(e) => {
                    e.preventDefault();
                    console.log("新建一个名片");
                    setIsInit(false);
                    setIsCreateNewOrSelect(true);
                    setIsEditingOrNot(true)
                }}
                // disabled={(editBitState&)}
            >
                <span className="material-symbols-outlined  font-light  mx-2">add_circle</span>新建
            </button>

            {cards && cards.length > 0 ? (
                <ul className="flex flex-col gap-1 ">
                    {cards.map((p, index) => {
                        return (
                            <div
                                key={p.uuid}
                                className=" flex flex-row justify-start px-2 hover:border hover:bg-zinc-300 items-center relative border rounded-lg  bg-zinc-50"
                            >
                                <input
                                    id={"sss" + index}
                                    type="radio"
                                    // name="options"
                                    // key={"input"+ p.uuid}
                                    className="disabled:text-slate-500 disabled:cursor-not-allowed peer"
                                    onClick={(e) => {
                                        console.log("选中的名片的:" + p.uuid);
                                        setSelectedUUID(p.uuid);
                                        setIsInit(false);
                                        setIsCreateNewOrSelect(false);
                                        setIsEditingOrNot(false);
                                    }}
                                    readOnly
                                    checked={p.uuid === selectedUUID}
                                    disabled={isEditingOrNot}
                                />
                                <label
                                    htmlFor={"sss" + index}
                                    className="mx-2 flex flex-row flex-1 items-center justify-between peer-checked:text-blue-600 peer-disabled:text-slate-500 peer-disabled:cursor-not-allowed "
                                >
                                    <span className="text-xl font-semibold">{p?.name}</span>
                                    <span className="text-sm">{p?.company_name}</span>
                                </label>
                            </div>
                        );
                    })}
                </ul>
            ) : (
                <div>暂时没有名片信息</div>
            )}
            <div className="whitespace-pre-line">{selectedUUID}</div>
        </div>
    );
}

export default List;
