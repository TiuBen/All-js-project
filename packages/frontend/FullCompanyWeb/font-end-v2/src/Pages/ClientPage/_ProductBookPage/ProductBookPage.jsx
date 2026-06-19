import React from "react";
import ProductBookCard  from "./ProductBookCard";

function ProductBookPage() {
    return (
        <div className="flex-1 p-8 flex flex-col gap-[1rem]">
            <h1 className="text-3xl">产品目录</h1>
            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {[0, 1, 2, 3, 4, 5, 6].map((x, index) => {
                    return <ProductBookCard/>;
                })}
            </div>
        </div>
    );
}

export default ProductBookPage;
