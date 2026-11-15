// src/App.jsx - 路由总入口：后台布局 + 业务页面
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import WorkbenchPage from './pages/workbench/WorkbenchPage';
import SimulatorForm from './pages/SimulatorForm';
import TheoryForm from './pages/TheoryForm';
import TaskDetail from './pages/TaskDetail';
import ScorePage from './pages/ScorePage';
import TrainingItemsPage from './pages/TrainingItemsPage';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/workbench" replace />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/simulator-form" element={<SimulatorForm />} />
          <Route path="/theory-form" element={<TheoryForm />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/:id/score" element={<ScorePage />} />
          <Route path="/training-items" element={<TrainingItemsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/workbench" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
