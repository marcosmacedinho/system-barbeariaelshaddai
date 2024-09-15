import { ref } from 'vue'
import { auth, db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

const user = ref(null)

async function fetchUserInfo() {
  if (auth.currentUser) {
    const userDocRef = doc(db, 'users', auth.currentUser.uid)
    const userDoc = await getDoc(userDocRef)
    if (userDoc.exists()) {
      user.value = userDoc.data()
      // Ensure that lastLogin is a Firestore Timestamp
      if (user.value.lastLogin) {
        user.value.lastLogin = user.value.lastLogin.toDate().toLocaleDateString()
      }
    }
  }
}

export function useUser() {
  return {
    user,
    fetchUserInfo
  }
}
