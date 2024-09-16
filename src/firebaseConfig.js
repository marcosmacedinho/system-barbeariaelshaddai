// firebaseConfig.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'
import { useAlert } from './stores/alert'

const firebaseConfig = {
  apiKey: 'AIzaSyDie_L4h6W_8oXNj3tR8KfV7fw-ay7SfAE',
  authDomain: 'barbearia-el-shaddai.firebaseapp.com',
  projectId: 'barbearia-el-shaddai',
  storageBucket: 'barbearia-el-shaddai.appspot.com',
  messagingSenderId: '691619138229',
  appId: '1:691619138229:web:b86e802bcb0580caec0cfc'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence).catch((error) => {
  useAlert().show('Erro ao configurar a persistência: ', 500, error)
})

onAuthStateChanged(auth, (user) => {
  if (user) {
    useAlert().show('Usuário autenticado', 200)
  } else {
    useAlert().show('Nenhum usuário autenticado', 500)
  }
})

export { db, auth }
