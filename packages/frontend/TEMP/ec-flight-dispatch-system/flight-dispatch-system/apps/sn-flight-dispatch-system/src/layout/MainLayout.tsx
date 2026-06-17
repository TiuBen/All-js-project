import TopNavbar from "@/components/top-navbar";
import { Link, Outlet } from "@tanstack/react-router";

function MainLayout() {
    return (
        <div className="h-screen w-screen flex flex-col">
            <TopNavbar />
            <div className="overflow-y-hidden  flex-1">
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;
