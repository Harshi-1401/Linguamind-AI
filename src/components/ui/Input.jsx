export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-white/60 text-sm font-medium">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none
            focus:border-neon-blue/50 transition-all duration-200 text-sm
            ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/50' : 'border-white/10'}
            ${className}`}
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
