import React from "react";
import { AvailableControlList } from "./AvailableControls";

function FormFactory() {
    return (
        <div>
            FormFactory
            <ul>
                {AvailableControlList.map((x, index) => {
                    return <li>{x.element}</li>;
                })}
            </ul>
        </div>
    );
}

export default FormFactory;
