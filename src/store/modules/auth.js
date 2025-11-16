import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/firebase/config'

let authInitPromise = null

const state = () => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,
  justLoggedInAt: null,
  sessionOrigin: null,
  lastToastTs: 0
})

const getters = {
  isAuthenticated: (state) => !!state.user,
  currentUser: (state) => state.user,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  isAuthReady: (state) => state.authReady
}

const mutations = {
  setUser(state, user) {
    state.user = user
  },
  setLoading(state, value) {
    state.loading = value
  },
  setError(state, message) {
    state.error = message
  },
  setAuthReady(state, value) {
    state.authReady = value
  },
  setJustLoggedInAt(state, timestamp) {
    state.justLoggedInAt = timestamp
  },
  setSessionOrigin(state, origin) {
    state.sessionOrigin = origin
  },
  setLastToastTs(state, timestamp) {
    state.lastToastTs = timestamp
  },
  clearError(state) {
    state.error = null
  },
  resetJustLogged(state) {
    state.justLoggedInAt = null
  }
}

const actions = {
  initAuthStateListener({ state, commit }) {
    if (authInitPromise) {
      return authInitPromise
    }

    commit('setLoading', true)

    authInitPromise = new Promise((resolve) => {
      let firstEmission = true

      onAuthStateChanged(auth, (user) => {
        const prevUser = state.user
        commit('setUser', user)

        if (prevUser == null && user != null) {
          const uid = user.uid
          const currentSignIn = user.metadata?.lastSignInTime || ''
          const key = `welcomed:${uid}`
          const lastWelcomed = typeof window !== 'undefined'
            ? window.localStorage.getItem(key)
            : null

          if (lastWelcomed !== currentSignIn) {
            commit('setSessionOrigin', 'onAuthStateChanged')
            const now = Date.now()
            if (now - state.lastToastTs > 1000) {
              commit('setJustLoggedInAt', now)
              commit('setLastToastTs', now)
            }
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, currentSignIn)
            }
          }
        }

        if (firstEmission) {
          commit('setAuthReady', true)
          commit('setLoading', false)
          firstEmission = false
          resolve(user)
        }
      })
    })

    return authInitPromise
  },

  async registerUser({ commit }, { email, password }) {
    commit('setLoading', true)
    commit('clearError')

    try {
      commit('setSessionOrigin', 'manual')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      commit('setUser', userCredential.user)
      return { success: true, user: userCredential.user }
    } catch (error) {
      const message = error?.message || 'Ocurrió un error al registrar usuario'
      commit('setError', message)
      return { success: false, error: message }
    } finally {
      commit('setLoading', false)
    }
  },

  async loginUser({ commit }, { email, password }) {
    commit('setLoading', true)
    commit('clearError')

    try {
      commit('setSessionOrigin', 'manual')
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      commit('setUser', userCredential.user)
      return { success: true, user: userCredential.user }
    } catch (error) {
      const message = error?.message || 'Ocurrió un error al iniciar sesión'
      commit('setError', message)
      return { success: false, error: message }
    } finally {
      commit('setLoading', false)
    }
  },

  async logoutUser({ commit }) {
    commit('setLoading', true)
    commit('clearError')

    try {
      await signOut(auth)
      commit('setUser', null)
      commit('setSessionOrigin', null)
      commit('resetJustLogged')
      return { success: true }
    } catch (error) {
      const message = error?.message || 'Ocurrió un error al cerrar sesión'
      commit('setError', message)
      return { success: false, error: message }
    } finally {
      commit('setLoading', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
