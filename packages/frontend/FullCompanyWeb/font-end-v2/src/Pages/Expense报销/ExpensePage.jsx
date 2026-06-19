import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Request } from "../../utils";

// * 这个是模仿github 的布局效果

function ExpenseItemList({ user }) {
    const [allExpenseItems, setAllExpenseItems] = useState([]);

    useEffect(() => {
        Request.get("/forms").then((data) => setAllExpenseItems(data));
    }, []);

    return (
        <ul>
            {Array.isArray(allExpenseItems)
                ? allExpenseItems.map((item, index) => {
                      return (
                          <li key={index} className="flex flex-row mb-[6px]">
                              <span class="material-symbols-outlined">savings</span>
                              <Link to={"form/"+item.id} className="hover:underline underline-offset-[6px] ml-1"> {item.data.expensePerson + "/报销" + item.id}</Link>
                          </li>
                      );
                  })
                : ""}
        </ul>
    );
}

function ExpensePage() {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="bg-stone-50 w-64 py-6 px-4 flex flex-col gap-3">
                {/* Sidebar Content */}
                {/* You can add navigation links or other content here */}
                <h3 className="flex flex-row  font-yahei font-semibold justify-between">
                    所有报销
                    <Link
                        to={"new"}
                        className="flex items-center  bg-blue-600  text-sm text-stone-50 border px-2 text-center rounded-md"
                    >
                        {" "}
                        <span class="material-symbols-outlined text-[16px]">note_add</span>新建
                    </Link>
                </h3>
                <input
                    class="w-full h-10 px-4 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    type="text"
                    placeholder="查找某个报销"
                />
                <ExpenseItemList />
                <h1 className="text-white text-xl font-bold">GitHub</h1>
                <ul className="mt-6">
                    <li className="text-white py-2">Home</li>
                    <li className="text-white py-2">Explore</li>
                    <li className="text-white py-2">Issues</li>
                    {/* Add more navigation items as needed */}
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-row gap-[1rem]">
                {/* Main Content */}
                {/* Replace this with your main content */}
           
                <Outlet />
            </div>
        </div>
    );
}

export default ExpensePage;
