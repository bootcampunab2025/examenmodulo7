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
    error: null
  }),

  getters: {
    allCourses: (state) => state.courses,
    activeCourses: (state) => state.courses.filter(course => course.estado),
    getCourseByCode: (state) => (codigo) => state.courses.find(course => course.codigo === codigo),
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    // Inicializar listener en tiempo real
    initCoursesListener() {
      this.loading = true
      
      const coursesCollection = collection(db, 'courses')
      
      return onSnapshot(coursesCollection, (snapshot) => {
        this.courses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        this.loading = false
      }, (error) => {
        this.error = error.message
        this.loading = false
      })
    },

    // Obtener todos los cursos (una sola vez)
    async fetchCourses() {
      this.loading = true
      this.error = null
      
      try {
        const coursesCollection = collection(db, 'courses')
        const snapshot = await getDocs(coursesCollection)
        
        this.courses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Agregar nuevo curso
    async addCourse(courseData) {
      this.loading = true
      this.error = null
      
      try {
        const coursesCollection = collection(db, 'courses')
        const docRef = await addDoc(coursesCollection, courseData)
        
        return { success: true, id: docRef.id }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Actualizar curso
    async updateCourse(courseId, courseData) {
      this.loading = true
      this.error = null
      
      try {
        const courseRef = doc(db, 'courses', courseId)
        await updateDoc(courseRef, courseData)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Eliminar curso
    async deleteCourse(courseId) {
      this.loading = true
      this.error = null
      
      try {
        const courseRef = doc(db, 'courses', courseId)
        await deleteDoc(courseRef)
        
        return { success: true }
      } catch (error) {
        console.error('Error al eliminar curso:', error)
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