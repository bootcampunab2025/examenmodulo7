import { defineStore } from 'pinia'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase/config'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    // Inicializar listener de autenticación
    initAuthStateListener() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user
          this.loading = false
          resolve(user)
        })
      })
    },

    // Registro de usuario
    async registerUser(email, password) {
      console.log('Intentando registrar usuario:', email)
      this.loading = true
      this.error = null
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        console.log('Usuario registrado exitosamente:', userCredential.user)
        this.user = userCredential.user
        return { success: true, user: userCredential.user }
      } catch (error) {
        console.error('Error al registrar usuario:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Inicio de sesión
    async loginUser(email, password) {
      console.log('Intentando iniciar sesión:', email)
      this.loading = true
      this.error = null
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log('Usuario logueado exitosamente:', userCredential.user)
        this.user = userCredential.user
        return { success: true, user: userCredential.user }
      } catch (error) {
        console.error('Error al iniciar sesión:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Cerrar sesión
    async logoutUser() {
      this.loading = true
      this.error = null
      
      try {
        await signOut(auth)
        this.user = null
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Limpiar errores
    clearError() {
      this.error = null
    }
  }
})