import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

const SEEDED_ADMIN_EMAILS = new Set([
  'admin.catalogo@adweb.com',
  'admin.ventas@adweb.com'
])

const enforceSeedAdminRole = (profile) => {
  if (!profile) return profile
  const normalizedEmail = (profile.email || '').toLowerCase()
  if (SEEDED_ADMIN_EMAILS.has(normalizedEmail) && profile.role !== 'admin') {
    return { ...profile, role: 'admin', roleSource: 'seeded' }
  }
  return profile
}

let authInitPromise = null

const state = () => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,
  justLoggedInAt: null,
  sessionOrigin: null,
  lastToastTs: 0,
  profile: null
})

const getters = {
  isAuthenticated: (state) => !!state.user,
  currentUser: (state) => state.user,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  isAuthReady: (state) => state.authReady,
  currentProfile: (state) => state.profile,
  currentRole: (state) => state.profile?.role || 'user',
  isAdmin: (_, getters) => getters.currentRole === 'admin'
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
  },
  setProfile(state, profile) {
    state.profile = profile
  }
}

const actions = {
  async fetchUserProfile({ commit }, user) {
    if (!user) {
      commit('setProfile', null)
      return null
    }

    const profileRef = doc(db, 'userProfiles', user.uid)
    const snapshot = await getDoc(profileRef)

    if (!snapshot.exists()) {
      const profileData = {
        uid: user.uid,
        email: (user.email || '').toLowerCase(),
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(profileRef, profileData)
      const seededProfile = enforceSeedAdminRole(profileData)
      commit('setProfile', seededProfile)
      return seededProfile
    }

    const existing = enforceSeedAdminRole(snapshot.data())
    commit('setProfile', existing)
    return existing
  },

  async updateUserRole(_, { uid, role }) {
    const profileRef = doc(db, 'userProfiles', uid)
    await updateDoc(profileRef, {
      role,
      updatedAt: serverTimestamp()
    })
  },

  initAuthStateListener({ state, commit, dispatch }) {
    if (authInitPromise) {
      return authInitPromise
    }

    commit('setLoading', true)

    authInitPromise = new Promise((resolve) => {
      let firstEmission = true

      onAuthStateChanged(auth, async (user) => {
        const prevUser = state.user
        commit('setUser', user)

        if (user) {
          await dispatch('fetchUserProfile', user)
        } else {
          commit('setProfile', null)
        }

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
      const user = userCredential.user
      commit('setUser', user)
      const profileDoc = {
        uid: user.uid,
        email: (user.email || email).toLowerCase(),
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(doc(db, 'userProfiles', user.uid), profileDoc)
      const seededProfile = enforceSeedAdminRole({ uid: user.uid, email: (user.email || email).toLowerCase(), role: 'user' })
      commit('setProfile', seededProfile)
      return { success: true, user }
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
      await dispatch('fetchUserProfile', userCredential.user)
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
      commit('setProfile', null)
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
