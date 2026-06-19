import { createContext, useMemo, useState, useEffect, useContext } from "react";
import { Request, refToFormData } from "../../../utils";
import { ModalContext } from "../../../utils";

const EditState = {
    undefined: "undefined",
    new: "new",
    selected: "selected",
    editing: "editing",
    notSaved: "notSaved",
    saving: "saving",
    deleting: "deleting",
    leaving:"leaving"
};

const EditBitState={
    STATE_HAVE_CONTENT:1,
    STATE_HAVE_UUID:2,
    STATE_MODIFIED:4,
    STATE_SAVED:8,
    STATE_EDITING:16,
};
const STATE_HAVE_CONTENT=1;
const STATE_HAVE_UUID=2;
const STATE_MODIFIED=4;
const STATE_SAVED=8;
const STATE_EDITING=16;





const BusinessCardContext = createContext({
    cards: null,
    getCards: () => {},
    isEdit: EditState.undefined, //* "selected" ,"new","editing","notSaved"
    setIsEdit: () => {},
    selectedCard: {},
    setSelectedCard: () => {},
    selectedUUID: null,
    setSelectedUUID: () => {},
    temp: null,
    setTemp: () => {},
    deleteCardByUUID: () => {},
    postNewCard: () => {},
    putUpdateCard: () => {},
    editBitState:null,
    setEditBitState:()=>{},
    // toggleState:()=>{}
});

const BusinessCardProvider = ({ children }) => {
    const [cards, setCards] = useState(null);
    const [selectedUUID, setSelectedUUID] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isEdit, setIsEdit] = useState(EditState.undefined);
    const [temp, setTemp] = useState(null);
    const [editBitState,setEditBitState]=useState(null);
    // const toggleState = (state) => {
    //     // 使用位运算进行状态切换
    //     // setEditBitState((prev) => prev ^ state); // 使用异或操作符切换状态
    //     setEditBitState( state); // 使用异或操作符切换状态
    //   };

    const { returnValue, setReturnValue, setContent, setVisible } = useContext(ModalContext);

    const ConfirmDeleteDialog = () => {
        return (
            <div className="w-[200px] flex flex-col gap-2">
                确定删除此联系人
                <div className="flex flex-row gap-4 self-end">
                    <button
                        className="border border-black px-1 rounded"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setReturnValue(true);
                            setVisible(false);
                            console.log("确定删除此联系人");
                        }}
                    >
                        确定
                    </button>
                    <button
                        className="border border-black px-1 rounded"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setReturnValue(false);
                            setVisible(false);
                            console.log("取消删除");
                        }}
                    >
                        取消
                    </button>
                </div>
            </div>
        );
    };
    const NotSaveDialog = () => {
        return (
            <div className="w-[200px] flex flex-col gap-2">
                还未保存!确定放弃修改?
                <div className="flex flex-row gap-4 self-end">
                    <button
                        className="border border-black px-1 rounded"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setReturnValue(true);
                            setVisible(false);
                            console.log("确定不保存");
                        }}
                    >
                        确定
                    </button>
                    <button
                        className="border border-black px-1 rounded"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setReturnValue(false);
                            setVisible(false);
                            console.log("取消");
                        }}
                    >
                        取消
                    </button>
                </div>
            </div>
        );
    };

    const getCards = async () => {
        console.log("getCards");
        try {
            Request.get("/businesscard").then((data) => {
                console.log("成功获取到了cards:");
                console.log(data);
                setCards(data);
            });
        } catch (error) {
            console.log("getCards :" + error);
        }
    };

    useEffect(() => {
        // !如果没有数据返回的是空数组[]
        getCards();
    }, []); // ! 提交完一个名片以后,从新从服务器加载

    const deleteCardByUUID = async (uuid) => {
        try {
            Request.delete("/businesscard", {
                params: {
                    uuid: uuid,
                },
                data: {
                    uuid: uuid,
                },
            })
                .then((res) => {
                    console.log("尝试删除UUID:" + uuid + "res:" + res);
                })
                .then(() => {
                    console.log("删除某个名片后,重新加载");
                    getCards();
                    setSelectedUUID(null);
                })
                .catch((err) => {
                    console.log("Request 的 err 处理部分");
                    console.log(err);
                });
        } catch (error) {
            console.log("deleteCardByUUID : " + error);
        }
    };

    const postNewCard = async (data) => {
        try {
            Request.post("/businesscard", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
                .then((res) => {
                    console.log("添加一个新的");
                    console.log(res);
                    if (res?.uuid) {
                        setSelectedUUID(res.uuid);
                    }
                })
                .then(() => {
                    console.log("新建某个名片后,重新加载");
                    getCards();
                });
        } catch (error) {
            console.log("postCard :" + error);
        }
    };

    const putUpdateCard = async (data) => {
        try {
            Request.put("/businesscard", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
                .then((res) => {
                    console.log("修改了一个名片");
                    console.log(res);
                })
                .then(() => {
                    console.log("修改某个名片后,重新加载");
                    getCards();
                });
        } catch (error) {
            console.log("postCard :" + error);
        }
    };

    // * 监听 选中的 UUID  来提供 select card
    useEffect(() => {
        // * 如果没有后端的cards 那不能选中 但是可以新建
        // * 可以选中 后 填充card 数据
        // * 当点击新建 需要给selectCard一个默认数据
        if (isEdit === EditState.new) {
            setSelectedCard({
                name: "",
                title: "",
                company_name: "",
                contact: [""],
                website: "",
                product: "",
                frontImg: "",
                backImg: "",
            });
            setSelectedUUID(null);
            setTemp({
                name: "",
                title: "",
                company_name: "",
                contact: [""],
                website: "",
                product: "",
                frontImg: "",
                backImg: "",
            });
        } else if (isEdit === EditState.selected) {
            if (typeof selectedUUID === "string" && Array.isArray(cards)) {
                console.log("表示为选中 ");

                const _card = cards.filter((c) => c.uuid === selectedUUID);
                if (_card[0]) {
                    setSelectedCard({ ..._card[0] });
                } else {
                    console.log(" 有问题检查下");
                }
            } else {
                console.log("有点奇怪");
            }
        } else if (isEdit === EditState.notSaved) {
            // setContent(<NotSaveDialog />);
            // setVisible(true);
            if (returnValue) {
                console.log("不保存,返回什么都不选中的状态");
                // setSelectedUUID(null);
            } else {
            }
        } else if (isEdit === EditState.deleting) {
            // setContent(<ConfirmDeleteDialog />);
            // setVisible(true);
            if (returnValue) {
                console.log("要删除");
                deleteCardByUUID(selectedUUID);
            } else {
                console.log("不删除");
            }
        } else if (isEdit === EditState.saving) {
            // refToFormData(formRefs,selectedCard);

            if (selectedUUID) {
                // 有UUID 表示要更新
                console.log("有UUID 表示要更新");

                // putUpdateCard({})
            } else {
                // 没有UUID 表示要新建
                console.log("没有UUID 表示要新建");
            }
            setIsEdit(EditState.selected);
        }
        else if (isEdit === EditState.leaving) {
            

            if (selectedUUID) {
                // 有UUID 表示要更新
                console.log("有UUID 表示要更新");

                // putUpdateCard({})
            } else {
                // 没有UUID 表示要新建
                console.log("没有UUID 表示要新建");
            }
            setIsEdit(EditState.selected);
        }else if (isEdit === EditState.undefined) {
            setSelectedUUID(null) 
            setSelectedCard(null)  
        }

    }, [isEdit, cards,setSelectedUUID,selectedUUID]);

    // useEffect(() => {
    //     setTemp(selectedCard);
    // }, [selectedCard]);

    // * 监听是否有修改
    useEffect(() => {
        console.log("监听temp变化:"+(JSON.stringify( temp)===JSON.stringify( selectedCard)?"相等":"不等"));
        // console.log("监听temp变化:"+ temp== selectedCard);
        if (temp !== null || temp !== undefined) {
            if (JSON.stringify(temp) === JSON.stringify(selectedCard)) {
                // setIsEdit(editing)
            } else {
                setIsEdit((preState) => {
                    if (preState === EditState.editing || preState === EditState.new ) {
                        return EditState.notSaved;
                    }else{
                        return preState;
                    }
                });
            }
        }
    }, [selectedCard, temp]);

    // useEffect(() => {
    //     // * 监听 UUID 来设置 selectedCard
    //     console.log( "* 监听 UUID 来设置 selectedCard");
    //     if ( selectedUUID ) {
    //         console.log("selectedUUID "+selectedUUID);
    //         const _card = cards.filter((c) => c.uuid === selectedUUID);
    //         if (_card[0]) {
    //             setSelectedCard({ ..._card[0] });
    //         }
    //     } else {
    //         setSelectedCard(null);
    //     }
    // }, [cards, selectedUUID,setSelectedCard]);

    return (
        <BusinessCardContext.Provider
            value={{
                cards: cards,
                getCards: getCards,
                isEdit: isEdit,
                setIsEdit: setIsEdit,
                selectedUUID: selectedUUID,
                setSelectedUUID: setSelectedUUID,
                selectedCard: selectedCard,
                setSelectedCard: setSelectedCard,
                deleteCardByUUID: deleteCardByUUID,
                postNewCard: postNewCard,
                putUpdateCard: putUpdateCard,
                temp: temp,
                setTemp: setTemp,
                editBitState:editBitState,
                setEditBitState:setEditBitState
                // toggleState:toggleState
            }}
        >
            {children}
        </BusinessCardContext.Provider>
    );
};

export { BusinessCardContext, BusinessCardProvider, EditState,EditBitState };
