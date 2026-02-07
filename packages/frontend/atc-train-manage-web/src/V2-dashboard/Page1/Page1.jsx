import React, { useEffect, useState } from "react";
import { Outlet, Route, useLoaderData } from "react-router-dom";

import DutyPage from "./OnDutyPage/DutyPage";
import MonthPage from "./MonthPage/MonthPage";
import UserListDialog from "./OnDutyPage/Dialog/UserListDialog";

function Page1() {
    return (
        <>
            <div className="relative flex-1 flex ">
                <Outlet />
            </div>

            <UserListDialog />
        </>
    );
}

function Page1Route() {
    return (
        <Route path="duty" element={<Page1 />}>
            <Route index element={<MonthPage/>} />
            <Route path="order-by-position" element={<DutyPage />} />
            <Route path="order-by-month" element={<MonthPage/>} />
        </Route>
    );
}

export default Page1Route;
