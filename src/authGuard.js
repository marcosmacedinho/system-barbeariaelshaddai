// src/authGuard.js
import { auth } from '@/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'

export function initializeAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe() // Limpar o listener
        resolve(user)
      },
      reject
    )
  })
}
