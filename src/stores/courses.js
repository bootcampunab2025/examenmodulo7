import { useStore } from 'vuex'

export function useCoursesStore() {
  const store = useStore()

  return {
    get courses() {
      return store.state.courses.courses
    },
    get isLoading() {
      return store.getters['courses/isLoading']
    },
    get getError() {
      return store.getters['courses/getError']
    },
    get allCourses() {
      return store.getters['courses/allCourses']
    },
    get activeCourses() {
      return store.getters['courses/activeCourses']
    },
    get hasListener() {
      return store.getters['courses/hasListener']
    },
    getCourseByCode(codigo) {
      const getter = store.getters['courses/getCourseByCode']
      return typeof getter === 'function' ? getter(codigo) : undefined
    },
    initCoursesListener() {
      return store.dispatch('courses/initCoursesListener')
    },
    stopListener() {
      return store.dispatch('courses/stopListener')
    },
    fetchCourses() {
      return store.dispatch('courses/fetchCourses')
    },
    addCourse(courseData) {
      return store.dispatch('courses/addCourse', courseData)
    },
    updateCourse(courseId, courseData) {
      return store.dispatch('courses/updateCourse', { courseId, courseData })
    },
    deleteCourse(courseId) {
      return store.dispatch('courses/deleteCourse', courseId)
    },
    clearError() {
      return store.dispatch('courses/clearError')
    }
  }
}

export default useCoursesStore
