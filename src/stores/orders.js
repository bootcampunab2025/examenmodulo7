import { useStore } from 'vuex'

export function useOrdersStore() {
  const store = useStore()

  return {
    get cart() {
      return store.state.orders.cart
    },
    get cartItems() {
      return store.getters['orders/cartItems']
    },
    get cartItemsCount() {
      return store.getters['orders/cartItemsCount']
    },
    get cartTotal() {
      return store.getters['orders/cartTotal']
    },
    get hasItemsInCart() {
      return store.getters['orders/hasItemsInCart']
    },
    get userCourses() {
      return store.getters['orders/userCourses']
    },
    get cartLoading() {
      return store.state.orders.cartLoading
    },
    get cartError() {
      return store.state.orders.cartError
    },
    get coursesLoading() {
      return store.state.orders.coursesLoading
    },
    get coursesError() {
      return store.state.orders.coursesError
    },
    ensureCart() {
      return store.dispatch('orders/ensureCart')
    },
    addCourseToCart(course) {
      return store.dispatch('orders/addCourseToCart', course)
    },
    removeCourseFromCart(courseId) {
      return store.dispatch('orders/removeCourseFromCart', courseId)
    },
    clearCart() {
      return store.dispatch('orders/clearCart')
    },
    checkoutCart() {
      return store.dispatch('orders/checkoutCart')
    },
    fetchUserCourses() {
      return store.dispatch('orders/fetchUserCourses')
    }
  }
}

export default useOrdersStore
