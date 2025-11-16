import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore'
import { db } from '@/firebase/config'

const state = () => ({
  courses: [],
  loading: false,
  error: null,
  unsubscribe: null
})

const getters = {
  allCourses: (state) => state.courses,
  activeCourses: (state) => state.courses.filter(course => course.estado),
  getCourseByCode: (state) => (codigo) => state.courses.find(course => course.codigo === codigo),
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  hasListener: (state) => typeof state.unsubscribe === 'function'
}

const mutations = {
  setCourses(state, courses) {
    state.courses = courses
  },
  setLoading(state, value) {
    state.loading = value
  },
  setError(state, message) {
    state.error = message
  },
  setUnsubscribe(state, fn) {
    state.unsubscribe = fn
  },
  addCourseLocal(state, course) {
    state.courses = [course, ...state.courses]
  },
  updateCourseLocal(state, { id, data }) {
    const idx = state.courses.findIndex(course => course.id === id)
    if (idx !== -1) {
      state.courses.splice(idx, 1, { ...state.courses[idx], ...data })
    }
  },
  deleteCourseLocal(state, courseId) {
    state.courses = state.courses.filter(course => course.id !== courseId)
  },
  clearError(state) {
    state.error = null
  }
}

const actions = {
  initCoursesListener({ state, commit }) {
    if (state.unsubscribe) {
      return state.unsubscribe
    }

    commit('setLoading', true)

    const coursesCollection = collection(db, 'courses')

    const unsubscribe = onSnapshot(coursesCollection, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      commit('setCourses', list)
      commit('setLoading', false)
    }, (error) => {
      commit('setError', error?.message || 'Error al escuchar los cursos')
      commit('setLoading', false)
    })

    commit('setUnsubscribe', unsubscribe)
    return unsubscribe
  },

  stopListener({ state, commit }) {
    if (state.unsubscribe && typeof state.unsubscribe === 'function') {
      try {
        state.unsubscribe()
      } finally {
        commit('setUnsubscribe', null)
      }
    }
  },

  async fetchCourses({ commit }) {
    commit('setLoading', true)
    commit('clearError')

    try {
      const coursesCollection = collection(db, 'courses')
      const snapshot = await getDocs(coursesCollection)
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      commit('setCourses', list)
    } catch (error) {
      commit('setError', error?.message || 'Error al obtener los cursos')
    } finally {
      commit('setLoading', false)
    }
  },

  async addCourse({ state, commit }, courseData) {
    commit('setLoading', true)
    commit('clearError')

    try {
      const coursesCollection = collection(db, 'courses')
      const docRef = await addDoc(coursesCollection, courseData)

      if (!state.unsubscribe) {
        commit('addCourseLocal', { id: docRef.id, ...courseData })
      }

      return { success: true, id: docRef.id }
    } catch (error) {
      const message = error?.message || 'Error al agregar el curso'
      commit('setError', message)
      return { success: false, error: message }
    } finally {
      commit('setLoading', false)
    }
  },

  async updateCourse({ state, commit }, { courseId, courseData }) {
    commit('setLoading', true)
    commit('clearError')

    try {
      const courseRef = doc(db, 'courses', courseId)
      await updateDoc(courseRef, courseData)

      if (!state.unsubscribe) {
        commit('updateCourseLocal', { id: courseId, data: courseData })
      }

      return { success: true }
    } catch (error) {
      const message = error?.message || 'Error al actualizar el curso'
      commit('setError', message)
      return { success: false, error: message }
    } finally {
      commit('setLoading', false)
    }
  },

  async deleteCourse({ state, commit }, courseId) {
    commit('setLoading', true)
    commit('clearError')

    try {
      const courseRef = doc(db, 'courses', courseId)
      await deleteDoc(courseRef)

      if (!state.unsubscribe) {
        commit('deleteCourseLocal', courseId)
      }

      return { success: true }
    } catch (error) {
      const message = error?.message || 'Error al eliminar el curso'
      commit('setError', message)
      return { success: false, error: message }
    } finally {
      commit('setLoading', false)
    }
  },

  clearError({ commit }) {
    commit('clearError')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
