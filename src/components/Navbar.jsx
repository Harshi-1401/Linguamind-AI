import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Brain, Menu, X } from 'lucide-react'

const links = ['Features', 'Testimonials', 'Pricing', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-card border-b border-white/10 py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.05 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">LinguaMind AI</span>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-white/70 hover:text-white text-sm font-medium relative group transition-colors"
              whileHover={{ y: -1 }}
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-neon-blue to-neon-purple group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Login
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="glow-button text-white text-sm"
            >
              Get Started
            </motion.button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/80" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card mx-4 mt-2 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`}
                  className="text-white/70 hover:text-white font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  {link}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="text-white/70 hover:text-white font-medium text-left">Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}
                  className="glow-button text-white text-sm text-center">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
