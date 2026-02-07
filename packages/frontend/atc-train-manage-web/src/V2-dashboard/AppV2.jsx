import { useState } from "react";
import { Theme } from "@radix-ui/themes";
import Skeleton from "./Skeleton/Skeleton";
import LeftBar from "./LeftBar/LeftBar";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
    Outlet,
    BrowserRouter,
} from "react-router-dom";
import Page1Route from "./Page1/Page1";
import Page2Route from "./Page2/Page2";
import { DialogContextProvider } from "@/utils/context/DialogContext";
import { OnDutyUserContextProvider } from "@/utils/context/OnDutyUserContext";

const RightSidebarDashboard = () => {
    return <div>顶顶顶顶顶顶顶顶顶顶</div>;
};

const RightSidebarHome = () => {
    return <div>顶顶顶顶顶顶顶顶顶顶</div>;
};

function AppVSkeleton() {
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);

    let rightSidebarContent;
    switch (location.pathname) {
        case "/":
            rightSidebarContent = <RightSidebarHome />;
            break;
        case "/dashboard":
            rightSidebarContent = <RightSidebarDashboard />;
            break;
        default:
            rightSidebarContent = <>Default Right Sidebar</>;
    }

    return (
        <DialogContextProvider>
            <OnDutyUserContextProvider>
                <Theme accentColor="indigo">
                    <Skeleton
                        topNav={<div>Top Na嘀嘀嘀vigation</div>}
                        LeftSidebar={<LeftBar isExpanded={isLeftSidebarOpen} />}
                        main={<Outlet />}
                        // rightSidebar={<>对对对对</>}
                        bottomBar={<div>Bottom Bar</div>}
                        floatingAction={<span>+</span>}
                        isLeftSidebarOpen={isLeftSidebarOpen}
                        setLeftSidebarOpen={setLeftSidebarOpen}
                    />
                </Theme>
            </OnDutyUserContextProvider>
        </DialogContextProvider>
    );
}

function AppV2() {
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);

    return (
        // <BrowserRouter>
        //     <Skeleton
        //         topNav={<div>Top Na嘀嘀嘀vigation</div>}
        //         LeftSidebar={<LeftBar isExpanded={isLeftSidebarOpen} />}
        //         main={<Outlet />}
        //         rightSidebar={<>对对对对</>}
        //         bottomBar={<div>Bottom Bar</div>}
        //         floatingAction={<span>+</span>}
        //         isLeftSidebarOpen={isLeftSidebarOpen}
        //         setLeftSidebarOpen={setLeftSidebarOpen}

        //     />
        // </BrowserRouter>

        <RouterProvider
            router={createBrowserRouter(
                createRoutesFromElements(
                    <Route path="/" element={<AppVSkeleton />}>
                        {Page1Route()}
                        {Page2Route()}

                    </Route>
                )
            )}
        />
    );
}

export default AppV2;
