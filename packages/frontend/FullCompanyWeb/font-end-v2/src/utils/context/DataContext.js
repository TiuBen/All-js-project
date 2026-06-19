import React, { useEffect, createContext, useState, useRef } from "react";
import useSWR from "swr";
import { Request } from "../tools/axiosHelper";

const DataState={
    "NULL":"NULL",
    'DISPLAY':"DISPLAY",
    "EDIT_NotChanged":"EDIT_NotChanged",
    "EDIT_Changed":"EDIT_Changed"
}

const DataContext = createContext({
    data:null,
    error:null,
    isLoading :null,
    // url:null,
    // setUrl:()=>{},
    selectedItem:null,
    tempData:null,
    setSelectedItem:()=>{},
    setTempData:()=>{},
    editorState:null,
    setEditorState:()=>{},
    setFormReturnValue:()=>{},
    
});

const fetcher = url => Request.get(url).then(res=>res);

function DataContextProvider({ url,children }) {
    const [shouldFetch,setShouldFetch ]=useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [tempData, setTempData] = useState(null);
    const [editorState, setEditorState] = useState(null);
    const [formReturnValue, setFormReturnValue] = useState(null);

    const { data, error, isLoading  } = useSWR(shouldFetch?url:null, fetcher);


    //! 想想怎么处理 增 删 修 后的同步问题
    // useEffect(() => {
    //     // * 监听 UUID 来设置 selectedCard
    //     console.log("* 监听 UUID 来设置 selectedCard");
    //     if (selectedItem?.uuid) {
    //         console.log("selectedUUID: " + selectedItem);
    //         const _card = data.filter((c) => c.uuid === selectedItem.uuid);
    //         if (_card[0]) {
    //             setSelectedItem({ ..._card[0] });
    //         }
    //     } else {
    //         setSelectedItem(null);
    //     }
    // }, [data, selectedItem]);

    useEffect(()=>{
        console.log(url);
        if (url) {
            setShouldFetch(true);
            
        }else{
            setShouldFetch(false);
        }
    },[url])


    return (
        <DataContext.Provider
            value={{
                data,
                error,
                isLoading ,
                selectedItem,
                tempData,
                setSelectedItem,
                setTempData,
                editorState,
                setEditorState,
                setFormReturnValue
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export {DataState, DataContext, DataContextProvider };
