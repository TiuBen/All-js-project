import React, { createContext, useState, useEffect } from "react";

const PageContext = createContext();

function PageContextProvider({ children }) {
    const [payload,  setPayload] = useState({});

    return (
        <PageContext.Provider
            value={{
                payload,
                setPayload,
            }}
        >
            {children}
        </PageContext.Provider>
    );
}

export { PageContext, PageContextProvider };
