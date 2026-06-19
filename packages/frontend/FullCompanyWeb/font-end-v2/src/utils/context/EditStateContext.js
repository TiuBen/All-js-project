import { createContext, useState } from "react";

const EditStateContext = createContext({
    isInit: null, // 显色编辑展示框 或者只有 列表
    isCreateNewOrSelect: null, // 选了一个已有项 还是新建
    isEditingOrNot: null, // 是否进入了编辑状态
    isContentChangedOrNot: null, // 内容是否修改了
    isSavedOrNot: null, // 是否保存了
    setIsInit: () => {}, // Set to null
    setIsCreateNewOrSelect: () => {}, // Set to null
    setIsEditingOrNot: () => {}, // Set to null
    setIsContentChangedOrNot: () => {}, // Set to null
    setIsSavedOrNot: () => {}, // Set to null
    setAllInit:()=>{},
    triggerToSave:()=>{},// 用来激活保存函数
    
});

const EditStateProvider = ({ children }) => {
    const [isInit, setIsInit] = useState(true);
    const [isCreateNewOrSelect, setIsCreateNewOrSelect] = useState(null);
    const [isEditingOrNot, setIsEditingOrNot] = useState(null);
    const [isContentChangedOrNot, setIsContentChangedOrNot] = useState(false);
    const [isSavedOrNot, setIsSavedOrNot] = useState(null);

    const setAllInit=()=>{
        // setIsInit(true);
        setIsCreateNewOrSelect(null);
        setIsEditingOrNot(false);
        setIsContentChangedOrNot(false);
        setIsSavedOrNot(null);
    }
    const triggerToSave=(fun)=>{
        fun()


        
    }

    return (
        <EditStateContext.Provider
            value={{
                isInit: isInit, // 显色编辑展示框 或者只有 列表
                isCreateNewOrSelect: isCreateNewOrSelect, // 选了一个已有项 还是新建
                isEditingOrNot: isEditingOrNot, // 是否进入了编辑状态
                isContentChangedOrNot: isContentChangedOrNot, // 内容是否修改了
                isSavedOrNot: isSavedOrNot, // 是否保存了
                setIsInit:setIsInit, // Set to null
                setIsCreateNewOrSelect: setIsCreateNewOrSelect, // Set to null
                setIsEditingOrNot: setIsEditingOrNot, // Set to null
                setIsContentChangedOrNot: setIsContentChangedOrNot, // Set to null
                setIsSavedOrNot: setIsSavedOrNot, // Set to null
                setAllInit:setAllInit,
                triggerToSave:triggerToSave
            }}
        >
            {children}
        </EditStateContext.Provider>
    );
};

export { EditStateContext, EditStateProvider };
