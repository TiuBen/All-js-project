import React, { useRef, useState, useEffect } from "react";
import List from "rc-virtual-list";
import YearItem from "./YearItem";

const Item=['A','b','c','d'];

export default function TowDimensionCalendar() {
    const ref = useRef("initialValue");
    const [listHeight, setListHeight] = useState(200);
    useEffect(() => {
        const calendar = ref.current;

        console.log(calendar.clientHeight);
        console.log(calendar.clientWidth);

        setListHeight(calendar.clientHeight);
        return () => {};
    }, [listHeight]);

    return (
        <div
            ref={ref}
            className="calendar"
            style={{
                border: "1px solid green",
                boxSizing: "border-box",
                margin: "5px",
            }}
        >
            TowDimensionCalendar
            <div>
                <button style={{ display: "inline-block" }}>日</button>
                <button style={{ display: "inline-block" }}>星期</button>
                <button style={{ display: "inline-block" }}>月</button>
                <button style={{ display: "inline-block" }}>年</button>
            </div>
            <List
                style={{
                    border: "1px solid red",
                    boxSizing: "border-box",
                }}
                data={[0, 1, 2]}
                height={listHeight - 50}
                itemHeight={30}
                itemKey="id"
            >
                {(index) => <div>{ Item[index]}</div>}
            </List>
            ;
        </div>
    );
}
