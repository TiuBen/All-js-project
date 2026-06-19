import React, { ReactElement } from "react";

interface Control {
    controlName: string;
    element: ReactElement;
    option?: any;
}

const AvailableControlList: Control[] = [
    {
        controlName: "Control 1",
        element: <input type="text"/>,
        option: "Option A",
    },
    {
        controlName: "Control 2",
        element: (
            <select>
                <option>Option 1</option>
                <option>Option 2 </option>
            </select>
        ),
        option: "Option B",
    },
    {
        controlName: "Control 3",
        element: <textarea />,
        // no option specified for this object
    },
];

export { AvailableControlList };
