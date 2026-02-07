import { useState,useEffect } from "react";
import { Theme } from "@radix-ui/themes";

import {
    Route,
    Outlet,
    BrowserRouter,
    Routes,
    Link,
} from "react-router-dom";
import { OnDutyUserContextProvider, DialogContextProvider, PageContextProvider } from "@utils";
import Skeleton from "./Skeleton/Skeleton";
import LeftBar from "./BarLeft/LeftBar";
import BottomBar from "./BarBottom/BottomBar";
import { Page1Routes } from "./Page1/Page1";
import { Page2Routes } from "./Page2/Page2";

import UserListDialog from "./Dialog/UserListDialog";
import TopNav from "./TopNav/TopNav";
import FaceDialog from "./Dialog/FaceDialog";
import EditDutyRecordSheet from "./Dialog/EditDutyRecordSheet";
import useStore from "../utils/store/userStore";
import EditPositionDialog from "./Dialog/EditPositionDialog";
import PositionList from "./CommonComponent/PositionList";


const routes = [...Page1Routes, ...Page2Routes];



function AppVSkeleton() {
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);

    const {users} =useStore();

    return (
      
        <PageContextProvider>
            <DialogContextProvider>
                <OnDutyUserContextProvider>
                    <Theme accentColor="indigo">
                        <Skeleton
                            topNav={<TopNav />}
                            LeftSidebar={<LeftBar isExpanded={isLeftSidebarOpen} />}
                            main={
                                <>
                                    <Routes>
                                        {routes.map(({ path, main, sidebar }, index) => (
                                            <Route
                                                key={path}
                                                path={path}
                                                element={
                                                    <>
                                                        {main()}

                                                        {sidebar() && (
                                                            <aside className="w-64 bg-gray-400 border-l border-gray-200 ">
                                                                {sidebar()}
                                                            </aside>
                                                        )}
                                                    </>
                                                }
                                            />
                                        ))}
                                    </Routes>
                                </>
                            }

                            // main={JSON.stringify(users)}
                        
                            bottomBar={<BottomBar />}
                            floatingAction={<span>+</span>}
                            isLeftSidebarOpen={isLeftSidebarOpen}
                            setLeftSidebarOpen={setLeftSidebarOpen}
                        />
                         {/* <EditDutyRecordSheet /> */}
                         <EditPositionDialog />
                        {/* <FaceDialog /> */}
                        {/* <UserListDialog />  */}
                    </Theme>
                </OnDutyUserContextProvider>
            </DialogContextProvider>
        </PageContextProvider>
    );
}

function AppV3() {
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const {fetchUsers} =useStore();
    useEffect(() => {
        fetchUsers();
      }, [fetchUsers]);
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

        // <RouterProvider
        //     router={createBrowserRouter(createRoutesFromElements(<Route index element={<AppVSkeleton />}></Route>))}
        // />
        <BrowserRouter>
            <AppVSkeleton />
        </BrowserRouter>
            // <PositionList title="Position List" />
    );
}

export default AppV3;
