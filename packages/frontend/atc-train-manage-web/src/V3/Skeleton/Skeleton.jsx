import { useState } from "react";
import { AlignJustify, User } from "lucide-react";
import  UserListDialog from "../Dialog/UserListDialog";

function Skeleton({
    LeftSidebar,
    isLeftSidebarOpen,
    setLeftSidebarOpen,
    topNav,
    rightSidebar,
    main,
    bottomBar,
    floatingAction,
    children,
}) {
    const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);

    return (
        <>
            <div
                className=" overflow-hidden"
                style={{ display: "grid", height: "100vh", gridTemplateRows: "3rem 1fr 2rem", position: "relative" }}
            >
                {/* Top Navigation */}
                {
                    <header className=" sticky w-full top-0  h-[3rem] text-white bg-blue-900 " style={{ gridRow: "1" }}>
                        {topNav}
                    </header>
                }

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <aside
                        className={`relative overflow-visible   ${
                            isLeftSidebarOpen ? "w-[8rem]" : "w-[4rem]"
                        }  flex flex-row bg-blue-600  text-blue-50`}
                        // style={{ backgroundColor: "var(--accent-9)", color: "var(--accent-6)" }}
                    >
                        <>{LeftSidebar}</>

                        {/* Button */}
                        {/* <button
                            className={`z-10 flex items-center justify-center content-center absolute top-[1rem] transform right-0 translate-x-[50%] max-h-[2rem] max-w-[2rem] min-h-[2rem] min-w-[2rem] rounded-full bg-white border-blue-500 shadow-md duration-200 `}
                            onClick={() => {
                                setLeftSidebarOpen(!isLeftSidebarOpen);
                            }}
                        >
                            <AlignJustify />
                        </button> */}
                        <button
                            className={` w-[1rem] hover:cursor-ew-resize  bg-blue-600 shadow-md  `}
                            onClick={() => {
                                setLeftSidebarOpen(!isLeftSidebarOpen);
                            }}
                        ></button>
                    </aside>

                    {/* Main Content */}
                    <main className="flex flex-1 overflow-auto relative">{main}</main>

                    {/* Right Sidebar */}
                    {/* {rightSidebar!==null ? (
                        <aside className="w-64 bg-gray-400 border-l border-gray-200 ">ddd {rightSidebar}</aside>
                    ):<></>} */}
                </div>

                {/* Bottom Bar */}
                {bottomBar && (
                    <footer className="w-full bg-blue-900 text-white flex flex-row flex-1 items-center ">
                        {bottomBar}
                    </footer>
                )}

                {/* Floating Action Button */}
                {/* {floatingAction && (
                <div className=" bottom-8 right-8">
                    <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700">
                        {floatingAction}
                    </button>
                </div>
            )} */}
            </div>
            {/* <UserListDialog />   */}
        </>
    );
}

export default Skeleton;
