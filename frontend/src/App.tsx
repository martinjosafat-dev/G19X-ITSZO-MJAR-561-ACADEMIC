import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import EvaluationPage from './pages/EvaluationPage'
import RegistrationPage from './pages/RegistrationPage'
import RecruiterDashboard from './pages/RecruiterDashboard'

function App() {
  return (
    <Routes>
      <Route element={<RegistrationPage />} path="/" />
      <Route element={<ChatPage />} path="/chat/:interviewId" />
      <Route element={<EvaluationPage />} path="/evaluation/:interviewId" />
      <Route element={<RecruiterDashboard />} path="/recruiter" />
      <Route element={<RecruiterDashboard />} path="/dashboard" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
