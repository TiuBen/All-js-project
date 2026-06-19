import React from "react";

function ShortCutsNav() {
    return (
        <div>
            ShortCutsNav
            {["上下班打卡"].map((x, index) => {
                return <li key={index}>{x}</li>;
            })}
        </div>
    );
}

export default ShortCutsNav;
