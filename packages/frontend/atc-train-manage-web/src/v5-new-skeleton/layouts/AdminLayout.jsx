import React from "react";

function AdminLayout({ sideNavBar, horizontalNavBar, mainContent }) {
    return (
        <div className="flex flex-row w-full h-full ddd *:">
            <>{sideNavBar}</>
            <div className="flex flex-col flex-1">
                <nav>
                    {horizontalNavBar}
                </nav>
                <main></main>
            </div>
        </div>
    );
}

export default AdminLayout;
