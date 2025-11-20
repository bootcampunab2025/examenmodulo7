<template>
  <div class="my-courses-container">
    <header class="mb-4 text-center">
      <h1 class="display-6">Mis Cursos</h1>
      <p class="text-muted mb-0">Revisa los cursos que has adquirido.</p>
    </header>

    <div v-if="ordersStore.coursesLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Cargando tus cursos…</p>
    </div>

    <BAlert v-else-if="ordersStore.coursesError" variant="danger">
      {{ ordersStore.coursesError }}
    </BAlert>

    <BCard v-else>
      <template v-if="courses.length">
        <BTable :items="tableItems" :fields="fields" responsive>
          <template #cell(precio)="data">
            ${{ data.item.precio.toLocaleString('es-CL') }}
          </template>
          <template #cell(purchasedAt)="data">
            {{ formatDate(data.item.purchasedAt) }}
          </template>
        </BTable>
      </template>
      <div v-else class="text-center py-5">
        <p class="text-muted">Aún no has comprado cursos. Regresa al catálogo y agrega algunos al carrito.</p>
        <button class="btn btn-primary" @click="$router.push('/')">Ir al catálogo</button>
      </div>
    </BCard>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BAlert, BCard, BTable } from 'bootstrap-vue-next'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

const ordersStore = useOrdersStore()
const authStore = useAuthStore()
const router = useRouter()

const fields = [
  { key: 'nombre', label: 'Curso' },
  { key: 'codigo', label: 'Código' },
  { key: 'precio', label: 'Precio' },
  { key: 'purchasedAt', label: 'Fecha de compra' }
]

const courses = computed(() => ordersStore.userCourses)
const tableItems = computed(() => courses.value)

const ensureData = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/my-courses' } })
    return
  }
  await ordersStore.fetchUserCourses()
}

const formatDate = (timestamp) => {
  if (!timestamp) return '—'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return '—'
  }
}

onMounted(() => {
  ensureData()
})

watch(
  () => authStore.isAuthenticated,
  (loggedIn) => {
    if (loggedIn) {
      ensureData()
    }
  }
)
</script>

<style scoped>
.my-courses-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}
</style>
