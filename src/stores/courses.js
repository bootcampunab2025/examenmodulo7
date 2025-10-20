import { defineStore } from 'pinia'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [],
    loading: false,
    error: null,
    // ahora guardamos la función real que onSnapshot devuelve (o null)
    _unsubscribe: null
  }),

  getters: {
    allCourses: (state) => state.courses,
    activeCourses: (state) => state.courses.filter(course => course.estado),
    getCourseByCode: (state) => (codigo) => state.courses.find(course => course.codigo === codigo),
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    hasListener: (state) => typeof state._unsubscribe === 'function'
  },

  actions: {
    // Inicializar listener en tiempo real (idempotente)
    initCoursesListener() {
      if (this._unsubscribe) {
        console.log('[Store:courses] listener already active')
        return this._unsubscribe
      }

      this.loading = true
      const coursesCollection = collection(db, 'courses')

      // onSnapshot devuelve una función unsubscribe que podemos guardar directamente
      const unsubscribe = onSnapshot(coursesCollection, (snapshot) => {
        this.courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        this.loading = false
      }, (error) => {
        this.error = error.message
        this.loading = false
      })

      // guardar la función directamente
      this._unsubscribe = unsubscribe

      console.log('[Store:courses] listener registered')
      return this._unsubscribe
    },

    // detener listener manualmente
    stopListener() {
      if (this._unsubscribe && typeof this._unsubscribe === 'function') {
        try {
          this._unsubscribe()
        } catch (e) {
          console.warn('[Store:courses] error unsubscribing', e)
        } finally {
          this._unsubscribe = null
          console.log('[Store:courses] listener stopped')
        }
      }
    },

    // one-time fetch
    async fetchCourses() {
      this.loading = true
      this.error = null
      try {
        const coursesCollection = collection(db, 'courses')
        const snapshot = await getDocs(coursesCollection)
        this.courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // add course (with optimistic local update if listener not active)
    async addCourse(courseData) {
      this.loading = true
      this.error = null
      console.log('[Store:courses] addCourse called ->', courseData)
      try {
        const coursesCollection = collection(db, 'courses')
        const docRef = await addDoc(coursesCollection, courseData)
        console.log('[Store:courses] addDoc success id=', docRef.id)

        // optimistic UI update only if listener is NOT active
        if (!this._unsubscribe) {
          this.courses.unshift({ id: docRef.id, ...courseData })
          console.log('[Store:courses] optimistic local push of new course', docRef.id)
        }

        return { success: true, id: docRef.id }
      } catch (error) {
        console.error('[Store:courses] addDoc error', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // update course (with optimistic local update if listener not active)
    async updateCourse(courseId, courseData) {
      this.loading = true
      this.error = null
      console.log('[Store:courses] updateCourse called ->', courseId, courseData)
      try {
        const courseRef = doc(db, 'courses', courseId)
        await updateDoc(courseRef, courseData)
        console.log('[Store:courses] updateDoc success', courseId)

        if (!this._unsubscribe) {
          const idx = this.courses.findIndex(c => c.id === courseId)
          if (idx !== -1) this.courses[idx] = { ...this.courses[idx], ...courseData }
          console.log('[Store:courses] optimistic local update applied', courseId)
        }

        return { success: true }
      } catch (error) {
        console.error('[Store:courses] updateDoc error', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // delete course (with optimistic local delete if listener not active)
    async deleteCourse(courseId) {
      this.loading = true
      this.error = null
      console.log('[Store:courses] deleteCourse called ->', courseId)
      try {
        const courseRef = doc(db, 'courses', courseId)
        await deleteDoc(courseRef)
        console.log('[Store:courses] deleteDoc success', courseId)

        if (!this._unsubscribe) {
          this.courses = this.courses.filter(c => c.id !== courseId)
          console.log('[Store:courses] optimistic local delete applied', courseId)
        }

        return { success: true }
      } catch (error) {
        console.error('[Store:courses] deleteDoc error', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
