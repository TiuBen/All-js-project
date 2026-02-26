import React from "react";
import TopNav from "./TopNav";
import SideBar from "./SideBar";
import BottomBar from "./BottomBar";

export const AdminLayout = ({ children }) => {
    return (
        <div className="grid grid-rows-[3rem_1fr_1.5rem] grid-cols-[min-content_1fr] w-[100vw] h-[100vh] overflow-clip ">
            <TopNav />
            <SideBar />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
            <footer className="col-span-2 ">
                <BottomBar />
            </footer>
        </div>
    );
};
