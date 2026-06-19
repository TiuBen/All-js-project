import React, { useContext, useEffect, useState, useRef } from "react";
import { DataContext, DataContextProvider } from "./DataContext";
import { createPortal } from "react-dom";

function TestDataElement() {
    const { data, error, isLoading, setUrl } = useContext(DataContext);

    useEffect(() => {
        setUrl("/businesscard");
    }, [setUrl]);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;

    // 渲染数据
    return (
        <div>
            hello{" "}
            {data.map((item, index) => {
                return (
                    <div key={index} className="border border-red-600">
                        {JSON.stringify(item)}
                    </div>
                );
            })}
            !
        </div>
    );
}

function TestDataElement2() {
    const { data, error, isLoading, setUrl } = useContext(DataContext);

    useEffect(() => {
        setUrl("/company");
    }, [setUrl]);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;

    // 渲染数据
    return (
        <div>
            hello{" "}
            {data?.map((item, index) => {
                return (
                    <div key={index} className="border border-red-600">
                        {JSON.stringify(item)}
                    </div>
                );
            })}
            !
        </div>
    );
}

function TestData() {
    const [ele, setEle] = useState(false);
    const first = useRef("");
    // if (!first.current) {
    //     // If it's not in the DOM, create a new portal container element
    //     first.current = document.createElement('div');
    //     // Add it to the body of the document
    //     document.body.appendChild(first.current);

    //   }
    //   const portal = createPortal(
    //     <div className="portal-content  border-green-700 border-[5px]">
    //       This content is rendered using React Portal.
    //     </div>,
    //     first.current
    //   );
      useEffect(() => {

      }, [first])

    return (
        <div id="test" ref={first}>
            <button
                onClick={() => {
                    setEle(!ele);
                }}
            >
                切换
            </button>
            {createPortal(
                <div className="portal-content  border-green-700 border-[5px]">
                    This content is rendered using React Portal.
                </div>,
                first.current
            )}
            <DataContextProvider>{ele ? <TestDataElement /> : <TestDataElement2 />}</DataContextProvider>
        </div>
    );
}

export default TestData;
