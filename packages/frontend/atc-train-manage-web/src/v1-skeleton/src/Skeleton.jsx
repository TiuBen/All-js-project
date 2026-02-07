import { useState } from "react";
import LeftBar from "../../V2-dashboard/LeftBar/LeftBar";
function Skeleton({ leftSidebar, topNav, rightSidebar, bottomBar, floatingAction, children }) {
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);

    return (
        <>
            <div
                // className=" overflow-hidden"
                style={{ display: "grid", height: "100vh", gridTemplateRows: "3rem 1fr 2rem", position: "relative" }}
            >
                {/* Top Navigation */}
                {
                    <header className="border-b-2 sticky w-full top-0 bg-red-500 h-[3rem] " style={{ gridRow: "1" }}>
                        {topNav && "topNav"}
                    </header>
                }

                <div className="flex flex-row flex-1 overflow-hidden">
                    {/* left Sidebar */}
                    <aside
                        className={`bg-gray-100 border-gray-800 border-r-2 duration-200 overflow-visible relative z-10 ${
                            isLeftSidebarOpen ? "w-64" : "w-16"
                        }`}
                    >
                        <div>{leftSidebar}</div>

                        {/* Button */}
                        <button
                            className={`absolute top-[1rem] transform right-0 translate-x-[50%] max-h-[2rem] max-w-[2rem] min-h-[2rem] min-w-[2rem] rounded-full bg-blue-800 shadow-md duration-200 `}
                            onClick={() => {
                                setLeftSidebarOpen(!isLeftSidebarOpen);
                            }}
                        >
                            E
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 bg-white p-4  ">{children}</main>

                    {/* Right Sidebar */}
                    <aside className="w-64 bg-gray-100 border-l border-gray-200 ">
                        {rightSidebar}
                    </aside>
                </div>

                {/* Bottom Bar */}
                <footer className="w-full bg-gray-800 text-white ">{bottomBar}</footer>

                {/* Floating Action Button */}
                {/* {floatingAction && (
                <div className=" bottom-8 right-8">
                    <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700">
                        {floatingAction}
                    </button>
                </div>
            )} */}
            </div>
        </>
    );
}

const TestSkeleton = {
    TopNav: "TopNav",
    LeftBar: "LeftBar",
    MainContent: "MainContent",
    RightBar: "RightBar",
};

export { Skeleton, TestSkeleton };
