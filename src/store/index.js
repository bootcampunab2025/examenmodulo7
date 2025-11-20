import { createStore } from 'vuex'
import auth from './modules/auth'
import courses from './modules/courses'
import orders from './modules/orders'

const store = createStore({
  modules: {
    auth,
    courses,
    orders
  }
})

export default store
