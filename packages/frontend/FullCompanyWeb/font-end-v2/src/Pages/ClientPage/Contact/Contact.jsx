import React, { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { DataContext, DataContextProvider } from "../../../utils";
import List from "../List";
import Toolbar from "../Toolbar";
import Display from './Display';
import Form from './Form';




function Contact() {
    const { data, selectedItem, tempData } = useContext(DataContext);

    let ele = undefined;

    if (tempData !== null) {
        ele = <Form initValue={tempData} />;
    }else if( tempData===null && selectedItem===null)  {
        ele=<></>;
    }else{
        ele=<Display item={selectedItem}/>
    }

    return (
        <>
            <List />
            <div className="flex flex-1 flex-col gap-2">
                <Toolbar />
                {ele}
            </div>
        </>
    );
}

export default function WrappedContact() {
    const value = useOutletContext();

    return (
        <DataContextProvider url={value}>
            <Contact />
        </DataContextProvider>
    );
}
