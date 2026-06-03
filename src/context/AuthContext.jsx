import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../firebase/auth'
import { getUserDocument, createUserDocument, updateStreak } from '../firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          // Ensure user doc exists
          await createUserDocument(firebaseUser)
          // Update streak on every login
          await updateStreak(firebaseUser.uid)
          // Fetch fresh data
          const data = await getUserDocument(firebaseUser.uid)
          setUserData(data)
        } catch (err) {
          console.error('AuthContext error:', err)
          const data = await getUserDocument(firebaseUser.uid)
          setUserData(data)
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserDocument(user.uid)
      setUserData(data)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
