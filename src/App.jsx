import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ProtectedRoute from './components/ui/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'

import LandingPage from './pages/Landing/LandingPage'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ForgotPassword from './pages/Auth/ForgotPassword'
import DashboardHome from './pages/Dashboard/DashboardHome'
import AnalyticsPage from './pages/Dashboard/AnalyticsPage'
import LearningPage from './pages/Learning/LearningPage'
import SpeakingPage from './pages/Speaking/SpeakingPage'
import ChatbotPage from './pages/Chatbot/ChatbotPage'
import VocabularyPage from './pages/Vocabulary/VocabularyPage'
import PlannerPage from './pages/Planner/PlannerPage'
import ProfilePage from './pages/Profile/ProfilePage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardHome />} />
                  <Route path="learning" element={<LearningPage />} />
                  <Route path="speaking" element={<SpeakingPage />} />
                  <Route path="chatbot" element={<ChatbotPage />} />
                  <Route path="vocabulary" element={<VocabularyPage />} />
                  <Route path="planner" element={<PlannerPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
