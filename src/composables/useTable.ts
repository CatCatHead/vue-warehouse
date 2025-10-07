import { ref, reactive, computed } from "vue";

interface TableOptions {
  // Pagination
  page?: number;
  size?: number;
  pageSizes?: number[];

  // Search
  searchKey?: string;
  immediate?: boolean;

  // Callbacks
  fetchData: (params: any) => Promise<any>;
}

export function useTable(options: TableOptions) {
  const {
    page = 1,
    size = 10,
    pageSizes = [10, 20, 50, 100],
    searchKey = "keyword",
    immediate = true,
    fetchData,
  } = options;

  // Reactive state
  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const total = ref(0);
  const searchQuery = ref("");

  const pagination = reactive({
    currentPage: page,
    pageSize: size,
    pageSizes,
  });

  // Computed
  const tableParams = computed(() => ({
    [searchKey]: searchQuery.value,
    page: pagination.currentPage,
    size: pagination.pageSize,
  }));

  // Methods
  const loadData = async () => {
    try {
      loading.value = true;
      const response = await fetchData(tableParams.value);
      tableData.value = response.data || response.list || [];
      total.value = response.total || response.count || 0;
    } catch (error) {
      console.error("Failed to load table data:", error);
      tableData.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = (value: string) => {
    searchQuery.value = value;
    pagination.currentPage = 1;
    loadData();
  };

  const handleRefresh = () => {
    loadData();
  };

  const handlePageChange = (page: number) => {
    pagination.currentPage = page;
    loadData();
  };

  const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    pagination.currentPage = 1;
    loadData();
  };

  // Immediate load
  if (immediate) {
    loadData();
  }

  return {
    // State
    loading,
    tableData,
    total,
    searchQuery,
    pagination,

    // Methods
    loadData,
    handleSearch,
    handleRefresh,
    handlePageChange,
    handleSizeChange,
  };
}
