import React, { useState, useContext, useReducer, useCallback, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Request } from "../../../utils/index";
import List from "./Components/List";
import Toolbar from "./Components/Toolbar";
import Editor from "./Components/Editor";
import Display from "./Components/Display";

const fetcher = (url) => Request.get(url).then((res) => res);

function Contact() {
    const { data, error, isLoading } = useSWR("/businesscard", fetcher);
    const { mutate } = useSWRConfig();
    const [selectedItem, setSelectedItem] = useState(null);
    const [returnValue, setFormReturnValue] = useState(null);
    const [editorState, setEditorState] = useState(null);

    const saveButtonClick = useCallback(() => {
        console.log(returnValue);
        // if (selectedItem?.uuid) {
        //     Request.patch("/businesscard", returnValue)
        //         .then((res) => {
        //             console.log(res);
        //         })
        //         .catch((err) => {
        //             window.alert(err);
        //         });
        // } else {
        //     Request.post("/businesscard", returnValue)
        //         .then((res) => {
        //             console.log(res);
        //         })
        //         .catch((err) => {
        //             window.alert(err);
        //         });
        // }
    }, [returnValue]);

    const deleteButtonClick = useCallback(() => {
        const deleteItem = async () => {
            if (selectedItem?.uuid) {
                if (window.confirm("确定删除此名片?")) {
                    await Request.delete(`/businesscard?id=${selectedItem.uuid}`)
                        .then((res) => {
                            console.log(res);
                        })
                        .catch((err) => {
                            window.alert(err);
                        });
                    mutate("/businesscard");
                    setTimeout(() => {
                        setSelectedItem(null);
                    }, 300);
                }
            } else {
                window.alert("没有UUID 删除失败!");
            }
        };
        deleteItem();
        // setNeedRefetch(true)
    }, [selectedItem, mutate]);

    const editButtonClick = useCallback(() => {
        setEditorState('editing');
    }, [setEditorState]);

    const discardButtonClick = useCallback(() => {
        if (editorState==="editing") {
            if (window.confirm("还未保存,就直接离开?")) {
                setSelectedItem(null);
                setEditorState(null)
            }
        } else {
            setSelectedItem(null);
            setEditorState(null)
        }
    }, [editorState]);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;

    let ele = undefined;
    if (editorState==='editing') {
        ele = (
            <Editor initValue={selectedItem} setFormReturnValue={setFormReturnValue} setEditorState={setEditorState} />
        );
    } else if (editorState === null) {
        ele = <></>;
    } else {
        ele = <Display item={selectedItem} />;
    }

    return (
        <div className="flex flex-row gap-2">
            <List
                data={data}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                setEditorState={setEditorState}
            />
            <div className="flex flex-col flex-1 gap-2">
                <Toolbar
                    newButtonAvailable={!(editorState!=="editing")}
                    newButtonClick={() => {
                        setSelectedItem({});
                        setEditorState('editing')
                    }}
                    editButtonAvailable={selectedItem?.uuid === undefined}
                    editButtonClick={editButtonClick}
                    saveButtonAvailable={(editorState==='select') || (JSON.stringify(selectedItem) === JSON.stringify(returnValue))}
                    saveButtonClick={saveButtonClick}
                    deleteButtonAvailable={!selectedItem?.uuid}
                    deleteButtonClick={deleteButtonClick}
                    discardButtonClick={discardButtonClick}
                />
                {ele}
            </div>
        </div>
    );
}

export { Contact };
