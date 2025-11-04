//src/store/tabs.ts
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
    closeOtherTab(currentTab: string) {
      this.tabs = this.tabs.filter(
        (tab) =>
          //only save current tab
          tab.path === currentTab || tab.path === "/",
      );
      if (!this.tabs.some((tab) => tab.path === this.activeTab)) {
        this.activeTab = currentTab;
      }
    },
    closeLeftTabs(currentPath: string) {
      const currentIndex = this.tabs.findIndex(
        (tab) => tab.path === currentPath,
      );
      if (currentIndex > 0) {
        this.tabs = this.tabs.slice(currentIndex);
        if (!this.tabs.some((tab) => tab.path === this.activeTab)) {
          this.activeTab = currentPath;
        }
      }
    },
    closeRightTabs(currentPath: string) {
      const currentIndex = this.tabs.findIndex(
        (tab) => tab.path === currentPath,
      );
      if (currentIndex < this.tabs.length - 1) {
        this.tabs = this.tabs.slice(0, currentIndex + 1);
        if (!this.tabs.some((tab) => tab.path === this.activeTab)) {
          this.activeTab = currentPath;
        }
      }
    },
    closeAllTabs() {
      const homeTab = this.tabs.find((tab) => tab.path === "/");
      this.tabs = homeTab ? [homeTab] : [];
      this.activeTab = homeTab ? homeTab.path : "";
    },
    reorderTabs(fromIndex: number, toIndex: number) {
      const [movedTab] = this.tabs.splice(fromIndex, 1);
      this.tabs.splice(toIndex, 0, movedTab);
    },
    getTabIndex(path: string): number {
      return this.tabs.findIndex((tab) => tab.path === path);
    },
    //find the tab up to the route
    findTabByPath(path: string): TabItem | undefined {
      return this.tabs.find((tab) => tab.path === path);
    },
  },
});
