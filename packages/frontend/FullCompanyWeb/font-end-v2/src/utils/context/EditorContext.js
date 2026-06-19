import React, { useState, useContext, useReducer, useEffect, createContext, useCallback } from "react";
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const initialState = {};

const EditorContext = createContext({
    data: null,
    error: null,
    isLoading: null,
    selectedItem: null,
    tempItem: null,
    itemClick: () => {},
    editButtonClick: () => {},
    discardButtonClick: () => {},
    newButtonClick: () => {},
});
function Editor() {
    return (
        <div className="border border-blue-200">
            编辑器
            <input className="border border-black" />
        </div>
    );
}
function Display(selectedItem) {
    return (
        <div className="border border-blue-700">
            仅仅展示
            {JSON.stringify(selectedItem)}
        </div>
    );
}

function Toolbar({ onClick }) {
    const [canSave, setCanSave] = useState(false);
    const [showDiscardButton, setShowDiscardButton] = useState(false);
    const { data, selectedItem, tempItem, editButtonClick, discardButtonClick, newButtonClick } =
        useContext(EditorContext);

    //     useEffect(() => {
    //         if (selectedItem && tempItem) {
    //             if (JSON.stringify(selectedItem) !== JSON.stringify(tempItem)) {
    //                 setCanSave(true);
    //             }
    //             setCanSave(false);
    //         } else {
    //             setCanSave(false);
    //         }
    //     }, [selectedItem, tempItem]);

    return (
        <div className="border flex flex-row gap-2 border-green-500 p-1">
            <button className="border disabled:border-red-500" disabled={false} onClick={newButtonClick}>
                新建
            </button>

            <button
                className="border disabled:border-red-500"
                disabled={selectedItem === null}
                onClick={editButtonClick}
            >
                编辑
            </button>
            <button className="border disabled:border-red-500" disabled={selectedItem === null} onClick={onClick}>
                删除
            </button>
            <button className="border disabled:border-red-500" disabled={tempItem === null} onClick={onClick}>
                保存
            </button>
            <button className="border disabled:border-red-500" disabled={selectedItem === null} onClick={onClick}>
                复制
            </button>
            <button className="border disabled:border-red-500" onClick={discardButtonClick}>
                取消
            </button>
        </div>
    );
}

function List() {
    const { data, selectedItem, tempItem, itemClick } = useContext(EditorContext);

    return (
        <ul>
            {data.map((item, index) => {
                return (
                    <li key={index}>
                        <input
                            className=" disabled:cursor-not-allowed peer"
                            type="checkbox"
                            id={index}
                            disabled={tempItem !== null}
                            checked={JSON.stringify(selectedItem) === JSON.stringify(item)}
                            readOnly
                            onClick={(e) => itemClick(e, index)}
                        />
                        <label className=" peer-disabled:cursor-not-allowed" htmlFor={index}>{JSON.stringify(item)}</label>
                    </li>
                );
            })}
        </ul>
    );
}

function FormTest({ selectedItem, tempItem }) {
    return <div>{JSON.stringify(selectedItem)}</div>;
}

function Main() {
    // console.log("rander");
    const [url, setUrl] = useState(undefined);
    // const { data, error, isLoading } = useSWR( url?url:null , fetcher);
    const data = [
        { id: 1, content: 1 },
        { id: 2, content: 2 },
        { id: 3, content: 3 },
    ];
    const [selectedItem, setSelectedItem] = useState(null);
    const [tempItem, setTempItem] = useState(null);

    const itemClick = useCallback(
        (e, index) => {
            console.log("index:" + index);
            setSelectedItem(data[index]);
        },
        [data] // Add dependencies if needed
    );

    const newButtonClick = useCallback(
        () => {
            console.log("newButtonClick");
            // setSelectedItem(data[index]);
            setSelectedItem({ test: "test" });
        },
        [] // Add dependencies if needed
    );
    const discardButtonClick = () => {
        console.log("editButtonClick");
        setSelectedItem(null);
        setTempItem(null);
    };
    const editButtonClick = useCallback(
        () => {
            console.log("editButtonClick");
            // setSelectedItem(data[index]);
            setTempItem(selectedItem);
        },
        [selectedItem] // Add dependencies if needed
    );

    return (
        <EditorContext.Provider
            value={{ data, selectedItem, tempItem, itemClick, newButtonClick, editButtonClick, discardButtonClick }}
        >
            <button className="border border-blue-600 m-3" onClick={() => {}}>
                collection 1 :{Math.random()}
            </button>
            <button className="border border-blue-600 m-3" onClick={() => setUrl("")}>
                collection 2
            </button>
            <button className="border border-blue-600 m-3" onClick={() => setUrl("")}>
                collection 3
            </button>
            <div className="flex flex-row gap-2">
                <List data={data} onClick={itemClick} />
                <div className="flex flex-col gap-2">
                    <Toolbar onClick={() => {}} />
                    {selectedItem !== null ? (
                        tempItem !== undefined ? (
                            <Editor />
                        ) : (
                            <Display selectedItem={selectedItem} />
                        )
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </EditorContext.Provider>
    );
}

export { Main };
