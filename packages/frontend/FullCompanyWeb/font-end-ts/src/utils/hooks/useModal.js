import { createContext, useContext, useState, useEffect,useRef } from "react";
import { createPortal } from "react-dom";

const ModalContext = createContext({
    modalContent: null,
    setModalContent: () => {},
    modalVisible: false,
    setModalVisible:  () => {},
    returnValue: null,
    setReturnValue: () => {},
});

const ModalProvider = ({ children }) => {
    const [returnValue, setReturnValue] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState("cheshi");

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
            className="border border-gray-400  shadow-lg shadow-gray-500/10 m-auto "
            onKeyDown={(e)=>{
                if (e.key==='Escape') {
                    setModalVisible(false);
                    dialogRef.current.close();
                }
            }}
            onClick={(e)=>{
                if (e.target.id==='dialog') {
                    setModalVisible(false);
                    dialogRef.current.close();
                }
            }}

        >
            {modalContent}
        </dialog>
    );

    useEffect(() => {
        document.body.appendChild(container.current);
        return () => container.current.remove();
    }, []);

    useEffect(() => {
        if (dialogRef.current) {
            if (modalVisible) {
                // without this test, hot reload will error out when the modal is still visible
                if (!dialogRef.current.open) {
                    dialogRef.current.showModal();
                }
            } else {
                dialogRef.current.close();
            }
        }
    }, [modalVisible]);

    return (
        <ModalContext.Provider
            value={{
                modalVisible: modalVisible,
                setModalVisible: setModalVisible,
                setModalContent: setModalContent,
                returnValue: returnValue,
                setReturnValue: setReturnValue,
            }}
        >
           {children}
            {createPortal(dialog, container.current)}
        </ModalContext.Provider>
    );
};

const useModal = () => {
    return useContext(ModalContext);
};

export { ModalProvider, useModal };
