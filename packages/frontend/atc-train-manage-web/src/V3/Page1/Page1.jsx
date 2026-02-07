import React, { useEffect, useState } from "react";
import { Outlet, Route, useLoaderData } from "react-router-dom";

import MonthPage from "./MonthPage/MainMonth";
import DutyPageMain from "./OnDutyPage/DutyPageMain";
import DutyPageRightBar from "./OnDutyPage/DutyPageRightBar";
import RightBarSelectDayDetail from "./MonthPage/RightBarSelectDayDetail";

// function Page1() {
//     return (
//         <>
//             <div className="relative flex-1 flex ">
//                 <Outlet />
//             </div>

//             {/* <UserListDialog /> */}
//         </>
//     );
// }

// function Page1Route() {
//     return (
//         <Route path="duty" element={<Page1 />}>
//             <Route index element={<MonthPage />} />
//             <Route path="order-by-position" element={<DutyPage />} />
//             <Route path="order-by-month" element={<MonthPage />} />
//         </Route>
//     );
// }

const Page1Routes = [
    {
        path: "/",
        main: () => <MonthPage />,
        // sidebar: () => <RightBarSelectDayDetail/>,
        sidebar: () => null,


    },
    {
        path: "duty",
        main: () => <DutyPageMain />,
        sidebar: () => null,
    },
    {
        path: "/calendar",
        main: () => <MonthPage />,
        sidebar: () => null,
    },
];

export  {Page1Routes};
