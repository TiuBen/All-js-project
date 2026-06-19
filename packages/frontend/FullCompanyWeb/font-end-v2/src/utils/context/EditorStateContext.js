import React, { useEffect, createContext, useState, useRef, useContext } from "react";
import { DataContext } from "./DataContext";
import { Request } from "../index";
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const EditorStateContext = createContext({
    isInitOrNot: null, // firstInit needReload
    isSelectItemOrCreateNew: null, // selectedItem newItem
    isInEditingState: null, // isEditing
    isValueChangedOrNot: false, //
    isValueSavedOrNot: null, // isSaving saved
    tempData: null,
    setTempData: () => {},
    setIsSelectItemOrCreateNew:()=>{},
    setIsValueSavedOrNot:()=>{}
});

function EditorStateContextProvider({ children }) {
    const { url, setDataArray, selectedData, tempData,setSelectedItem } = useContext(DataContext);
    const [isInitOrNot, setIsInitOrNot] = useState(null); // firstInit needReload
    const [isSelectItemOrCreateNew, setIsSelectItemOrCreateNew] = useState(null); //!AUTO selectedItem newItem
    //!需要暴露出去 isEditing 要配合isValueChanged 使用感觉也可以配合isSaved使用
    //!相当于一个锁定键 
    const [isInEditingState, setIsInEditingState] = useState(); 
    const [isValueChangedOrNot, setIsValueChangedOrNot] = useState(); //!AUTO
    const [isValueSavedOrNot, setIsValueSavedOrNot] = useState(); //!需要暴露出去  isSaving saved deleting 

    // 有条件的请求
    const { data, error, isLoading } = useSWR(isInitOrNot === null ? url : null, fetcher);

    //* 通过监听选中的数据是否有uuid 来判断 是选中一个 还是 新建的
    useEffect(() => {
        if (selectedData) {
            if (selectedData?.uuid || selectedData?.id) {
                setIsSelectItemOrCreateNew("selectedItem");
            } else {
                setIsSelectItemOrCreateNew("newItem");
            }
        } else {
            setIsSelectItemOrCreateNew(null);
        }
    }, [setIsSelectItemOrCreateNew, selectedData]);

    //* 通过监听 数据变化来判断 isValueChangedOrNot
    useEffect(() => {
        if (selectedData || tempData) {
            // !确保有数据
            if (JSON.stringify(selectedData) === JSON.stringify(tempData)) {
                setIsValueChangedOrNot("notChanged");
            } else {
                setIsValueChangedOrNot("changed");
            }
        } else {
            setIsValueChangedOrNot(false);
        }
    }, [setIsValueChangedOrNot, selectedData, tempData]);

    //* 通过监听 save 的状态 来 实现 Data 的get  put delete post
    useEffect(() => {
        if (isValueSavedOrNot === "needSave") {
            if (isSelectItemOrCreateNew === "selectedItem") {
                Request.put(url, tempData).then((res) => {
                    setIsInitOrNot("needReload");
                });
            } else if (isSelectItemOrCreateNew === "newItem") {
                Request.post(url, tempData).then((res) => {
                    setIsInitOrNot("needReload");
                });
            } else {
                console.log("something wrong");
            }
        } else if (isValueSavedOrNot === "needDelete") {
            Request.delete(url, tempData).then((res) => {
                setIsInitOrNot("needReload");
            });
        } else {
          setIsInitOrNot(null);
        }

    }, [isValueSavedOrNot, isSelectItemOrCreateNew,setIsInitOrNot]);


    //* 监听是否为初始化过程
    useEffect(()=>{
      if (isInitOrNot) {// 表示为刚初始化
        setIsSelectItemOrCreateNew(null);// 什么都没选中
        setIsInEditingState(false);// 表示没进入编辑状态
        setIsValueChangedOrNot(false)// 表示值没有变化
        setIsValueSavedOrNot(null) // 表示不需要进入 存储过程
      } else if(isInitOrNot==="needReload") {
        setIsSelectItemOrCreateNew("selectedItem");// !如果是新建后存储,是需要表示为 选中的
        setIsInEditingState(false);// 表示没进入编辑状态
        setIsValueChangedOrNot(false)// 表示值没有变化
        setIsValueSavedOrNot(null) // 表示不需要进入 存储过程
      }

    },[isInitOrNot])


    return <EditorStateContext.Provider value={{}}>{children}</EditorStateContext.Provider>;
}

export { EditorStateContext, EditorStateContextProvider };
