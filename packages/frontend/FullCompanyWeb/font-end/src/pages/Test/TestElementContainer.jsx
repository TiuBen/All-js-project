import React, { useEffect } from "react";

export default function TestElementContainer(props) {
    var tinElement = document.createElement('div');
    tinElement.style.color = "red"
    tinElement.style.position = "fixed";
    tinElement.style.top = '4px';
    tinElement.style.zIndex = '20';
    tinElement.innerText = "测试用的内容将显示在这里"

    useEffect(() => {
        document.body.appendChild(tinElement);
    }, [""]);

    return <div>{...props}</div>;
}
