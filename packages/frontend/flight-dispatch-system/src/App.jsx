import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout'
import FlightSchedulePage from './pages/FlightSchedulePage'
import ChecklistPage from './pages/ChecklistPage'
import ChecklistSelectPage from './pages/ChecklistSelectPage'
import RecordsPage from './pages/RecordsPage'
import FlowchartPage from './pages/FlowchartPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FlightSchedulePage />} />
        <Route path="/checklist" element={<ChecklistSelectPage />} />
        <Route path="/checklist/:flightId" element={<ChecklistPage />} />
        <Route path="/flowchart/:flightId" element={<FlowchartPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}