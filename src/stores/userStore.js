// src/stores/userStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    const lastLogin = ref('');

    async function fetchUserInfo() {
        if (auth.currentUser) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                user.value = userDoc.data();
                if (user.value.lastLogin) {
                    lastLogin.value = user.value.lastLogin.toDate().toLocaleDateString();
                }
            }
        }
    }

    return { user, lastLogin, fetchUserInfo };
});
