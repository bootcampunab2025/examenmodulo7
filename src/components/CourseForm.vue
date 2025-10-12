<template>
  <BForm>
    <BRow>
      <BCol md="6">
        <BFormGroup 
          id="codigo-group" 
          label="Código del Curso:" 
          label-for="codigo"
        >
          <BFormInput
            id="codigo"
            :model-value="course.codigo"
            @input="updateField('codigo', $event)"
            placeholder="ej: 0001"
            required
          />
        </BFormGroup>
      </BCol>
      
      <BCol md="6">
        <BFormGroup 
          id="nombre-group" 
          label="Nombre del Curso:" 
          label-for="nombre"
        >
          <BFormInput
            id="nombre"
            :model-value="course.nombre"
            @input="updateField('nombre', $event)"
            placeholder="ej: HTML"
            required
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <BFormGroup 
      id="descripcion-group" 
      label="Descripción:" 
      label-for="descripcion"
    >
      <BFormTextarea
        id="descripcion"
        :model-value="course.descripcion"
        @input="updateField('descripcion', $event)"
        placeholder="Describe el curso..."
        rows="3"
        required
      />
    </BFormGroup>

    <BRow>
      <BCol md="4">
        <BFormGroup 
          id="precio-group" 
          label="Precio:" 
          label-for="precio"
        >
          <BInputGroup prepend="$">
            <BFormInput
              id="precio"
              :model-value="course.precio"
              @input="updateField('precio', $event)"
              type="number"
              placeholder="30000"
              min="0"
              required
            />
          </BInputGroup>
        </BFormGroup>
      </BCol>
      
      <BCol md="4">
        <BFormGroup 
          id="duracion-group" 
          label="Duración:" 
          label-for="duracion"
        >
          <BFormInput
            id="duracion"
            :model-value="course.duracion"
            @input="updateField('duracion', $event)"
            placeholder="ej: 1 mes"
            required
          />
        </BFormGroup>
      </BCol>
      
      <BCol md="4">
        <BFormGroup 
          id="cupos-group" 
          label="Cupos:" 
          label-for="cupos"
        >
          <BFormInput
            id="cupos"
            :model-value="course.cupos"
            @input="updateField('cupos', $event)"
            type="number"
            placeholder="10"
            min="1"
            required
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <BRow>
      <BCol md="6">
        <BFormGroup 
          id="inscritos-group" 
          label="Inscritos:" 
          label-for="inscritos"
        >
          <BFormInput
            id="inscritos"
            :model-value="course.inscritos"
            @input="updateField('inscritos', $event)"
            type="number"
            placeholder="0"
            min="0"
          />
        </BFormGroup>
      </BCol>
      
      <BCol md="6">
        <BFormGroup 
          id="estado-group" 
          label="Estado:" 
          label-for="estado"
        >
          <BFormCheckbox
            id="estado"
            :checked="course.estado"
            @input="updateField('estado', $event)"
          >
            Curso activo
          </BFormCheckbox>
        </BFormGroup>
      </BCol>
    </BRow>

    <BFormGroup 
      id="img-group" 
      label="URL de la Imagen:" 
      label-for="img"
    >
      <BFormInput
        id="img"
        :model-value="course.img"
        @input="updateField('img', $event)"
        type="url"
        placeholder="https://ejemplo.com/imagen.png"
        required
      />
    </BFormGroup>

    <!-- Vista previa de la imagen -->
    <div v-if="course.img" class="text-center mt-3">
      <p class="mb-2"><strong>Vista previa:</strong></p>
      <img 
        :src="course.img" 
        :alt="course.nombre"
        style="max-width: 200px; max-height: 150px; object-fit: contain;"
        class="img-thumbnail"
        @error="handleImageError"
      />
    </div>
  </BForm>
</template>

<script>
import { 
  BForm, 
  BRow, 
  BCol, 
  BFormGroup, 
  BFormInput, 
  BFormTextarea, 
  BFormCheckbox,
  BInputGroup,
  BInputGroupText
} from 'bootstrap-vue-next'

export default {
  name: 'CourseForm',
  components: {
    BForm,
    BRow,
    BCol,
    BFormGroup,
    BFormInput,
    BFormTextarea,
    BFormCheckbox,
    BInputGroup,
    BInputGroupText
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  emits: ['update-course'],
  methods: {
    updateField(field, value) {
      const updatedCourse = { ...this.course, [field]: value }
      this.$emit('update-course', updatedCourse)
    },
    
    handleImageError(event) {
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.img-thumbnail {
  border: 2px solid #dee2e6;
  padding: 0.5rem;
  background-color: #f8f9fa;
}
</style>