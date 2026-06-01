import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Brain, ArrowLeft, CheckCircle } from 'lucide-react'
import { resetPassword } from '../../firebase/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import BackgroundEffects from '../../components/BackgroundEffects'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <BackgroundEffects />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
              <Brain size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">LinguaMind AI</span>
          </Link>
        </div>

        <div className="glass-card neon-border p-8 rounded-3xl">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/50 mb-6">We sent a reset link to <span className="text-white">{email}</span></p>
              <Link to="/login">
                <Button variant="secondary" className="w-full py-3">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Reset password</h2>
              <p className="text-white/50 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
                <Button type="submit" loading={loading} className="w-full py-3">Send Reset Link</Button>
              </form>
              <Link to="/login" className="flex items-center gap-2 text-white/50 hover:text-white text-sm mt-4 transition-colors">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
