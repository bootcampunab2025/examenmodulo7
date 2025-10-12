# AdWeb Online - Sistema de Administración de Cursos

Sistema de administración de cursos desarrollado con Vue 3, Firebase y Bootstrap Vue.

## 🚀 Características

- ✅ **Autenticación con Firebase**: Login y registro de usuarios
- ✅ **CRUD de Cursos**: Crear, leer, actualizar y eliminar cursos
- ✅ **Base de datos en tiempo real**: Firestore para almacenamiento
- ✅ **UI moderna**: Bootstrap Vue para estilos
- ✅ **Gestión de estado**: Pinia (reemplazo moderno de Vuex)
- ✅ **Pruebas E2E**: Cypress para testing
- ✅ **Responsive**: Adaptable a dispositivos móviles

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase/Google

## 🛠️ Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar Firebase**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication (Email/Password)
   - Habilitar Firestore Database
   - Actualizar `src/firebase/config.js` con tus credenciales

## 🚀 Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## 🧪 Pruebas E2E

```bash
# Abrir Cypress interactivo
npm run cypress:open

# Ejecutar pruebas en modo headless
npm run cypress:run
```

### Pruebas Incluidas
1. **Login**: Verificación de autenticación con email y contraseña
2. **Eliminar Cursos**: Funcionalidad de eliminación de cursos

## 🎨 Tecnologías Utilizadas

- **Vue 3**: Framework JavaScript reactivo
- **Vite**: Build tool moderno y rápido
- **Pinia**: Gestión de estado
- **Vue Router**: Enrutamiento SPA
- **Firebase Auth**: Autenticación de usuarios
- **Firestore**: Base de datos NoSQL en tiempo real
- **Bootstrap Vue Next**: Componentes UI
- **Cypress**: Testing E2E

## 📚 Datos Iniciales

Los cursos incluidos son:
1. **HTML** - $30.000 - 1 mes - 10 cupos - Activo
2. **CSS** - $20.000 - 1 mes - 20 cupos - Inactivo  
3. **SASS** - $40.000 - 2 meses - 30 cupos - Activo
4. **VUE** - $50.000 - 3 meses - 15 cupos - Inactivo
