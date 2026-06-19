import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Anchor } from "./Anchor";
import "./layouts.scss";

function MainPage(props) {
    const { top, left, footer, main, anchor, anchorStyle } = props;

    // 内容偏移
    const [leftWidth, setLeftWidth] = useState();
    useEffect(() => {
        const _leftContainer = document.getElementById("left-container");
        console.log("leftContainer.offsetWidth:" + _leftContainer.offsetWidth);
        setLeftWidth(_leftContainer.offsetWidth + 2);
    }, [""]);

    //浮窗功能
    return (
        <div className="main-page test-border">
            <div className="top-container test-border">{top}</div>

            <div id="left-container" className="left-container test-border ">
                {left}
            </div>
            <div className="main-container test-border" style={{ marginLeft: leftWidth + "px" }}>
                <Outlet>{main}</Outlet>
            </div>
            <div className="footer-container">{footer}</div>
            <div
                date-role="锚点"
                style={{ position: "fixed", left: 0, top: 0, zIndex: "10000", border: "3px dashed yellow" }}
            >
                <div style={{ backgroundColor: "#00fc00" }}>fdddddd</div>
                <div style={{ backgroundColor: "#00fc00" }}>fdddddd</div>
                <Anchor anchorSize={15} color={"red"}>
                    {anchor}
                </Anchor>
            </div>
        </div>
    );
}

export { MainPage };
