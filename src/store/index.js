import { createStore } from 'vuex'
import auth from './modules/auth'
import courses from './modules/courses'

const store = createStore({
  modules: {
    auth,
    courses
  }
})

export default store
