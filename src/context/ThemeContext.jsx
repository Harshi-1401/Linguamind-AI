import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('lm-theme') || 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.style.background = '#020408'
      document.body.style.color = '#ffffff'
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
      document.body.style.background = '#f0f4ff'
      document.body.style.color = '#0a0a1a'
    }
    localStorage.setItem('lm-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
