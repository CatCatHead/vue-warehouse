import { defineStore } from "pinia";
import { RouteLocationNormalized } from "vue-router";

export interface TabItem {
  name: string;
  path: string;
  title: string;
}

export const useTabsStore = defineStore("tabs", {
  state: () => ({
    tabs: [] as TabItem[],
    activeTab: "" as string,
  }),
  getters: {
    // active current tab
    currentTab: (state) => {
      return state.tabs.find((tab) => tab.path === state.activeTab);
    },
  },
  actions: {
    addTab(route: RouteLocationNormalized) {
      const { name, path, meta } = route;
      if (!name) return;

      // check if the tab exists
      const existingTab = this.tabs.find((tab) => tab.path === path);
      if (!existingTab) {
        this.tabs.push({
          name: name as string,
          path,
          title: meta.title || (name as string),
        });
      }

      // always refresh the tab
      this.activeTab = path;
    },

    removeTab(path: string) {
      const index = this.tabs.findIndex((tab) => tab.path === path);
      if (index > -1) {
        this.tabs.splice(index, 1);

        // active the previous tab if delete current one
        if (path === this.activeTab && this.tabs.length > 0) {
          const lastTab = this.tabs[this.tabs.length - 1];
          this.activeTab = lastTab.path;
        }
      }
    },

    setActiveTab(path: string) {
      this.activeTab = path;
    },
    //find the tab up to the route
    findTabByPath(path: string): TabItem | undefined {
      return this.tabs.find((tab) => tab.path === path);
    },
  },
});
