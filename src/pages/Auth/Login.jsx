import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Brain } from 'lucide-react'
import { loginUser, loginWithGoogle } from '../../firebase/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import BackgroundEffects from '../../components/BackgroundEffects'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <BackgroundEffects />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
              <Brain size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">LinguaMind AI</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/50">Continue your language journey</p>
        </div>

        <div className="glass-card neon-border p-8 rounded-3xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" icon={Mail} placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Password" type="password" icon={Lock} placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-neon-blue text-sm hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              Sign In
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Button variant="secondary" className="w-full py-3" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-white/50 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-neon-blue hover:underline font-medium">Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
