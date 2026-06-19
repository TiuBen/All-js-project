import React, { useContext, useEffect, useState } from "react";
import { EditStateContext } from "../../../utils";
function Toolbar() {
    const {
        isCreateNewOrSelect,
        isEditingOrNot,
        setIsEditingOrNot,
        isInit,
        setIsInit,
        isContentChangedOrNot,
        setIsSavedOrNot,
    } = useContext(EditStateContext);

    return (
        <div className="flex flex-row gap-2 self-start">
            {isCreateNewOrSelect || isEditingOrNot ? (
                <></>
            ) : (
                <button
                    className=" px-[1rem] py-1 border  rounded-md flex flex-row  justify-center border-blue-600 text-blue-700 disabled:border-none disabled:text-slate-500 disabled:cursor-not-allowed"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsEditingOrNot(true);
                    }}
                >
                    编辑联系人
                </button>
            )}
            {isCreateNewOrSelect || isEditingOrNot ? (
                <></>
            ) : (
                <>
                    <button
                        className="px-[1rem] py-1 border  rounded-md flex flex-row  justify-center border-blue-600 text-blue-700 disabled:border-none disabled:text-slate-500 disabled:cursor-not-allowed	"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsSavedOrNot("deleting");
                        }}
                    >
                        <span className="material-symbols-outlined font-light mx-2">delete_forever</span>删除
                    </button>
                </>
            )}
            {!isEditingOrNot ? (
                <></>
            ) : (
                <>
                    <button
                        type="submit"
                        className="px-[1rem] py-1 border  rounded-md flex flex-row  justify-center border-blue-600 text-blue-700 disabled:border-none disabled:text-slate-500 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("cardContent");
                            setIsSavedOrNot("needSave");
                        }}
                        disabled={!isContentChangedOrNot}
                    >
                        保存
                    </button>
                </>
            )}

            {!isInit ? (
                <>
                    <button
                        type="reset"
                        className=" px-[1rem] py-1 border  rounded-md flex flex-row  justify-center border-blue-600 text-blue-700 disabled:border-none disabled:text-slate-500 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            e.preventDefault();
                            if (isContentChangedOrNot) {
                                if (window.confirm("还未保存修改的内容,是否直接退出?")) {
                                    setIsInit(true);
                                }
                            } else {
                                setIsInit(true);
                            }
                        }}
                    >
                        取消
                    </button>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}

export default Toolbar;
