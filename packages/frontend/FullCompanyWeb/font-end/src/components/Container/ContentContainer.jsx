import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CurrentFileLinks from "./CurrentFileLinks";
import Temp1 from "../FilesTemp/Temp1";
import SalesTable from "../Excel/SalesTable";
import SingleOrderTableForm from "../Excel/SingleOrderTableForm";
import Calendar from "../GridCalendar/Calendar";
import StickyNote from "../Note/StickyNote";
import PersonalPlanList from "../Note/PersonalPlanList";
import MainPage from '../GuiGeSuApp/MainPage';

export default function ContentContainer() {
    return (
        <div style={{ display: "flex", flexGrow: 1, alignItems: "stretch", border: "0.5px dashed red" }}>
            {/* <Routes>
                <Route path="/page1">
                    <Route  path="/page1/temp" element={<Temp1 />} />
                    <Route path="/page1/files" element={<CurrentFileLinks />} />
                    <Route path="/page1/csv" element={<SalesTable />} />
                    <Route path="/page1/calendar" element={<Calendar />} />
                    <Route index path="/page1/plan" element={<PersonalPlanList />} />
                    <Route path="/page1/note" element={<StickyNote />} />
                </Route>
            </Routes> */}
        </div>
    );
}
