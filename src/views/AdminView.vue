<template>
  <div>
    <!-- Header -->
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
              @click="showAddModal = true"
              :disabled="coursesStore.isLoading"
            >
              + Agregar Curso
            </BButton>
          </div>
        </div>
      </BCol>
    </BRow>

    <!-- Loading -->
    <div v-if="coursesStore.isLoading" class="text-center my-5">
      <BSpinner variant="primary" class="me-2"></BSpinner>
      <span>Cargando cursos...</span>
    </div>

    <!-- Error -->
    <BAlert v-if="coursesStore.getError" variant="danger" class="mb-4">
      Error: {{ coursesStore.getError }}
    </BAlert>

    <!-- Tabla de cursos -->
    <BCard v-if="!coursesStore.isLoading && !coursesStore.getError">
      <BTable 
        :items="coursesStore.allCourses" 
        :fields="tableFields"
        striped
        hover
        responsive
        class="mb-0"
      >
        <template #cell(img)="data">
          <img 
            :src="data.item.img" 
            :alt="data.item.nombre"
            style="width: 50px; height: 50px; object-fit: contain;"
            class="rounded"
          />
        </template>

        <template #cell(estado)="data">
          <BBadge :variant="data.item.estado ? 'success' : 'secondary'">
            {{ data.item.estado ? 'Activo' : 'Inactivo' }}
          </BBadge>
        </template>

        <template #cell(precio)="data">
          ${{ formatPrice(data.item.precio) }}
        </template>

        <template #cell(ocupacion)="data">
          {{ data.item.inscritos }}/{{ data.item.cupos }}
          ({{ Math.round((data.item.inscritos / data.item.cupos) * 100) || 0 }}%)
        </template>

        <template #cell(actions)="data">
          <BButtonGroup size="sm">
            <BButton 
              variant="outline-primary" 
              @click="editCourse(data.item)"
              :disabled="coursesStore.isLoading"
              data-cy="edit-course-btn"
            >
              ✏️
            </BButton>
            <BButton 
              variant="outline-danger" 
              @click="confirmDelete(data.item)"
              :disabled="coursesStore.isLoading"
              data-cy="delete-course-btn"
            >
              🗑️
            </BButton>
          </BButtonGroup>
        </template>
      </BTable>
    </BCard>

    <!-- Modal Agregar Curso -->
    <BModal 
      v-model="showAddModal" 
      title="Agregar Nuevo Curso"
      size="lg"
      @hidden="resetForm"
    >
      <CourseForm 
        :course="newCourse" 
        @update-course="updateNewCourse"
      />
      
      <template #modal-footer>
        <BButton variant="secondary" @click="showAddModal = false">
          Cancelar
        </BButton>
        <BButton 
          variant="primary" 
          @click="confirmAddCourse"
          :disabled="!isFormValid"
        >
          Agregar Curso
        </BButton>
      </template>
    </BModal>

    <!-- Modal Confirmar Agregar -->
    <BModal 
      v-model="showConfirmAdd" 
      title="Confirmar"
      centered
    >
      <p>¿Deseas agregar este curso?</p>
      <template #modal-footer>
        <BButton variant="secondary" @click="showConfirmAdd = false">
          Cancelar
        </BButton>
        <BButton 
          variant="primary" 
          @click="addCourse"
          :disabled="coursesStore.isLoading"
        >
          <span v-if="coursesStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Agregar Curso
        </BButton>
      </template>
    </BModal>

    <!-- Modal Confirmar Eliminar -->
    <BModal 
      v-model="showConfirmDelete" 
      title="Confirmar Eliminación"
      centered
      data-cy="confirm-delete-modal"
      @ok="handleDeleteConfirm"
      @cancel="showConfirmDelete = false"
      ok-title="Sí, Borrar"
      ok-variant="danger"
      cancel-title="Cancelar"
      cancel-variant="secondary"
    >
      <p>¿Realmente deseas eliminar el curso <strong>{{ courseToDelete?.nombre }}</strong>?</p>
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
  BBadge,
  BButtonGroup,
  BModal,
  BForm,
  BFormGroup,
  BFormInput
} from 'bootstrap-vue-next'
import { useCoursesStore } from '../stores/courses'
import CourseForm from '../components/CourseForm.vue'

const router = useRouter()
const coursesStore = useCoursesStore()

// Variables reactivas
const unsubscribe = ref(null)
const showAddModal = ref(false)
const showConfirmAdd = ref(false)
const showConfirmDelete = ref(false)
const courseToDelete = ref(null)

// Cursos iniciales según requerimientos
const initialCourses = [
  {
    codigo: "0001",
    nombre: "HTML",
    estado: true,
    precio: 30000,
    duracion: "1 mes",
    descripcion: "curso html",
    cupos: 10,
    inscritos: 0,
    img: "https://www.w3.org/html/logo/downloads/HTML5_Logo_512.png"
  },
  {
    codigo: "0002",
    nombre: "CSS",
    estado: false,
    precio: 20000,
    duracion: "1 mes",
    descripcion: "curso css",
    cupos: 20,
    inscritos: 0,
    img: "https://lineadecodigo.com/wp-content/uploads/2014/04/css.png"
  },
  {
    codigo: "0003",
    nombre: "SASS",
    estado: true,
    precio: 40000,
    duracion: "2 mes",
    descripcion: "curso sass",
    cupos: 30,
    inscritos: 0,
    img: "https://miro.medium.com/max/512/1*9U1toerFxB8aiFRreLxEUQ.png"
  },
  {
    codigo: "0004",
    nombre: "VUE",
    estado: false,
    precio: 50000,
    duracion: "3 mes",
    descripcion: "curso vue",
    cupos: 15,
    inscritos: 0,
    img: "https://vuejs.org/images/logo.png"
  }
]

// Nuevo curso
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

// Configuración de la tabla
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

// Computed
const isFormValid = computed(() => {
  return newCourse.value.codigo && 
         newCourse.value.nombre && 
         newCourse.value.descripcion &&
         newCourse.value.precio &&
         newCourse.value.duracion &&
         newCourse.value.cupos &&
         newCourse.value.img
})

// Métodos
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(price)
}

const updateNewCourse = (updatedCourse) => {
  newCourse.value = { ...updatedCourse }
}

const resetForm = () => {
  newCourse.value = {
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    cupos: '',
    inscritos: 0,
    estado: true,
    img: ''
  }
}

const confirmAddCourse = () => {
  showAddModal.value = false
  showConfirmAdd.value = true
}

const addCourse = async () => {
  const courseData = {
    ...newCourse.value,
    precio: parseInt(newCourse.value.precio),
    cupos: parseInt(newCourse.value.cupos),
    inscritos: parseInt(newCourse.value.inscritos)
  }

  const result = await coursesStore.addCourse(courseData)
  
  showConfirmAdd.value = false
  
  if (result.success) {
    resetForm()
    // Mostrar mensaje de éxito (podrías usar un toast aquí)
  }
}

const editCourse = (course) => {
  router.push(`/admin/edit/${course.id}`)
}

const confirmDelete = (course) => {
  courseToDelete.value = course
  showConfirmDelete.value = true
}

const handleDeleteConfirm = (event) => {
  event.preventDefault() // Prevenir el cierre automático del modal
  deleteCourse()
}

const deleteCourse = async () => {
  showConfirmDelete.value = false
  
  if (!courseToDelete.value) {
    alert('Error: No hay curso seleccionado')
    return
  }
  
  try {
    const result = await coursesStore.deleteCourse(courseToDelete.value.id)
    
    if (result && result.success) {
      // Mensaje de éxito opcional
      console.log('Curso eliminado exitosamente:', courseToDelete.value.nombre)
    } else {
      alert('Error al eliminar curso: ' + (result?.error || 'Error desconocido'))
    }
  } catch (error) {
    alert('Error crítico: ' + error.message)
  } finally {
    courseToDelete.value = null
  }
}

// Función para inicializar cursos
const initializeCourses = async () => {
  try {
    for (const course of initialCourses) {
      const result = await coursesStore.addCourse(course)
      if (!result.success) {
        console.error('Error agregando curso:', course.nombre, result.error)
      }
    }
    console.log('¡Cursos iniciales agregados exitosamente!')
  } catch (error) {
    console.error('Error al agregar cursos iniciales:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  unsubscribe.value = coursesStore.initCoursesListener()
})

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})
</script>

<style scoped>
.h2 {
  color: #007bff;
}
</style>