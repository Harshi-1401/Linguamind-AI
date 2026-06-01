import { motion } from 'framer-motion'

const variants = {
  primary: 'glow-button text-white',
  secondary: 'glass-card border border-white/10 text-white/80 hover:text-white px-6 py-2.5 rounded-xl font-medium transition-colors',
  ghost: 'text-white/60 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors',
  danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-6 py-2.5 rounded-xl font-medium transition-colors',
}

export default function Button({ children, variant = 'primary', className = '', loading, disabled, ...props }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`${variants[variant]} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center gap-2`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
