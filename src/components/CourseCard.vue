<template>
  <BCard class="course-card h-100">
    <BCardImg 
      :src="course.img" 
      :alt="course.nombre"
      top
      class="course-image"
    />
    <BCardBody class="d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <BCardTitle class="mb-0">{{ course.nombre }}</BCardTitle>
        <BBadge :variant="course.estado ? 'success' : 'secondary'">
          {{ course.estado ? 'Disponible' : 'Inactivo' }}
        </BBadge>
      </div>
      <BCardText class="flex-grow-1">
        <strong>Código:</strong> {{ course.codigo }}<br>
        <strong>Descripción:</strong> {{ course.descripcion }}<br>
        <strong>Duración:</strong> {{ course.duracion }}<br>
        <strong>Precio:</strong> ${{ formatPrice(course.precio) }}<br>
        <strong>Cupos:</strong> {{ course.cupos }}<br>
        <strong>Inscritos:</strong> {{ course.inscritos }}
      </BCardText>
      
      <div class="mt-auto">
        <BProgressBar 
          :value="inscriptionPercentage" 
          :max="100"
          class="mb-2"
          height="8px"
        />
        
        <small class="text-muted">
          {{ inscriptionPercentage }}% de cupos ocupados
        </small>

        <button 
          class="enroll-btn"
          :disabled="!course.estado"
          @click="$emit('enroll', course)"
        >
          {{ course.estado ? 'Agregar al carrito' : 'No disponible' }}
        </button>
      </div>
    </BCardBody>
  </BCard>
</template>

<script>
import { BCard, BCardImg, BCardBody, BCardTitle, BCardText, BBadge, BProgressBar } from 'bootstrap-vue-next'
import { computed } from 'vue'

export default {
  name: 'CourseCard',
  components: {
    BCard,
    BCardImg, 
    BCardBody,
    BCardTitle,
    BCardText,
    BBadge,
    BProgressBar
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const inscriptionPercentage = computed(() => {
      if (props.course.cupos === 0) return 0
      return Math.round((props.course.inscritos / props.course.cupos) * 100)
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'decimal',
        minimumFractionDigits: 0
      }).format(price)
    }

    return {
      inscriptionPercentage,
      formatPrice
    }
  }
}
</script>

<style scoped>
.course-card {
  transition: transform 0.2s;
  border: 1px solid #dee2e6;
  background-color: #95c5f8;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.course-image {
  height: 200px;
  object-fit: contain;
  background-color: #f8f9fa;
  padding: 1rem;
}

.card-body {
  padding: 1.25rem;
}

.card-title {
  color: #007bff;
  font-weight: 600;
  margin-bottom: 1rem;
}

.card-text {
  font-size: 0.9rem;
  line-height: 1.6;
}

.enroll-btn {
  width: 100%;
  margin-top: 0.75rem;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.enroll-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.enroll-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>