import React from "react";

function 报销() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-semibold mb-4">报销 NO:2024-01-21-A-0001</h1>
            <form className="bg-white shadow-md rounded p-8 grid grid-cols-2  gap-2">
                <label htmlFor="invoiceNumber">申请人:</label>
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="invoiceNumber"
                    name="invoiceNumber"
                    required
                />
                <label htmlFor="invoiceDate">报销金额:</label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    name="invoiceDate"
                    required
                />
                <label htmlFor="customerName">报销事由:</label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    id="customerName"
                    name="customerName"
                    required
                />

                <label htmlFor="customerEmail">发票:</label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    required
                />

                <input style={{ all: "revert" }} type="submit" value="提交" />
            </form>
        </div>
    );
}

export default 报销;
