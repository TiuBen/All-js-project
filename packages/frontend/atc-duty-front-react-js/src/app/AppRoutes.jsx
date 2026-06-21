import { Routes, Route } from "react-router-dom";
import OnDutyPage from "../pages/OnDutyPage/Page";
import CalendarPage from "../pages/CalendarPage/Page";
import StatisticsLayout from "../pages/StatisticsPage/Page.jsx";
import NightCount from "../pages/StatisticsPage/NightCount";
import PersonDuration from "../pages/StatisticsPage/PersonDuration";
import PositionDuration from "../pages/StatisticsPage/PositionDuration/index";
import CheckDuration from "../pages/StatisticsPage/CheckDuration";
import DutyRecordPage from "../pages/DutyRecordPage/Page";
import ComingSoon from "./layout/ComingSoon";
import NotFound from "./layout/NotFound";
import SettingPage from "../pages/SettingPage/Page";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<OnDutyPage />} />
            <Route path="/duty" element={<OnDutyPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistics" element={<StatisticsLayout />}>
                <Route index element={<NightCount />} />
                <Route path="night-count" element={<NightCount />} />
                <Route path="detail" element={<PersonDuration />} />
                <Route path="position" element={<PositionDuration />} />
                <Route path="check" element={<CheckDuration />} />
            </Route>
            <Route path="/duty-record" element={<DutyRecordPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
