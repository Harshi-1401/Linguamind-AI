import { motion } from 'framer-motion'
import { Brain, ArrowRight, Share2, GitBranch, Globe, MessageCircle } from 'lucide-react'

const links = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Documentation', 'Help Center', 'Community', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Security'],
}

const socials = [
  { icon: Share2, href: '#', label: 'Twitter' },
  { icon: GitBranch, href: '#', label: 'GitHub' },
  { icon: Globe, href: '#', label: 'LinkedIn' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      {/* Top glow separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, #7c3aed, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
                <Brain size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">LinguaMind AI</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              The most advanced AI-powered language learning platform. Speak any language with confidence.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 glass-card px-4 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-neon-blue/50 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
              >
                <ArrowRight size={16} className="text-white" />
              </motion.button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-white/80 text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-white/30 text-sm">
            © 2025 LinguaMind AI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.2, y: -2 }}
                className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                aria-label={label}
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
