// src/App.jsx - 路由总入口：后台布局 + 业务页面
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import WorkbenchPage from './pages/workbench/WorkbenchPage';
import SimulatorForm from './pages/SimulatorForm';
import TheoryForm from './pages/TheoryForm';
import TrainSimulator from './pages/train-simulator';
import TrainTheory from './pages/train-theory';
import TrainLibrary from './pages/train-library';
import SimulatorExerciseDatabase from './pages/train-simulator/SimulatorExerciseDatabase';
import SimulatorSchedule from './pages/train-simulator/SimulatorSchedule';
import SimulatorExamTeacher from './pages/train-simulator/SimulatorExamTeacher';
import SimulatorExamStudent from './pages/train-simulator/SimulatorExamStudent';
import TheoryExerciseDatabase from './pages/train-theory/TheoryExerciseDatabase';
import TheoryExerciseEditor from './pages/train-theory/TheoryExerciseEditor';
import TheoryExamTeacher from './pages/train-theory/TheoryExamTeacher';
import TheoryExamStudent from './pages/train-theory/TheoryExamStudent';
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
          {/* 模拟机培训：嵌套路由驱动页签，index 重定向到第一个页签 */}
          <Route path="/simulator" element={<TrainSimulator />}>
            <Route index element={<Navigate to="database" replace />} />
            <Route path="database" element={<SimulatorExerciseDatabase />} />
            <Route path="arrange" element={<SimulatorSchedule />} />
            <Route path="mentoring" element={<SimulatorExamTeacher />} />
            <Route path="training" element={<SimulatorExamStudent />} />
          </Route>
          {/* 理论培训：同上 */}
          <Route path="/theory" element={<TrainTheory />}>
            <Route index element={<Navigate to="database" replace />} />
            <Route path="database" element={<TheoryExerciseDatabase />} />
            <Route path="editor" element={<TheoryExerciseEditor />} />
            <Route path="marking" element={<TheoryExamTeacher />} />
            <Route path="exam" element={<TheoryExamStudent />} />
          </Route>
          <Route path="/simulator-form" element={<SimulatorForm />} />
          <Route path="/theory-form" element={<TheoryForm />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/:id/score" element={<ScorePage />} />
          <Route path="/training-items" element={<TrainingItemsPage />} />
          <Route path="/library" element={<TrainLibrary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/workbench" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
