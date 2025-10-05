import { defineStore } from 'pinia'
import { RouteLocationNormalized } from 'vue-router'

export interface TabItem {
    name: string
    path: string
    title: string
}

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        tabs: [] as TabItem[],
        activeTab: '' as string
    }),

    actions: {
        addTab(route: RouteLocationNormalized) {
            const { name, path, meta } = route
            if (!name || this.tabs.some(tab => tab.path === path)) return

            this.tabs.push({
                name: name as string,
                path,
                title: meta.title || name as string
            })

            this.activeTab = path
        },

        removeTab(path: string) {
            const index = this.tabs.findIndex(tab => tab.path === path)
            if (index > -1) {
                this.tabs.splice(index, 1)
            }
        },

        setActiveTab(path: string) {
            this.activeTab = path
        }
    }
})