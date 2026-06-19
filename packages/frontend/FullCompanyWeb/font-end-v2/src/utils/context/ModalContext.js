import React, { useEffect, createContext, useState, useRef } from "react";
import { createPortal } from "react-dom";

const ModalContext = createContext({
    content: null,
    SetTempTodo: null,
    ModalVisibility: false,
    SetModalVisibility: null,
    visible: null,
    setVisible: () => {},
    setContent: () => {},
    returnValue: null,
    setReturnValue: () => {},
});

function ModalContextProvider({ children }) {
    const [returnValue, setReturnValue] = useState(null);
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState("cheshi");

    const container = useRef(null);
    if (container.current == null) {
        container.current = document.createElement("div");
    }

    const dialogRef = useRef(null);
    const dialog = (
        <dialog
            id="favDialog"
            ref={dialogRef}
            className="border border-blue-200  rounded-lg  px-6 py-4 shadow-lg shadow-blue-500/10"
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
            <div className=" border  border-blue-600">{children}</div>
            {createPortal(dialog, container.current)}
        </ModalContext.Provider>
    );
}

export { ModalContext, ModalContextProvider };
