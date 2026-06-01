import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-10 h-10 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
