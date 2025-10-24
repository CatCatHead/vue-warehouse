import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { SearchResult, SearchState } from "@/types/search";

// Mock data - in real app, this would come from API or store
const mockUsers = [
  { id: "1", username: "admin", email: "admin@example.com", role: "admin" },
  {
    id: "2",
    username: "john_doe",
    email: "john.doe@example.com",
    role: "editor",
  },
  {
    id: "3",
    username: "jane_smith",
    email: "jane.smith@example.com",
    role: "viewer",
  },
];

const mockTrackingNumbers = [
  { id: "1", number: "TRK-001", status: "active", carrier: "FedEx" },
  { id: "2", number: "TRK-002", status: "pending", carrier: "UPS" },
  { id: "3", number: "TRK-003", status: "delivered", carrier: "DHL" },
];

export function useGlobalSearch() {
  const router = useRouter();

  const searchState = ref<SearchState>({
    query: "",
    results: [],
    isOpen: false,
    selectedIndex: 0,
    isLoading: false,
  });

  // Available pages for navigation
  const pages: SearchResult[] = [
    {
      id: "dashboard",
      type: "page",
      title: "Dashboard",
      description: "System overview and analytics",
      icon: "Odometer",
      path: "/dashboard",
      category: "Navigation",
      priority: 100,
      keywords: ["home", "overview", "analytics"],
    },
    {
      id: "users",
      type: "page",
      title: "User Management",
      description: "Manage system users and permissions",
      icon: "User",
      path: "/users",
      category: "Navigation",
      priority: 90,
      keywords: ["users", "admin", "permissions", "roles"],
    },
    {
      id: "settings",
      type: "page",
      title: "System Settings",
      description: "Configure system preferences",
      icon: "Setting",
      path: "/settings",
      category: "Navigation",
      priority: 80,
      keywords: ["settings", "configuration", "preferences"],
    },
    {
      id: "tracking",
      type: "page",
      title: "Tracking Numbers",
      description: "Manage package tracking",
      icon: "InfoFilled",
      path: "/trackingNumber",
      category: "Navigation",
      priority: 70,
      keywords: ["tracking", "packages", "shipping"],
    },
    {
      id: "about",
      type: "page",
      title: "About",
      description: "System information and technology stack",
      icon: "InfoFilled",
      path: "/about",
      category: "Navigation",
      priority: 60,
      keywords: ["about", "info", "technology"],
    },
  ];

  // Quick actions
  const actions: SearchResult[] = [
    {
      id: "refresh-data",
      type: "action",
      title: "Refresh Data",
      description: "Reload all current data",
      icon: "Refresh",
      category: "Actions",
      priority: 95,
      action: () => {
        ElMessage.info("Refreshing data...");
        // In real app, this would trigger data refresh
      },
    },
    {
      id: "add-user",
      type: "action",
      title: "Add New User",
      description: "Create a new user account",
      icon: "User",
      category: "Actions",
      priority: 85,
      action: () => {
        // This would open the user creation dialog
        router.push("/users");
        ElMessage.info("Navigate to user creation");
      },
    },
    {
      id: "export-data",
      type: "action",
      title: "Export Data",
      description: "Export current view data to CSV",
      icon: "Download",
      category: "Actions",
      priority: 75,
      action: () => {
        ElMessage.info("Exporting data...");
      },
    },
  ];

  /**
   * Search through all available data
   */
  const performSearch = (query: string): SearchResult[] => {
    if (!query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search pages
    const pageResults = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(lowerQuery) ||
        page.description?.toLowerCase().includes(lowerQuery) ||
        page.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(lowerQuery),
        ),
    );
    allResults.push(...pageResults);

    // Search users
    const userResults = mockUsers
      .filter(
        (user) =>
          user.username.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          user.role.toLowerCase().includes(lowerQuery),
      )
      .map((user) => ({
        id: `user-${user.id}`,
        type: "user" as const,
        title: user.username,
        description: `${user.email} (${user.role})`,
        icon: "User",
        path: `/users`,
        category: "Users",
        priority: 50,
      }));
    allResults.push(...userResults);

    // Search tracking numbers
    const trackingResults = mockTrackingNumbers
      .filter(
        (tracking) =>
          tracking.number.toLowerCase().includes(lowerQuery) ||
          tracking.carrier.toLowerCase().includes(lowerQuery) ||
          tracking.status.toLowerCase().includes(lowerQuery),
      )
      .map((tracking) => ({
        id: `tracking-${tracking.id}`,
        type: "tracking" as const,
        title: tracking.number,
        description: `${tracking.carrier} - ${tracking.status}`,
        icon: "Location",
        path: `/trackingNumber`,
        category: "Tracking",
        priority: 40,
      }));
    allResults.push(...trackingResults);

    // Search actions
    const actionResults = actions.filter(
      (action) =>
        action.title.toLowerCase().includes(lowerQuery) ||
        action.description?.toLowerCase().includes(lowerQuery),
    );
    allResults.push(...actionResults);

    // Sort by priority and category
    return allResults.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    });
  };

  /**
   * Handle search query changes
   */
  watch(
    () => searchState.value.query,
    async (newQuery) => {
      if (!newQuery.trim()) {
        searchState.value.results = [];
        return;
      }

      searchState.value.isLoading = true;

      // Simulate API delay
      setTimeout(() => {
        searchState.value.results = performSearch(newQuery);
        searchState.value.selectedIndex = 0;
        searchState.value.isLoading = false;
      }, 150);
    },
  );

  /**
   * Open search modal
   */
  const openSearch = () => {
    searchState.value.isOpen = true;
    searchState.value.query = "";
    searchState.value.results = [];
    searchState.value.selectedIndex = 0;
  };

  /**
   * Close search modal
   */
  const closeSearch = () => {
    searchState.value.isOpen = false;
    searchState.value.query = "";
    searchState.value.results = [];
  };

  /**
   * Select a search result
   */
  const selectResult = (result: SearchResult) => {
    if (result.path) {
      router.push(result.path);
    } else if (result.action) {
      result.action();
    }

    closeSearch();
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (!searchState.value.isOpen) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        searchState.value.selectedIndex = Math.min(
          searchState.value.selectedIndex + 1,
          searchState.value.results.length - 1,
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        searchState.value.selectedIndex = Math.max(
          searchState.value.selectedIndex - 1,
          0,
        );
        break;

      case "Enter":
        event.preventDefault();
        if (searchState.value.results[searchState.value.selectedIndex]) {
          selectResult(
            searchState.value.results[searchState.value.selectedIndex],
          );
        }
        break;

      case "Escape":
        event.preventDefault();
        closeSearch();
        break;
    }
  };

  /**
   * Group results by category for display
   */
  const groupedResults = computed(() => {
    const groups: Record<string, SearchResult[]> = {};

    searchState.value.results.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = [];
      }
      groups[result.category].push(result);
    });

    return groups;
  });

  return {
    searchState,
    groupedResults,
    openSearch,
    closeSearch,
    selectResult,
    handleKeydown,
  };
}
