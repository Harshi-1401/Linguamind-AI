import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import { createUserDocument } from './firestore'

const googleProvider = new GoogleAuthProvider()

export const registerUser = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  await createUserDocument(cred.user)
  return cred.user
}

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const loginWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider)
  await createUserDocument(cred.user)
  return cred.user
}

export const logoutUser = () => signOut(auth)

export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)
