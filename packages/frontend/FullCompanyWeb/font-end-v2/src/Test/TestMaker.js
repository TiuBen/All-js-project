import React, { useState, useEffect } from "react";

function MyEle1() {
    return <div>11111</div>;
}

function MyEle2() {
    return <div>22222</div>;
}
function MyEle3() {
    return <div>33333</div>;
}
function MyEle4() {
    return <div>4444</div>;
}

const itemList = [{ type: "div" }, { type: "input" }];

function Make(item) {
    console.log(item);
    const Roles = {
        E1: MyEle1,
        E2: MyEle2,
        E3: MyEle3,
        E4: MyEle4,
    };
    console.log(Roles[item] );

    const AllElements = Roles[item] ?? <div>{JSON.stringify(item)}</div>;

    return <AllElements />;
}

function TestMaker() {
    // !延时加载一些内容
    const [value, setValue] = useState(null);

    useEffect(() => {
        // Simulate an API call to fetch data after 2 seconds
        const fetchData = async () => {
            try {
                // Simulate the API response data
                const mockData = ["E1", "E2", "E3"];
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a 2-second delay
                setValue(mockData);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            }
        };

        fetchData();
    }, []); // The empty dependency array ensures that the effect runs only once, on component mount

    return (
        <div>
            TestMaker
            {value==null?<div>loading....</div> :
                value.map((x, index) => {
                    console.log(x);
                    return (
                        <div key={index} className="flex flex-row">
                            {JSON.stringify(x)}:
                            {Make(x) }
                        </div>
                    );
                })}
            ????
        </div>
    );
}

export default TestMaker;


function setBitToOne(number, bitPosition) {
    // Create a mask with only the specified bit set to 1, others set to 0
    const mask = 1 << bitPosition;

    // Use the bitwise OR operator to set the specified bit to 1
    return number | mask;
}
function setBitToZero(number, bitPosition) {
    // Create a mask with only the specified bit set to 1, others set to 0
    const mask = 1 << bitPosition;

    // Use the bitwise AND operator with the bitwise NOT of the mask to set the specified bit to 0
    return number & ~mask;
}

function isBitSet(number, bitPosition) {
    // Create a mask with only the specified bit set to 1, others set to 0
    const mask = 1 << bitPosition;

    // Use the bitwise AND operator to check if the specified bit is set
    return (number & mask) !== 0;
}

const EditBitState = {
    STATE_IS_INIT: 1, // 判断 初始化的时候 为0 不是 初始化了 那就变成1
    STATE_IS_SELECT_OR_NEW: 2, // 判断是否为新建 还是 选中已有的 如果为新建
    STATE_MODIFIED: 4, // 判断是否进行了修改
    STATE_SAVED: 8, // 判断是否保存了这个
    STATE_CAN_DISCARD: 16, // 判断能否直接 取消按钮可用
};
const STATE_IS_INIT = 1;
const STATE_IS_SELECT_OR_NEW = 2;
const STATE_MODIFIED = 4;
const STATE_SAVED = 8;
const STATE_CAN_DISCARD = 16;
