import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'
import Home from './pages/Home.vue'
import Login from './pages/Login.vue'
import App from './App.vue'
import './index.css'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'home', component: Home },
		{ path: '/login', name: 'login', component: Login }
	]
})

const store = createStore({
	state: {
		count: 0,
    isAuthenticated: false
	},
	mutations: {
		increment(state, n) {
		state.count += n;
		}
	}
})

createApp(App)
.use(router)
.use(store)
.mount('#app')
