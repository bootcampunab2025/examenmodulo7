import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  limit
} from 'firebase/firestore'
import { db } from '@/firebase/config'

const state = () => ({
  cart: null,
  cartLoading: false,
  cartError: null,
  userCourses: [],
  coursesLoading: false,
  coursesError: null
})

const getters = {
  cartItems: (state) => state.cart?.items || [],
  cartItemsCount: (state, getters) => getters.cartItems.length,
  cartTotal: (state, getters) => getters.cartItems.reduce((sum, item) => sum + (item.precio || 0), 0),
  hasItemsInCart: (state, getters) => getters.cartItemsCount > 0,
  userCourses: (state) => state.userCourses
}

const mutations = {
  setCart(state, cart) {
    state.cart = cart
  },
  setCartLoading(state, value) {
    state.cartLoading = value
  },
  setCartError(state, message) {
    state.cartError = message
  },
  setUserCourses(state, courses) {
    state.userCourses = courses
  },
  setCoursesLoading(state, value) {
    state.coursesLoading = value
  },
  setCoursesError(state, message) {
    state.coursesError = message
  }
}

async function ensureUser({ rootGetters }) {
  const user = rootGetters['auth/currentUser']
  if (!user) {
    throw new Error('Debes iniciar sesión para usar el carrito')
  }
  return user
}

const actions = {
  async ensureCart({ state, commit, rootGetters }) {
    const user = await ensureUser({ rootGetters })

    if (state.cart && state.cart.userId === user.uid && state.cart.status === 'pending') {
      return state.cart
    }

    commit('setCartLoading', true)
    commit('setCartError', null)

    try {
      const cartQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        where('status', '==', 'pending'),
        limit(1)
      )
      const snapshot = await getDocs(cartQuery)

      if (snapshot.empty) {
        const cartData = {
          userId: user.uid,
          status: 'pending',
          items: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        const docRef = await addDoc(collection(db, 'orders'), cartData)
        const newCart = { ...cartData, id: docRef.id, items: [] }
        commit('setCart', newCart)
        return { ...newCart, id: docRef.id }
      }

      const docSnap = snapshot.docs[0]
      const cart = { id: docSnap.id, ...docSnap.data() }
      commit('setCart', cart)
      return cart
    } catch (error) {
      console.error('[orders] ensureCart error', error)
      commit('setCartError', error?.message || 'No fue posible obtener el carrito')
      throw error
    } finally {
      commit('setCartLoading', false)
    }
  },

  async addCourseToCart({ commit, dispatch }, course) {
    if (!course || !course.id) {
      return { success: false, error: 'Curso inválido' }
    }

    const cart = await dispatch('ensureCart')
    const items = Array.isArray(cart.items) ? [...cart.items] : []

    if (items.some(item => item.courseId === course.id)) {
      return { success: true, duplicated: true }
    }

    const newItem = {
      courseId: course.id,
      nombre: course.nombre,
      codigo: course.codigo,
      precio: Number(course.precio) || 0
    }
    items.push(newItem)

    try {
      await updateDoc(doc(db, 'orders', cart.id), {
        items,
        updatedAt: serverTimestamp()
      })
      commit('setCart', { ...cart, items })
      return { success: true }
    } catch (error) {
      console.error('[orders] addCourseToCart error', error)
      commit('setCartError', error?.message || 'No fue posible agregar el curso al carrito')
      return { success: false, error: error?.message }
    }
  },

  async removeCourseFromCart({ state, commit }, courseId) {
    if (!state.cart?.id) {
      return
    }

    const items = (state.cart.items || []).filter(item => item.courseId !== courseId)

    try {
      await updateDoc(doc(db, 'orders', state.cart.id), {
        items,
        updatedAt: serverTimestamp()
      })
      commit('setCart', { ...state.cart, items })
    } catch (error) {
      console.error('[orders] removeCourseFromCart error', error)
      commit('setCartError', 'No fue posible quitar el curso del carrito')
    }
  },

  async clearCart({ state, commit }) {
    if (!state.cart?.id) {
      return
    }

    try {
      await updateDoc(doc(db, 'orders', state.cart.id), {
        items: [],
        updatedAt: serverTimestamp()
      })
      commit('setCart', { ...state.cart, items: [] })
    } catch (error) {
      console.error('[orders] clearCart error', error)
      commit('setCartError', 'No fue posible limpiar el carrito')
    }
  },

  async checkoutCart({ state, commit, dispatch, rootGetters }) {
    if (!state.cart?.id) {
      return { success: false, error: 'No hay carrito activo' }
    }

    if (!state.cart.items || state.cart.items.length === 0) {
      return { success: false, error: 'Agrega cursos antes de finalizar' }
    }

    const user = await ensureUser({ rootGetters })
    const total = state.cart.items.reduce((sum, item) => sum + (item.precio || 0), 0)

    try {
      await updateDoc(doc(db, 'orders', state.cart.id), {
        status: 'completed',
        total,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      const coursesCollection = collection(db, 'userCourses', user.uid, 'courses')
      for (const item of state.cart.items) {
        await addDoc(coursesCollection, {
          ...item,
          purchasedAt: serverTimestamp(),
          orderId: state.cart.id,
          userId: user.uid
        })
      }

      commit('setCart', null)
      await dispatch('ensureCart')
      await dispatch('fetchUserCourses')

      return { success: true, total }
    } catch (error) {
      console.error('[orders] checkoutCart error', error)
      commit('setCartError', error?.message || 'No fue posible finalizar la compra')
      return { success: false, error: error?.message }
    }
  },

  async fetchUserCourses({ commit, rootGetters }) {
    const user = await ensureUser({ rootGetters })

    commit('setCoursesLoading', true)
    commit('setCoursesError', null)

    try {
      const q = collection(db, 'userCourses', user.uid, 'courses')
      const snapshot = await getDocs(q)
      const courses = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      commit('setUserCourses', courses)
      return courses
    } catch (error) {
      console.error('[orders] fetchUserCourses error', error)
      commit('setCoursesError', error?.message || 'No fue posible obtener tus cursos')
      return []
    } finally {
      commit('setCoursesLoading', false)
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
