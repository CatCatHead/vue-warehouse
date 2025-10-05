import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { APP_CONFIG } from '@/constants/app'

// Initialize Vue application
const app = createApp(App)

// Configure plugins
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus)
app.use(router)

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// Load theme
import { useThemeStore } from '@/store/theme'
const themeStore = useThemeStore()
themeStore.loadTheme()

// Global configuration
app.config.globalProperties.$appConfig = APP_CONFIG

// Mount application
app.mount('#app')

console.log(`🚀 ${APP_CONFIG.TITLE} v${APP_CONFIG.VERSION} started successfully!`)