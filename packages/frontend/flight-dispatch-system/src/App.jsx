import { Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import FlightSchedulePage from "./pages/FlightSchedulePage";
import ChecklistPage from "./pages/ChecklistPage";
import ChecklistSelectPage from "./pages/ChecklistSelectPage";
import RecordsPage from "./pages/RecordsPage";
import FlowchartPage from "./pages/FlowchartPage";
import FreshGuaranteePage from "./pages/FreshGuaranteePage";

export default function App() {
    return (
        <PageLayout>
            <Routes>
                <Route path="/" element={<FlightSchedulePage />} />
                <Route path="/fips" element={<FlightSchedulePage />} />
                <Route path="/checklist" element={<ChecklistSelectPage />} />
                <Route path="/checklist/:flightId" element={<ChecklistPage />} />
                <Route path="/flowchart/:flightId" element={<FlowchartPage />} />
                <Route path="/fresh" element={<FreshGuaranteePage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </PageLayout>
    );
}
