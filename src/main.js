import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from '@/store'

import '@/assets/main.css'


import 'bootstrap/dist/css/bootstrap.css'
import { createBootstrap } from 'bootstrap-vue-next'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
const app = createApp(App)

app.use(store)
app.use(router)
app.use(createBootstrap())

store.dispatch('auth/initAuthStateListener')

app.mount('#app')