# AdWeb Online - Sistema de Administración de Cursos

Sistema de administración de cursos desarrollado con Vue 3, Firebase y Bootstrap Vue.

## 🚀 Características

- ✅ **Autenticación con Firebase**: Login y registro de usuarios
- ✅ **CRUD de Cursos**: Crear, leer, actualizar y eliminar cursos
- ✅ **Base de datos en tiempo real**: Firestore para almacenamiento
- ✅ **UI moderna**: Bootstrap Vue para estilos
- ✅ **Gestión de estado**: Vuex 4 (módulos `auth` y `courses`)
- ✅ **Catálogo público**: Home visible sin login; solo las rutas de gestión requieren autenticación
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

## 📊 Reportes E2E (Mochawesome)

Este proyecto genera reportes de Cypress con Mochawesome.

Atajo para ejecutar pruebas y crear un HTML consolidado en carpeta separada:

```bash
npm run test:e2e:html
```

- JSON individuales: `cypress/reports`
- Reporte único HTML: `cypress/report-html/index.html`

Si prefieres los pasos por separado:

```bash
# 1) Ejecuta las pruebas en modo headless
npm run test:e2e

# 2) Prepara carpetas para reportes consolidados
npm run report:prep

# 3) Une todos los JSON en uno solo
npm run report:merge

# 4) Genera el HTML consolidado en carpeta separada
npm run report:html
```

## 🌐 Despliegue en GitHub Pages

El workflow `.github/workflows/deploy-gh-pages.yml` construye la aplicación cuando haces push a `jp` (o disparas el job manualmente) y publica el contenido en la rama `gh-pages`. Pasos:

1. En **Settings ▸ Pages**, elige “Deploy from a branch” y selecciona `gh-pages` ▸ `/ (root)`.
2. Realiza push a `jp` (o usa *Actions ▸ Deploy to GitHub Pages ▸ Run workflow*).
3. El job ejecuta `npm run build:gh-pages`, crea `dist/404.html` y empuja el resultado a la rama `gh-pages` con `peaceiris/actions-gh-pages`.

Una vez que GitHub Pages detecte el commit nuevo en `gh-pages`, la URL `https://<usuario>.github.io/examenmodulo7/` se actualizará automáticamente.

## 🎨 Tecnologías Utilizadas

- **Vue 3**: Framework JavaScript reactivo
- **Vite**: Build tool moderno y rápido
- **Vuex 4**: Gestión de estado
- **Vue Router**: Enrutamiento SPA
- **Firebase Auth**: Autenticación de usuarios
- **Firestore**: Base de datos NoSQL en tiempo real
- **Bootstrap Vue Next**: Componentes UI
- **Cypress**: Testing E2E

## 🔄 Gestión de Estado con Vuex

El proyecto ahora utiliza **Vuex 4** para cumplir con el requerimiento explícito de la rúbrica. Existen dos módulos principales:

- `auth`: Maneja autenticación, listeners de Firebase y el flujo de bienvenida.
- `courses`: Expone el CRUD de cursos con listeners en tiempo real a Firestore.

Los componentes mantienen la API previa (`useAuthStore`, `useCoursesStore`) mediante envoltorios que delegan en Vuex, por lo que no es necesario cambiar la capa de presentación.

## 📚 Datos Iniciales

Los cursos incluidos son:
1. **HTML** - $30.000 - 1 mes - 10 cupos - Activo
2. **CSS** - $20.000 - 1 mes - 20 cupos - Inactivo  
3. **SASS** - $40.000 - 2 meses - 30 cupos - Activo
4. **VUE** - $50.000 - 3 meses - 15 cupos - Inactivo
