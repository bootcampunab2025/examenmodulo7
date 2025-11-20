<template>
  <div>
    <BRow class="mb-4">
      <BCol>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1">Administración de Cursos</h1>
            <p class="text-muted mb-0">Gestiona los cursos de AdWeb Online</p>
          </div>

          <div class="d-flex gap-2">
            <BButton
              variant="success"
              @click="initializeCourses"
              :disabled="coursesStore.isLoading"
              v-if="coursesStore.allCourses.length === 0"
            >
              🚀 Agregar Cursos Iniciales
            </BButton>

            <BButton
              variant="primary"
              @click="openAddForm"
              :disabled="coursesStore.isLoading"
              data-cy="open-add-form-btn"
              @hidden="resetForm"
            >
              Agregar Curso
            </BButton>
          </div>
        </div>
      </BCol>
    </BRow>

    <div v-if="coursesStore.isLoading" class="text-center my-5">
      <BSpinner variant="primary" class="me-2"></BSpinner>
      <span>Cargando cursos...</span>
    </div>

    <BAlert v-if="coursesStore.getError" variant="danger" class="mb-4">
      Error: {{ coursesStore.getError }}
    </BAlert>

    <BAlert
      v-if="hasIncompleteCourses"
      variant="warning"
      class="mb-4 d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-3"
    >
      <div>
        <strong>{{ incompleteCourses.length }} curso(s) incompletos detectados.</strong>
        <p class="mb-0 small text-muted">
          Algunos registros no tienen nombre o imagen. Puedes eliminarlos para limpiar la tabla.
        </p>
      </div>
      <BButton
        variant="warning"
        class="text-nowrap"
        @click="removeIncompleteCourses"
        :disabled="isCleaningIncomplete"
      >
        <span v-if="isCleaningIncomplete" class="spinner-border spinner-border-sm me-2"></span>
        Eliminar cursos vacíos
      </BButton>
    </BAlert>

    <BCard v-if="showRoleManager" class="mb-4">
      <h2 class="h5 mb-3">Gestión de Roles</h2>
      <p class="text-muted small mb-3">Asigna permisos de administrador ingresando el correo registrado del usuario.</p>
      <form @submit.prevent="assignAdminRole" class="d-flex flex-column flex-md-row gap-2 align-items-md-center">
        <input
          v-model.trim="roleUpdateEmail"
          type="email"
          class="form-control"
          placeholder="correo@dominio.com"
          required
        />
        <BButton type="submit" variant="dark" :disabled="roleUpdateLoading">
          <span v-if="roleUpdateLoading" class="spinner-border spinner-border-sm me-2"></span>
          Conceder administrador
        </BButton>
      </form>
      <BAlert
        v-if="roleUpdateStatus"
        :variant="roleUpdateStatus.type"
        class="mt-3 mb-0"
        dismissible
        @dismissed="roleUpdateStatus = null"
      >
        {{ roleUpdateStatus.message }}
      </BAlert>
    </BCard>

    <BCard v-if="!coursesStore.isLoading && !coursesStore.getError">
      <BTable
        :items="coursesStore.allCourses"
        :fields="tableFields"
        striped
        hover
        responsive
        class="mb-0"
      >
     <template #cell(nombre)="data">
        {{ hasText(data.item.nombre) ? data.item.nombre : 'Curso sin título' }}
      </template>

     <template #cell(img)="data">
  <img
    v-if="hasText(data.item.img)"
    :src="data.item.img"
    :alt="data.item.nombre || 'Curso sin título'"
    style="width: 50px; height: 50px; object-fit: contain; cursor: pointer;"
    class="rounded"
    @click="openImageModal(data.item)"
  />
  <div
    v-else
    class="d-flex flex-column align-items-center justify-content-center text-muted"
    style="width:50px; height:50px; background:#f0f0f0; border-radius:6px; cursor: default; font-size:10px; text-align:center; padding:2px;"
  >
    Sin
    imagen
  </div>
</template>


        <template #cell(estado)="data">
          <BFormCheckbox
            :checked="Boolean(data.item.estado)"
            :disabled="coursesStore.isLoading"
            @update:checked="val => toggleCourseState(data.item, val)"
            size="sm"
            aria-label="Toggle estado"
          >
            {{ data.item.estado ? 'Activo' : 'Inactivo' }}
          </BFormCheckbox>
        </template>

        <template #cell(precio)="data">
          ${{ formatPrice(data.item.precio) }}
        </template>

        <template #cell(ocupacion)="data">
          {{ data.item.inscritos }}/{{ data.item.cupos }}
          ({{ Math.round((data.item.inscritos / (data.item.cupos || 1)) * 100) || 0 }}%)
        </template>

        <template #cell(actions)="data">
          <BButtonGroup size="sm">
            <BButton
              variant="outline-primary"
              @click="editCourse(data.item)"
              :disabled="coursesStore.isLoading"
              data-cy="edit-course-btn"
            >✏️</BButton>

            <BButton
              variant="outline-danger"
              @click="confirmDelete(data.item)"
              :disabled="coursesStore.isLoading"
              data-cy="delete-course-btn"
            >🗑️</BButton>
          </BButtonGroup>
        </template>
      </BTable>
    </BCard>

<!-- Modal Agregar Curso (formulario) -->
<BModal v-model="showAddModal" title="Agregar Nuevo Curso" size="lg">
  <CourseForm :course="newCourse" @update-course="updateNewCourse" />

  <template #footer>
    <BButton
      variant="secondary"
      @click="() => { console.log('[UI] Cancel Add clicked'); showAddModal = false }"
      data-cy="cancel-add-btn"
    >
      Cancelar
    </BButton>
    <BButton
      variant="primary"
      :disabled="coursesStore.isLoading"
      @click="() => { console.log('[UI] Confirm Add Form clicked'); confirmAddCourse() }"
      data-cy="confirm-add-btn"
    >
      Agregar Curso
    </BButton>
  </template>
</BModal>

    <!-- Modal Confirmar Agregar (acción final) -->
    <BModal v-model="showConfirmAdd" title="Confirmar" centered>
      <p>¿Deseas agregar este curso?</p>

      <template #footer>
        <BButton variant="secondary" @click="showConfirmAdd = false" data-cy="cancel-confirm-add-btn">Cancelar</BButton>
        <BButton
          variant="primary"
          @click="onConfirmAdd"
          :disabled="coursesStore.isLoading"
          data-cy="confirm-add-course-btn"
        >
          <span v-if="coursesStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Agregar Curso
        </BButton>
      </template>
    </BModal>

    <!-- Modal pequeño al clicar imagen -->
<BModal
  v-model="showImageModal"
  title="Información del curso"
  size="sm"
  centered
  hide-footer
  data-cy="course-image-modal"
>
  <div v-if="modalCourse">
    <p><strong>Nombre:</strong> {{ modalCourse.nombre }}</p>
    <p><strong>Fecha de inicio:</strong> {{ formatStartDate(modalCourse.fechaInicio) }}</p>
    <p><strong>Cupos disponibles:</strong> {{ availableSeats(modalCourse) }}</p>
  </div>
  <div v-else>
    <p>Sin información del curso</p>
  </div>
</BModal>


    <!-- Modal Confirmar Eliminar -->
    <BModal
      v-model="showConfirmDelete"
      title="Confirmar Eliminación"
      centered
      data-cy="confirm-delete-modal"
    >
      <p>¿Realmente deseas eliminar el curso <strong>{{ courseToDelete?.nombre }}</strong>?</p>

      <template #footer>
        <BButton
          variant="secondary"
          @click="showConfirmDelete = false"
          data-cy="cancel-delete-btn"
        >
          Cancelar
        </BButton>
        <BButton
          variant="danger"
          :disabled="coursesStore.isLoading"
          @click="onConfirmDeleteClick"
          data-cy="confirm-delete-btn"
        >
          <span v-if="coursesStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Sí, Borrar
        </BButton>
      </template>
    </BModal>

    <BModal
      v-model="showSuccessModal"
      title="Operación exitosa"
      centered
      ok-only
      ok-title="Aceptar"
    >
      <p class="mb-0">{{ successMessage }}</p>
    </BModal>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BRow,
  BCol,
  BButton,
  BSpinner,
  BAlert,
  BCard,
  BTable,
  BButtonGroup,
  BModal,
  BFormCheckbox
} from 'bootstrap-vue-next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useCoursesStore } from '../stores/courses'
import { useAuthStore } from '../stores/auth'
import CourseForm from '../components/CourseForm.vue'
import { db } from '@/firebase/config'

const router = useRouter()
const coursesStore = useCoursesStore()
const authStore = useAuthStore()

const dbRefs = {
  profiles: () => collection(db, 'userProfiles')
}

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

// temporal para depuración — puedes eliminar después
window.__coursesStore = coursesStore

const unsubscribe = ref(null)
const showAddModal = ref(false)
const showConfirmAdd = ref(false)
const showConfirmDelete = ref(false)
const courseToDelete = ref(null)
const showSuccessModal = ref(false)
const successMessage = ref('')



// modal de imagen
const showImageModal = ref(false)
const modalCourse = ref(null)

const openImageModal = (course) => {
  modalCourse.value = course || null
  showImageModal.value = true
}

// devuelve cupos disponibles (cupos - inscritos) y evita negativos
const availableSeats = (course) => {
  if (!course) return 0
  const cupos = Number(course.cupos) || 0
  const inscritos = Number(course.inscritos) || 0
  return Math.max(0, cupos - inscritos)
}

// formatea fecha de inicio; si no existe muestra "Por confirmar"
const formatStartDate = (raw) => {
  if (!raw) return 'Por confirmar'
  // suponer ISO string o timestamp; intentar normalizar
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return String(raw)
    return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return String(raw)
  }
}

const openSuccessModal = (message) => {
  successMessage.value = message
  showSuccessModal.value = true
}

const showRoleManager = computed(() => authStore.isAdmin)
const roleUpdateLoading = ref(false)
const roleUpdateEmail = ref('')
const roleUpdateStatus = ref(null)

const assignAdminRole = async () => {
  if (!roleUpdateEmail.value.trim()) {
    roleUpdateStatus.value = { type: 'danger', message: 'Ingresa un correo para continuar' }
    return
  }

  roleUpdateLoading.value = true
  roleUpdateStatus.value = null

  try {
    const profilesQuery = query(
      dbRefs.profiles(),
      where('email', '==', roleUpdateEmail.value.trim().toLowerCase())
    )
    const profilesSnapshot = await getDocs(profilesQuery)
    const match = profilesSnapshot.docs[0]
    if (!match) {
      roleUpdateStatus.value = { type: 'danger', message: 'No se encontró un perfil con ese correo' }
      return
    }

    await authStore.updateUserRole({ uid: match.id, role: 'admin' })
    roleUpdateStatus.value = { type: 'success', message: 'Permisos de administrador asignados' }
    roleUpdateEmail.value = ''
  } catch (error) {
    console.error('[Admin] assignAdminRole error', error)
    roleUpdateStatus.value = { type: 'danger', message: 'No se pudo actualizar el rol' }
  } finally {
    roleUpdateLoading.value = false
  }
}



const incompleteCourses = computed(() => (
  coursesStore.allCourses.filter((course) => !hasText(course?.nombre) || !hasText(course?.img))
))

const hasIncompleteCourses = computed(() => incompleteCourses.value.length > 0)
const isCleaningIncomplete = ref(false)

const removeIncompleteCourses = async () => {
  if (!incompleteCourses.value.length || isCleaningIncomplete.value) {
    return
  }

  isCleaningIncomplete.value = true

  try {
    for (const course of [...incompleteCourses.value]) {
      if (course?.id) {
        await coursesStore.deleteCourse(course.id)
      }
    }
    openSuccessModal('Cursos incompletos eliminados correctamente.')
  } catch (error) {
    console.error('[Admin] removeIncompleteCourses error', error)
    alert('No fue posible eliminar los cursos incompletos. Intenta nuevamente.')
  } finally {
    isCleaningIncomplete.value = false
  }
}



const newCourse = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  duracion: '',
  cupos: '',
  inscritos: 0,
  estado: true,
  img: ''
})

const tableFields = [
  { key: 'img', label: 'Imagen' },
  { key: 'codigo', label: 'Código', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'duracion', label: 'Duración' },
  { key: 'precio', label: 'Precio', sortable: true },
  { key: 'ocupacion', label: 'Ocupación' },
  { key: 'estado', label: 'Estado' },
  { key: 'actions', label: 'Acciones' }
]

const isFormValid = computed(() => {
  const c = newCourse.value
  const hasNumber = (v) => typeof v === 'number' && !Number.isNaN(v)
  return hasText(c.codigo) &&
    hasText(c.nombre) &&
    hasText(c.descripcion) &&
    (hasNumber(c.precio) || (typeof c.precio === 'string' && c.precio.trim() !== '')) &&
    hasText(c.duracion) &&
    (hasNumber(c.cupos) || (typeof c.cupos === 'string' && c.cupos.trim() !== '')) &&
    hasText(c.img)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(price)
}

const updateNewCourse = (updatedCourse) => {
  newCourse.value = { ...updatedCourse }
}

const resetForm = () => {
  newCourse.value = { codigo: '', nombre: '', descripcion: '', precio: '', duracion: '', cupos: '', inscritos: 0, estado: true, img: '' }
}

// Cambio de estado usando el módulo Vuex; Firestore y el listener actualizarán la UI
const toggleCourseState = async (item, newState) => {
  if (!item || !item.id || coursesStore.isLoading) return

  const result = await coursesStore.updateCourse(item.id, { estado: Boolean(newState) })
  if (!(result && result.success)) {
    alert('No fue posible actualizar el estado del curso')
  }
}

// abrir modal formulario (header)
const openAddForm = () => {
  console.log('[UI] openAddForm called')
  showAddModal.value = true
}

// abrir modal de confirmación (desde modal formulario)
const confirmAddCourse = () => {
  console.log('[UI] confirmAddCourse called')
  showAddModal.value = false
  showConfirmAdd.value = true
}

// handler final: cerrar confirm y ejecutar add
const onConfirmAdd = async () => {
  console.log('[UI] onConfirmAdd called')
  showConfirmAdd.value = false
  await Promise.resolve()
  await addCourse()
}

// addCourse: llamar store y limpiar formulario; confiar en onSnapshot para actualizar UI
const addCourse = async () => {
  console.log('[UI] addCourse called', JSON.parse(JSON.stringify(newCourse.value)))
  const courseData = {
    ...newCourse.value,
    precio: Number(newCourse.value.precio) || 0,
    cupos: Number(newCourse.value.cupos) || 0,
    inscritos: Number(newCourse.value.inscritos) || 0
  }

  try {
    const result = await coursesStore.addCourse(courseData)
    console.log('[UI] addCourse result', result)
    if (result && result.success) {
      resetForm()
      showAddModal.value = false
      openSuccessModal('Curso agregado correctamente.')
    } else {
      alert('Error al agregar curso: ' + (result?.error || 'Error desconocido'))
    }
  } catch (err) {
    console.error('[UI] addCourse exception', err)
    alert('Error crítico al agregar curso')
  }
}

const editCourse = (course) => { router.push(`/admin/edit/${course.id}`) }
const confirmDelete = (course) => { courseToDelete.value = course; showConfirmDelete.value = true }
const handleDeleteConfirm = (event) => { event.preventDefault(); deleteCourse() }
const onConfirmDeleteClick = () => { deleteCourse() }

const deleteCourse = async () => {
  showConfirmDelete.value = false
  if (!courseToDelete.value) return
  try {
    const result = await coursesStore.deleteCourse(courseToDelete.value.id)
    if (result && result.success) {
      openSuccessModal('Curso eliminado correctamente.')
    } else {
      alert('Error al eliminar curso: ' + (result?.error || 'Error desconocido'))
    }
  } finally {
    courseToDelete.value = null
  }
}

const initialCourses = [
  { codigo: "0001", nombre: "HTML", estado: true, precio: 30000, duracion: "1 mes", descripcion: "curso html", cupos: 10, inscritos: 0, img: "https://www.w3.org/html/logo/downloads/HTML5_Logo_512.png" },
  { codigo: "0002", nombre: "CSS", estado: true, precio: 20000, duracion: "1 mes", descripcion: "curso css", cupos: 20, inscritos: 0, img: "https://cdn.pixabay.com/photo/2016/11/19/23/00/css3-1841590_1280.png" },
  { codigo: "0003", nombre: "SASS", estado: true, precio: 40000, duracion: "2 mes", descripcion: "curso sass", cupos: 30, inscritos: 0, img: "https://miro.medium.com/max/512/1*9U1toerFxB8aiFRreLxEUQ.png" },
  { codigo: "0004", nombre: "VUE", estado: false, precio: 50000, duracion: "3 mes", descripcion: "curso vue", cupos: 15, inscritos: 0, img: "https://vuejs.org/images/logo.png" }
]

const initializeCourses = async () => {
  for (const course of initialCourses) {
    await coursesStore.addCourse(course)
  }
}

onMounted(() => {
  if (!unsubscribe.value) {
    unsubscribe.value = coursesStore.initCoursesListener()
    console.log('[Admin] initCoursesListener requested')
    // temporal: exponer store para depuración
    window.__coursesStore = coursesStore
  }
})

onUnmounted(() => {
  if (unsubscribe.value && typeof unsubscribe.value === 'function') {
    unsubscribe.value()
    unsubscribe.value = null
    console.log('[Admin] listener unsubscribed from AdminView')
  }
})
</script>

<style scoped>
.h2 { color: #007bff; }
</style>