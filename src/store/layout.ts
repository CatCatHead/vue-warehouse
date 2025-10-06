import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout", () => {
  const sidebarCollapsed = ref(false);

  const loadLayoutState = () => {
    const savedState = localStorage.getItem("vaas-layout-sidebar-collapsed");
    if (savedState !== null) {
      sidebarCollapsed.value = JSON.parse(savedState);
    }
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem(
      "vaas-layout-sidebar-collapsed",
      JSON.stringify(sidebarCollapsed.value),
    );
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed;
    localStorage.setItem(
      "vaas-layout-sidebar-collapsed",
      JSON.stringify(collapsed),
    );
  };

  loadLayoutState();

  return {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
  };
});
