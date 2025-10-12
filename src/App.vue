<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { BContainer } from 'bootstrap-vue-next'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Inicializar el listener de autenticación al montar la app
onMounted(() => {
  authStore.initAuthStateListener()
})
</script>

<template>
  <div id="app">
    <NavBar />
    <BContainer>
      <RouterView />
    </BContainer>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}
</style>