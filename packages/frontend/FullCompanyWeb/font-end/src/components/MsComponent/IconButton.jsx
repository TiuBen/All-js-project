import React from 'react'

export default function IconButton(props) {
    const {iconName, children,...otherProps}=props;
    return (
        <button className="ms-button icon-button" {...otherProps}>
            <span  class="material-symbols-outlined">{iconName}</span>
        </button>
    )
}
