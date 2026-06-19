import React, { useState, useEffect } from "react";
import { TreeItem } from "./TreeItem";

const Tree = ({ data }) => {
    return (
        <div className="p-2  rounded shadow  overflow-y-auto">
            <ul>
                {data.map((item, index) => (
                    <TreeItem key={index} item={item}></TreeItem>
                ))}
            </ul>
        </div>
    );
};

export default Tree;
