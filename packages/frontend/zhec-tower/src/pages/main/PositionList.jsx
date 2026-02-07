import React, { useEffect, useState } from "react";
import { useLocalStorageState } from "ahooks";
import { Positions } from "../../lib/CONST";

export default function PositionList() {
    const [selectedPosition, setSelectedPosition] = useLocalStorageState("position", { listenStorageChange: true });

    return (
        <div>
            <h3 className="text-xl font-bold text-blue-600 ">请先选好席位</h3>
            <ul className="flex flex-row flex-wrap gap-2 text-sm ">
                {Positions.map((pos, index) => {
                    return (
                        <li className="border rounded bg-white px-1 flex flex-row gap-1" key={index}>
                            <label key={index} htmlFor={"position" + index}>
                                {pos}
                            </label>
                            <input
                                type="radio"
                                name="pos-name"
                                value={pos}
                                id={"position" + index}
                                checked={pos === selectedPosition}
                                onChange={() => {
                                    setSelectedPosition(pos);
                                }}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
