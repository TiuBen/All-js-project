import { useState } from "react";
import { AlignJustify, User } from "lucide-react";
import UserListDialog from "../Dialog/UserListDialog";
import { Outlet } from "react-router-dom";
import LeftBar from "../BarLeft/LeftBar";

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
    const [navWidth, setNavWidth] = useState("8rem");

    return (
        <>
            <div className="grid grid-rows-[3rem,1fr,1.5rem] grid-cols-[min-content_1fr] w-[100vw] h-[100vh] overflow-clip ">
                <header className=" col-span-2">{topNav}</header>
                <nav className="  ">{LeftSidebar}</nav>
                <main className=" overflow-auto ">
                   <Outlet />
                </main>
                <footer className="col-span-2 ">{bottomBar}</footer>
            </div>
        </>
    );
}

export default Skeleton;
