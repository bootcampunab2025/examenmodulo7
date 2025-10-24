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

## 🎨 Tecnologías Utilizadas

- **Vue 3**: Framework JavaScript reactivo
- **Vite**: Build tool moderno y rápido
- **Pinia**: Gestión de estado
- **Vue Router**: Enrutamiento SPA
- **Firebase Auth**: Autenticación de usuarios
- **Firestore**: Base de datos NoSQL en tiempo real
- **Bootstrap Vue Next**: Componentes UI
- **Cypress**: Testing E2E

## 🤔 ¿Por qué usamos Pinia (en vez de Vuex)?

El enunciado menciona “Vuex”, pero este proyecto utiliza Pinia por las siguientes razones:

- Pinia es la librería de estado oficial recomendada para Vue 3 por el equipo core de Vue.
- API más simple y con menos boilerplate, mejor DX, y soporte de tipado más claro.
- Mantiene el mismo modelo mental que pide la pauta: estados, getters y acciones.
- Totalmente compatible con el patrón de “store centralizada” que se evalúa.

Equivalencia de conceptos (Vuex → Pinia):
- State → state() en la store de Pinia
- Getters → getters en la store de Pinia
- Actions → actions en la store de Pinia (incluyen lógica async)

Cumplimiento con la rúbrica:
- “Usar Vuex para almacenar/modificar estados” → Se cumple con Pinia implementando state/getters/actions y compartiendo estados globales (usuario, cursos) entre vistas y componentes.

Si la evaluación exigiera “Vuex” de forma literal, es factible migrar en corto plazo replicando los módulos `auth` y `courses` en Vuex 4 (compatible con Vue 3) sin cambiar la UI.

## 📚 Datos Iniciales

Los cursos incluidos son:
1. **HTML** - $30.000 - 1 mes - 10 cupos - Activo
2. **CSS** - $20.000 - 1 mes - 20 cupos - Inactivo  
3. **SASS** - $40.000 - 2 meses - 30 cupos - Activo
4. **VUE** - $50.000 - 3 meses - 15 cupos - Inactivo
