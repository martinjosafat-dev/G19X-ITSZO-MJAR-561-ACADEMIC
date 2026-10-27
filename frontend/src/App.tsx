import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import EvaluationPage from './pages/EvaluationPage'
import RegistrationPage from './pages/RegistrationPage'
import RecruiterDetailPage from './pages/RecruiterDetailPage'
import RecruiterListPage from './pages/RecruiterListPage'

function App() {
  return (
    <Routes>
      <Route element={<RegistrationPage />} path="/" />
      <Route element={<ChatPage />} path="/chat/:interviewId" />
      <Route element={<EvaluationPage />} path="/evaluation/:interviewId" />
      <Route element={<RecruiterListPage />} path="/recruiter" />
      <Route
        element={<RecruiterDetailPage />}
        path="/recruiter/:interviewId"
      />
      <Route element={<RecruiterListPage />} path="/dashboard" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
