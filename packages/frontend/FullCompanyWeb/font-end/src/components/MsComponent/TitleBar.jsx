import React from "react";
import PropTypes from "prop-types";
import "./BasicControlStyle.scss";
import IconButton from "./IconButton";

function TitleBar(props) {
    const { themeColor, title, children, ...otherProps } = props;
    return (
        <div className="ms-title-bar" style={{ backgroundColor: themeColor }} {...otherProps}>
            <span>{title}</span>
            {children}
            <button>
                <span class="material-symbols-outlined">close</span>
            </button>
            <IconButton iconName="close"/>
        </div>
    );
}

TitleBar.propTypes = {
    themeColor: PropTypes.string,
    title: PropTypes.string,
};

export default TitleBar;
