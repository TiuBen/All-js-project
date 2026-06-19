import React, { useState, useEffect } from "react";
import { useContextMenu } from "../../utils";

const ContextMenu = (props) => {
    const { className,top, left, children } = props;

    return (
        <div
            style={{
                zIndex: 9999,
                position: "fixed",
                top: top,
                left: left,
                display: "block",
            }}
            className={className}
        >
            {children}
        </div>
    );
};
export { ContextMenu };
