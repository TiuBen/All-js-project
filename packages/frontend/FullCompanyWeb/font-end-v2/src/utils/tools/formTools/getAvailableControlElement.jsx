import React,{useRef} from 'react';
import { AvailableControlTypes as Types } from "./AvailableControlTypes";

function formatToInputElement(type) {
    if (type === Types.textarea) {
        return <textarea className="border-2 rounded border-blue-400"  />;
    } else if (type === Types.select || type === Types.option) {
        return React.createElement(type,{className:"block border-2 rounded border-blue-400"});
    } else if (type === Types.image) {
        return (
            <div>
                <div class="border border-black overflow-auto p-1" style="height: 100px;">
                    <canvas class="border border-red-400" width="80" height="80"></canvas>
                </div>
                <input type={type} />
            </div>
        );
    } else {
        return <input className="border-2 rounded border-blue-400" type={type} />;
    }
}

export { formatToInputElement };
