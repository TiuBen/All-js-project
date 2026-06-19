import React, { useState, useEffect, useRef, useContext } from "react";
import { EditStateContext, Request, ServerHttpURL } from "../../../utils";
import { BitBusinessCardContext, EditBitState, isBitSet } from "../Context/BitBusinessCardContext";
import BusinessCardForm from "./Editor";
import Exhibitor from "./Exhibitor";
import Toolbar from "./Toolbar";

function BusinessCard() {
    const { isEditingOrNot } = useContext(EditStateContext);

    return (
        <form className="flex flex-col flex-1 items-stretch bg-white rounded-lg shadow-md px-4 pb-4   relative ">
            <Toolbar />
            <hr className="my-4" />

            {isEditingOrNot ? <BusinessCardForm /> : <Exhibitor />}
        </form>
    );
}

export default BusinessCard;
