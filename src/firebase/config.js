import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import firebaseOptions from './options'

// Inicializar Firebase
const app = initializeApp(firebaseOptions)

// Inicializar servicios
export const auth = getAuth(app)
export const db = getFirestore(app)

// Debug: Verificar que Firebase esté conectado
console.log('Firebase inicializado correctamente')
console.log('Auth:', auth)
console.log('Firestore:', db)

export default app