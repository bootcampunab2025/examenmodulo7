import { useStore } from 'vuex'

export function useAuthStore() {
  const store = useStore()

  return {
    get user() {
      return store.state.auth.user
    },
    get loading() {
      return store.state.auth.loading
    },
    get error() {
      return store.state.auth.error
    },
    get authReady() {
      return store.state.auth.authReady
    },
    get justLoggedInAt() {
      return store.state.auth.justLoggedInAt
    },
    get sessionOrigin() {
      return store.state.auth.sessionOrigin
    },
    get isAuthReady() {
      return store.getters['auth/isAuthReady']
    },
    get isAuthenticated() {
      return store.getters['auth/isAuthenticated']
    },
    get currentUser() {
      return store.getters['auth/currentUser']
    },
    get isLoading() {
      return store.getters['auth/isLoading']
    },
    get getError() {
      return store.getters['auth/getError']
    },
    initAuthStateListener() {
      return store.dispatch('auth/initAuthStateListener')
    },
    registerUser(email, password) {
      return store.dispatch('auth/registerUser', { email, password })
    },
    loginUser(email, password) {
      return store.dispatch('auth/loginUser', { email, password })
    },
    logoutUser() {
      return store.dispatch('auth/logoutUser')
    },
    clearError() {
      store.commit('auth/clearError')
    },
    resetJustLogged() {
      store.commit('auth/resetJustLogged')
    }
  }
}

export default useAuthStore