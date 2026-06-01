import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: { icon: CheckCircle, color: '#10b981' },
  error: { icon: XCircle, color: '#ef4444' },
  info: { icon: AlertCircle, color: '#00d4ff' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const { icon: Icon, color } = ICONS[t.type] || ICONS.info
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl max-w-xs"
                style={{
                  background: '#0d1117',
                  border: `1px solid ${color}40`,
                  boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 0 1px ${color}20`,
                }}
              >
                <Icon size={16} style={{ color, flexShrink: 0 }} />
                <p className="text-white text-sm flex-1">{t.message}</p>
                <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <X size={13} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
