import { createContext } from "react";

function getPosition(referenceElement, width, height) {
    console.log("getPosition:"+referenceElement.textContent);
    if (referenceElement) {
        const _targetRect = referenceElement.getBoundingClientRect();
        // console.log("targetRect:");
        // console.log(_targetRect);

        const _windowWidth = document.body.clientWidth;
        const _windowHeight = document.body.clientHeight;
        // console.log(`The viewport width is ${_windowWidth} and the height is ${_windowHeight}.`);

        var left = parseInt(_targetRect.left);
        var right = parseInt(_windowWidth - _targetRect.right);
        var top = parseInt(_targetRect.top);
        var bottom = parseInt(_windowHeight - _targetRect.bottom);
        var max = parseInt(Math.max(left, right, top, bottom));
        // console.log(`left:${left} right:${right} top:${top} bottom:${bottom} `);

        // console.log("max:" + max);
        var _popoverPosition = { position: "", x: "", y: "", width: width, height: height, display: "block" };

        if (max === left) {
            _popoverPosition.position = "LEFT";
            _popoverPosition.x = _targetRect.left - width;
            _popoverPosition.y = _targetRect.top + _targetRect.height / 2 - height / 2;
        } else if (max === right) {
            _popoverPosition.position = "RIGHT";
            _popoverPosition.x = _targetRect.right;
            _popoverPosition.y = _targetRect.top + _targetRect.height / 2 - height / 2;
        } else if (max === top) {
            _popoverPosition.position = "TOP";
            _popoverPosition.x = _targetRect.left + _targetRect.width / 2 - width / 2;
            _popoverPosition.y = _targetRect.top - height;
        } else if (max === bottom) {
            _popoverPosition.position = "BOTTOM";
            _popoverPosition.x = _targetRect.left + _targetRect.width / 2 - width / 2;
            _popoverPosition.y = _targetRect.bottom;
        } else {
            console.log("WRONG");
        }

        // console.log("_popoverPosition:" + _popoverPosition);
        // console.log(_popoverPosition);

        return _popoverPosition;
    }
}

const AnchorContext = createContext({
    AnchorStyle: { position: "TOP", x: "20px", y: "40px", width: 400, height: 260, display: "block" },
    SetAnchorStyle: () => {},
    AnchorElement: null,
    SetAnchorElement: null,
});

export { getPosition, AnchorContext };
