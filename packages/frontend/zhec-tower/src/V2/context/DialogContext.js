import React, { createContext, useState } from "react";

const DialogContext = createContext();

const DialogContextProvider = ({ children }) => {
    const [openUserListDialog, setOpenUserListDialog] = useState(false);
    const [openFaceAuthDialog, setOpenFaceAuthDialog] = useState(false);
    const [openTakePhotoDialog, setOpenTakePhotoDialog] = useState(false);
    const [openConfirmGetOutDialog, setOpenConfirmGetOutDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [excludeUser, setExcludeUser] = useState([]);
    const [dialogPayload, setDialogPayload] = useState({});

    return (
        <DialogContext.Provider
            value={{
                openUserListDialog,
                setOpenUserListDialog,
                openFaceAuthDialog,
                setOpenFaceAuthDialog,
                openTakePhotoDialog,
                setOpenTakePhotoDialog,
                openConfirmGetOutDialog,
                setOpenConfirmGetOutDialog,
                dialogTitle,
                setDialogTitle,
                excludeUser,
                setExcludeUser,
                dialogPayload,
                setDialogPayload,
            }}
        >
            {children}
        </DialogContext.Provider>
    );
};

export { DialogContext, DialogContextProvider };
