import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, LayoutDashboard, BookOpen, Mic, MessageSquare,
  BookMarked, Calendar, BarChart3, User, LogOut, ChevronLeft, Menu, Flame, X,
} from 'lucide-react'
import { logoutUser } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/learning', icon: BookOpen, label: 'Learning' },
  { to: '/dashboard/speaking', icon: Mic, label: 'Speaking' },
  { to: '/dashboard/chatbot', icon: MessageSquare, label: 'AI Chat' },
  { to: '/dashboard/vocabulary', icon: BookMarked, label: 'Vocabulary' },
  { to: '/dashboard/planner', icon: Calendar, label: 'Study Plan' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
]

function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
        ${isActive ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`
      }      style={({ isActive }) => isActive ? {
        background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
        border: '1px solid rgba(0,212,255,0.2)',
      } : {}}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { userData } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/')
  }

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 min-h-[64px]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
          <Brain size={18} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-display font-bold text-base gradient-text whitespace-nowrap flex-1">
            LinguaMind AI
          </span>
        )}
        {mobile ? (
          <button onClick={() => setMobileOpen(false)} className="text-white/30 hover:text-white ml-auto">
            <X size={18} />
          </button>
        ) : (
          <button onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-white/30 hover:text-white transition-colors flex-shrink-0">
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Streak badge */}
      {(!collapsed || mobile) && userData && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <Flame size={14} className="text-orange-400" />
          <span className="text-orange-400 text-xs font-medium">{userData.streak} day streak</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} collapsed={!mobile && collapsed}
            onClick={mobile ? () => setMobileOpen(false) : undefined} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all w-full">
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex h-screen sticky top-0 flex-col border-r overflow-hidden flex-shrink-0 z-40 transition-colors duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(6,13,24,0.95)' : 'rgba(238,242,255,0.97)',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile hamburger button — in TopBar area */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 glass-card rounded-xl flex items-center justify-center text-white/70 hover:text-white"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 border-r z-50 flex flex-col transition-colors duration-300"
              style={{
                background: theme === 'dark' ? 'rgba(6,13,24,0.98)' : 'rgba(238,242,255,0.98)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
