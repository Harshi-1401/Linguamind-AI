import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserDocument, addXP } from '../firebase/firestore'

export function useUserData() {
  const { userData, refreshUserData } = useAuth()

  const updateData = async (data) => {
    const { user } = useAuth()
    if (!user) return
    await updateUserDocument(user.uid, data)
    await refreshUserData()
  }

  return { userData, updateData }
}
