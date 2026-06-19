import React from "react";
import Styles from "./button.module.css";

function ToolBarVButton(props) {
    const { icon, title, tip }=props;
    return (
        <button className={Styles["toolbar-vertical-button"]}  {...props} >
            <span className="material-icons-outlined" style={{ fontSize: "32px" }}>
                {icon}
            </span>
            <span className="flex-1">{title}</span>
            <span className={Styles["tip"]}>{tip}</span>
        </button>
    );
}

export { ToolBarVButton };
