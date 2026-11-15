import React, { createContext, useState } from "react";

const DialogContext = createContext();

const DialogContextProvider = ({ children }) => {
    
    const [dialogPayload, setDialogPayload] = useState({});

    return (
        <DialogContext.Provider
            value={{
                dialogPayload,
                setDialogPayload,
            }}
        >
            {children}
        </DialogContext.Provider>
    );
};

export { DialogContext, DialogContextProvider };
