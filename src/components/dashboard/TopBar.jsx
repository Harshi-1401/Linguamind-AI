import { useState, useRef, useEffect } from 'react'
import { Bell, Sun, Moon, Search, X, Zap, BookOpen, Mic, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const NOTIFICATIONS = [
  { id: 1, icon: Zap, color: '#00d4ff', title: 'Daily streak active!', desc: 'Keep going to maintain your streak.', time: 'Just now' },
  { id: 2, icon: BookOpen, color: '#7c3aed', title: 'New lesson available', desc: 'Advanced: Business Spanish is unlocked.', time: '2h ago' },
  { id: 3, icon: Trophy, color: '#f59e0b', title: 'Achievement unlocked', desc: 'You completed 5 lessons this week!', time: '1d ago' },
  { id: 4, icon: Mic, color: '#ec4899', title: 'Speaking reminder', desc: "You haven't practiced speaking today.", time: '1d ago' },
]

export default function TopBar() {
  const { user, userData } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showNotifs, setShowNotifs] = useState(false)
  const [readIds, setReadIds] = useState([])
  const notifRef = useRef(null)

  const unread = NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 border-b flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30 transition-colors duration-300"
      style={{
        background: theme === 'dark' ? 'rgba(2,4,8,0.95)' : 'rgba(238,242,255,0.95)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)' }} />
          <input
            placeholder="Search lessons, words..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.1)',
              color: theme === 'dark' ? '#fff' : '#0f172a',
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* XP badge */}
        {userData && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
            ⚡ {userData.xp} XP
          </div>
        )}

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)',
            color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifs(v => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)',
              color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)',
            }}
          >
            <Bell size={16} />
            {unread > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: '#00d4ff' }}>
                {unread}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-[999]"
                style={{
                  background: '#0d1117',
                  border: '1px solid rgba(0,212,255,0.2)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111827' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">Notifications</span>
                    {unread > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unread > 0 && (
                      <button onClick={() => setReadIds(NOTIFICATIONS.map(n => n.id))}
                        className="text-xs font-medium transition-colors"
                        style={{ color: '#00d4ff' }}>
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)}
                      className="text-white/30 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="overflow-y-auto" style={{ maxHeight: '280px', background: '#0d1117' }}>
                  {NOTIFICATIONS.map((n, i) => {
                    const isRead = readIds.includes(n.id)
                    return (
                      <motion.div key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setReadIds(prev => [...new Set([...prev, n.id])])}
                        className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isRead ? 'transparent' : 'rgba(0,212,255,0.03)',
                          opacity: isRead ? 0.5 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(0,212,255,0.03)'}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${n.color}18`, border: `1px solid ${n.color}35` }}>
                          <n.icon size={15} style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{n.desc}</p>
                          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{n.time}</p>
                        </div>
                        {!isRead && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 text-center"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#111827' }}>
                  <button className="text-xs font-medium transition-colors" style={{ color: '#00d4ff' }}>
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer flex-shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
          {user?.displayName?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
