import { createContext, useMemo, useState, useEffect, useContext } from "react";
import { Request, refToFormData } from "../../../utils";
import { tempFormContentToFormData, EditStateContext } from "../../../utils";

const BitBusinessCardContext = createContext({
    cards: null,
    getCards: () => {},
    selectedCard: {},
    setSelectedCard: () => {},
    selectedUUID: null,
    setSelectedUUID: () => {},
    temp: null,
    setTemp: () => {},
    deleteCardByUUID: () => {},
    postNewCard: () => {},
    putUpdateCard: () => {},
});

const BitBusinessCardProvider = ({ children }) => {
    const [cards, setCards] = useState(null);
    const [selectedUUID, setSelectedUUID] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isEdit, setIsEdit] = useState(0);
    const [temp, setTemp] = useState(null);

    const {
        isInit,
        isCreateNewOrSelect,
        setIsEditingOrNot,
        setIsCreateNewOrSelect,
        setIsContentChangedOrNot,
        setAllInit,
        isSavedOrNot,
        setIsSavedOrNot,
    } = useContext(EditStateContext);

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

    // * 初始化的时候获取cards
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
                    setSelectedUUID(res.uuid);
                    setIsSavedOrNot("newSaved");
                    setIsCreateNewOrSelect(false);
                    setIsEditingOrNot(false);
                })
                .catch((err) => {
                    setSelectedUUID(null);
                    setIsSavedOrNot("Error");
                });
        } catch (error) {
            console.log("postCard :" + error);
            window.alert(error);
            setAllInit();
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

    // * 监听 编辑状态
    useEffect(() => {
        if (isInit) {
            console.log("初始化");
            setSelectedCard(null);
            setTemp(null);
            setSelectedUUID(null);
            setAllInit();
        } else {
            console.log("非 初始化");

            if (isCreateNewOrSelect) {
                console.log("isCreateNew");

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
                setSelectedUUID(null);
            } else {
                console.log("非 isCreateNew");

                const _card = cards.filter((c) => c.uuid === selectedUUID);
                if (_card[0]) {
                    setSelectedCard({ ..._card[0] });
                    setTemp({ ..._card[0] });
                    setSelectedUUID(_card[0].uuid);
                }
            }
        }
    }, [isInit, isCreateNewOrSelect, cards, setSelectedUUID, selectedUUID]);

    // * 监听是否有修改
    useEffect(() => {
        if (JSON.stringify(temp) === JSON.stringify(selectedCard)) {
            setIsContentChangedOrNot(false);
        } else {
            setIsContentChangedOrNot(true);
        }
    }, [selectedCard, temp, setIsContentChangedOrNot]);

    // * 监听是否要保存
    useEffect(() => {
        if (isSavedOrNot === "needSave") {
            console.log("开始准备保存数据了");
            if (isCreateNewOrSelect) {
                console.log("要保存的数据是新建的,所以要用POST方法");
                postNewCard(tempFormContentToFormData(temp));
            } else {
            }
        } else if (isSavedOrNot === "newSaved") {
            getCards();
        } else if (isSavedOrNot === "deleting") {
            if (selectedUUID) {
                deleteCardByUUID(selectedUUID).then(() => {
                    setAllInit();
                });
            } else {
                window.alert("出了点什么问题,没有删除成功!")
            }
        }
    }, [isSavedOrNot, isCreateNewOrSelect]);

    return (
        <BitBusinessCardContext.Provider
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
            }}
        >
            {children}
        </BitBusinessCardContext.Provider>
    );
};

export { BitBusinessCardContext, BitBusinessCardProvider };
