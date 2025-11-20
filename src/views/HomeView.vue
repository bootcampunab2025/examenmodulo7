<template>
  <div class="home-container">
    <!-- Header -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Bienvenido a AdWeb Online</h1>
        <p class="hero-subtitle">
          Plataforma de cursos de programación y desarrollo web
        </p>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Loading -->
      <div v-if="coursesStore.isLoading" class="loading-section">
        <div class="loading-spinner-large"></div>
        <p class="loading-text">Cargando cursos...</p>
      </div>

      <!-- Error -->
      <div v-if="coursesStore.getError" class="error-section">
        <div class="error-content">
          <div>
            <h4>Error al cargar los cursos</h4>
            <p>{{ coursesStore.getError }}</p>
          </div>
        </div>
      </div>

      <!-- Cursos -->
      <div v-if="!coursesStore.isLoading && !coursesStore.getError">
        <!-- Filtros -->
        <div class="filters-section">
          <div class="filters-container">
            <h3 class="filters-title">
              Filtrar cursos:
            </h3>
            <div class="filter-buttons">
              <button 
                v-for="option in filterOptions"
                :key="option.value"
                :class="['filter-btn', { active: filterType === option.value }]"
                @click="filterType = option.value"
              >
                {{ option.text }}
              </button>
            </div>
          </div>
        </div>

        <!-- Carrito -->
        <div v-if="authStore.isAuthenticated" class="cart-section">
          <div class="cart-header">
            <h3>Tu carrito</h3>
            <span class="badge bg-primary rounded-pill">
              {{ ordersStore.cartItemsCount }} curso(s)
            </span>
          </div>

          <p class="cart-helper" v-if="!ordersStore.hasItemsInCart">
            Aún no agregas cursos. Pulsa "Inscribirme" para sumarlos aquí.
          </p>

          <ul class="cart-list" v-else>
            <li v-for="item in ordersStore.cartItems" :key="item.courseId" class="cart-item">
              <div>
                <strong>{{ item.nombre }}</strong>
                <p class="mb-0 text-muted">{{ item.codigo }}</p>
              </div>
              <div class="cart-item-actions">
                <span class="fw-semibold">${{ item.precio.toLocaleString('es-CL') }}</span>
                <button class="btn btn-link btn-sm text-danger" @click="removeItem(item.courseId)">
                  Quitar
                </button>
              </div>
            </li>
          </ul>

          <div class="cart-actions">
            <div>
              <p class="mb-1 text-muted">Total estimado</p>
              <h4 class="mb-0">${{ ordersStore.cartTotal.toLocaleString('es-CL') }}</h4>
            </div>
            <div class="d-flex gap-2 flex-column flex-sm-row">
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="ordersStore.clearCart()"
                :disabled="!ordersStore.hasItemsInCart"
              >
                Vaciar
              </button>
              <button
                class="btn btn-success"
                type="button"
                @click="handleCheckout"
                :disabled="checkoutLoading || !ordersStore.hasItemsInCart"
              >
                <span v-if="checkoutLoading" class="spinner-border spinner-border-sm me-2"></span>
                Finalizar compra
              </button>
            </div>
          </div>

          <div v-if="cartMessage" class="alert mt-3" :class="`alert-${cartMessage.type}`">
            {{ cartMessage.text }}
          </div>
        </div>

        <!-- Grid de cursos -->
        <div v-if="filteredCourses.length > 0" class="courses-grid">
          <CourseCard 
            v-for="course in filteredCourses" 
            :key="course.id"
            :course="course"
            @enroll="handleEnroll"
          />
        </div>

        <!-- No hay cursos -->
        <div v-else class="no-courses-section">
          <div class="no-courses-content">
            <h4 class="no-courses-title">No hay cursos disponibles</h4>
            <p class="no-courses-text">
              {{ filterType === 'active' ? 'No hay cursos activos en este momento.' : 'No se encontraron cursos.' }}
            </p>
            <button v-if="authStore.isAdmin" class="add-course-btn" @click="$router.push('/admin')">
              Agregar Cursos
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '../stores/courses'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'
import CourseCard from '../components/CourseCard.vue'

const coursesStore = useCoursesStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const router = useRouter()

// Variables reactivas
const filterType = ref('all')
const unsubscribe = ref(null)
const cartMessage = ref(null)
const checkoutLoading = ref(false)

// Opciones de filtro
const filterOptions = [
  { text: 'Todos', value: 'all' },
  { text: 'Solo Activos', value: 'active' }
]

// Computed para filtrar cursos
const filteredCourses = computed(() => {
  if (filterType.value === 'active') {
    return coursesStore.activeCourses
  }
  return coursesStore.allCourses
})

// Lifecycle hooks
onMounted(async () => {
  // Inicializar listener en tiempo real
  const listener = await coursesStore.initCoursesListener()
  if (typeof listener === 'function') {
    unsubscribe.value = listener
  }
})

onUnmounted(() => {
  // Limpiar listener
  if (typeof unsubscribe.value === 'function') {
    unsubscribe.value()
  }
})

watch(
  () => authStore.isAuthenticated,
  async (loggedIn) => {
    if (loggedIn) {
      try {
        await ordersStore.ensureCart()
        await ordersStore.fetchUserCourses()
      } catch (error) {
        cartMessage.value = { type: 'danger', text: 'No se pudo preparar tu carrito.' }
      }
    } else {
      cartMessage.value = null
    }
  },
  { immediate: true }
)

// CTA para inscribirse
const handleEnroll = async (course) => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  const result = await ordersStore.addCourseToCart(course)

  if (result?.success) {
    if (result.duplicated) {
      cartMessage.value = { type: 'info', text: 'Este curso ya está en tu carrito.' }
    } else {
      cartMessage.value = { type: 'success', text: 'Curso agregado al carrito.' }
    }
  } else {
    cartMessage.value = { type: 'danger', text: result?.error || 'No se pudo agregar el curso.' }
  }
}

const handleCheckout = async () => {
  if (!ordersStore.hasItemsInCart) {
    cartMessage.value = { type: 'info', text: 'Agrega cursos antes de finalizar.' }
    return
  }

  checkoutLoading.value = true
  const result = await ordersStore.checkoutCart()
  checkoutLoading.value = false

  if (result?.success) {
    cartMessage.value = { type: 'success', text: 'Compra finalizada. Revisa "Mis Cursos".' }
    router.push({ name: 'my-courses' })
  } else {
    cartMessage.value = { type: 'danger', text: result?.error || 'No se pudo completar la compra.' }
  }
}

const removeItem = async (id) => {
  await ordersStore.removeCourseFromCart(id)
}
</script>

<style scoped>
/* Container Principal */
.home-container {
  min-height: 90vh;
  background: #f8f9fa;
}

/* Hero Section */
.hero-section {
  background: white;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}



.hero-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1565c0, #1976d2, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(33, 150, 243, 0.1);
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #546e7a;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

/* Loading Section */
.loading-section {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(33, 150, 243, 0.2);
  border-radius: 50%;
  border-top-color: #2196f3;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.2rem;
  color: #1976d2;
  font-weight: 500;
}

/* Error Section */
.error-section {
  margin: 2rem 0;
}

.error-content {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.1);
}

.error-content h4 {
  color: #c62828;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.error-content p {
  color: #d32f2f;
  margin: 0;
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  margin-bottom: 3rem;
}

.filters-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}

.filters-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1565c0;
  margin-bottom: 1.5rem;
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: rgba(33, 150, 243, 0.1);
  border: 2px solid #2196f3;
  color: #1976d2;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.filter-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.2);
}

.filter-btn.active {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
}

/* Courses Grid */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.cart-section {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cart-helper {
  margin-bottom: 0;
  color: #607d8b;
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f3f5;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

/* No Courses Section */
.no-courses-section {
  text-align: center;
  padding: 4rem 2rem;
}

.no-courses-content {
  background: white;
  border-radius: 8px;
  padding: 3rem 2rem;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}



.no-courses-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1565c0;
  margin-bottom: 1rem;
}

.no-courses-text {
  color: #546e7a;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.add-course-btn {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
}

.add-course-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .content-wrapper {
    padding: 0 1rem 3rem;
  }
  
  .filters-container {
    padding: 1.5rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .no-courses-content {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-icon {
    font-size: 3rem;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .filter-btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }

  .cart-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>