import { createContext, useContext, useState, useLayoutEffect, useEffect,useRef,useMemo,useCallback } from "react";
import { createPortal } from "react-dom";

const styles={};

const ModalContext = createContext({
    content: null,
    setContent:()=>{},
    visible: false,
    setVisible:  () => {},
    returnValue: null,
    setReturnValue: () => {},
});

function ModalProvider({ children }) {
    const [returnValue, setReturnValue] = useState(null);
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState("cheshi");

    const container = useRef(null);
    if (container.current == null) {
        container.current = document.createElement("div");
        container.current.setAttribute("id", "dialog-container");//.id="dialog-container"
    }

    const dialogRef = useRef(null);
    const dialog = (
        <dialog
            id="dialog"
            ref={dialogRef}
            className="border border-blue-200  rounded  px-6 py-4 shadow-lg shadow-blue-500/10 m-auto "
        >
            {content}
        </dialog>
    );

    useEffect(() => {
        document.body.appendChild(container.current);
        return () => container.current.remove();
    }, []);

    useEffect(() => {
        if (dialogRef.current) {
            if (visible) {
                // without this test, hot reload will error out when the modal is still visible
                if (!dialogRef.current.open) {
                    dialogRef.current.showModal();
                }
            } else {
                dialogRef.current.close();
            }
        }
    }, [visible]);

    return (
        <ModalContext.Provider
            value={{
                visible: visible,
                setVisible: setVisible,
                setContent: setContent,
                returnValue: returnValue,
                setReturnValue: setReturnValue,
            }}
        >
           {children}
            {createPortal(dialog, container.current)}
        </ModalContext.Provider>
    );
}


const useModal=()=>{
    return useContext(ModalContext);
}

export  {useModal,ModalProvider};


