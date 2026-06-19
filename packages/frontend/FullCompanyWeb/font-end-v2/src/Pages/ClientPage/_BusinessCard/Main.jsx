import React, { useContext } from "react";
import BusinessCard from "./BusinessCard";
import {  BitBusinessCardProvider,  } from "../Context/BitBusinessCardContext";
import List from "./List";
import { EditStateContext, EditStateProvider } from "../../../utils/index";

function BusinessCardPage() {
    const { isInit } = useContext(EditStateContext);

    return (
        <>
            <List />
            {isInit ? <></> : <BusinessCard />}
        </>
    );
}

function WrappedBusinessCardPage() {
    return (
        <EditStateProvider>
            <BitBusinessCardProvider>
                <BusinessCardPage />
            </BitBusinessCardProvider>
        </EditStateProvider>
    );
}

export { BusinessCardPage, WrappedBusinessCardPage };
