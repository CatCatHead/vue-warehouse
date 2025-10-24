<template>
  <!-- Search Trigger Button -->
  <el-tooltip content="Global Search (Ctrl+K)" placement="bottom">
    <el-button
      class="search-trigger"
      :icon="Search"
      circle
      @click="openSearch"
    />
  </el-tooltip>

  <!-- Search Modal -->
  <el-dialog
    v-model="searchState.isOpen"
    :show-close="false"
    width="600px"
    top="20vh"
    class="global-search-dialog"
    @close="closeSearch"
  >
    <!-- Search Input -->
    <div class="search-input-container">
      <el-input
        ref="searchInputRef"
        v-model="searchState.query"
        placeholder="Search for pages, users, tracking numbers, or actions..."
        :prefix-icon="Search"
        size="large"
        clearable
        @input="handleSearchInput"
        @keydown="handleKeydown"
      />
      <div class="search-hint">
        <kbd>↑↓</kbd> to navigate • <kbd>Enter</kbd> to select •
        <kbd>Esc</kbd> to close
      </div>
    </div>

    <!-- Search Results -->
    <div class="search-results">
      <div v-if="searchState.isLoading" class="loading-state">
        <el-icon class="is-loading" :size="20"><Loading /></el-icon>
        <span>Searching...</span>
      </div>

      <div v-else-if="!searchState.query.trim()" class="empty-state">
        <el-icon :size="48"><Search /></el-icon>
        <p>Type to search across the system</p>
        <div class="quick-tips">
          <div class="tip">
            Try searching for: <strong>users</strong>,
            <strong>settings</strong>, <strong>tracking</strong>
          </div>
        </div>
      </div>

      <div v-else-if="searchState.results.length === 0" class="empty-state">
        <el-icon :size="48"><QuestionFilled /></el-icon>
        <p>No results found for "{{ searchState.query }}"</p>
        <div class="suggestions">
          <div class="suggestion">• Check your spelling</div>
          <div class="suggestion">• Try different keywords</div>
          <div class="suggestion">• Search for something else</div>
        </div>
      </div>

      <div v-else class="results-container">
        <div
          v-for="(category, categoryName) in groupedResults"
          :key="categoryName"
          class="result-category"
        >
          <div class="category-header">
            <span class="category-name">{{ categoryName }}</span>
            <span class="category-count">{{ category.length }}</span>
          </div>

          <div class="category-results">
            <div
              v-for="(result, index) in category"
              :key="result.id"
              class="result-item"
              :class="{
                selected: isSelected(result),
                page: result.type === 'page',
                user: result.type === 'user',
                tracking: result.type === 'tracking',
                action: result.type === 'action',
              }"
              @click="selectResult(result)"
              @mouseenter="
                setSelectedIndex(getGlobalIndex(categoryName, index))
              "
            >
              <div class="result-icon">
                <el-icon>
                  <component :is="result.icon" />
                </el-icon>
              </div>

              <div class="result-content">
                <div class="result-title">
                  {{ result.title }}
                  <el-tag
                    v-if="result.type !== 'page'"
                    :type="getResultTagType(result.type)"
                    size="small"
                  >
                    {{ result.type }}
                  </el-tag>
                </div>
                <div class="result-description">
                  {{ result.description }}
                </div>
              </div>

              <div class="result-actions">
                <kbd>Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { Search, Loading, QuestionFilled } from "@element-plus/icons-vue";
import { useGlobalSearch } from "@/composables/useGlobalSearch";

const {
  searchState,
  groupedResults,
  openSearch,
  closeSearch,
  selectResult,
  handleKeydown,
} = useGlobalSearch();

const searchInputRef = ref();

/**
 * Open search and focus input
 */
const handleOpenSearch = async () => {
  openSearch();
  await nextTick();
  searchInputRef.value?.focus();
};

/**
 * Handle search input
 */
const handleSearchInput = () => {
  // Search is handled by the watcher in the composable
};

/**
 * Check if result is selected
 */
const isSelected = (result: any) => {
  const globalIndex = getGlobalIndex(
    result.category,
    groupedResults.value[result.category]?.findIndex(
      (r: any) => r.id === result.id,
    ) || 0,
  );
  return globalIndex === searchState.value.selectedIndex;
};

/**
 * Get global index across all categories
 */
const getGlobalIndex = (
  categoryName: string,
  categoryIndex: number,
): number => {
  let globalIndex = 0;
  for (const [name, category] of Object.entries(groupedResults.value)) {
    if (name === categoryName) {
      return globalIndex + categoryIndex;
    }
    globalIndex += category.length;
  }
  return globalIndex;
};

/**
 * Set selected index
 */
const setSelectedIndex = (index: number) => {
  searchState.value.selectedIndex = index;
};

/**
 * Get tag type for result
 */
const getResultTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    user: "success",
    tracking: "warning",
    action: "info",
    setting: "primary",
  };
  return typeMap[type] || "info";
};

/**
 * Handle keyboard shortcuts
 */
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    handleOpenSearch();
  }
};

// Register global keyboard shortcut
onMounted(() => {
  document.addEventListener("keydown", handleKeyboardShortcut);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyboardShortcut);
});
</script>

<style scoped>
.search-trigger {
  margin-right: 8px;
}

.global-search-dialog {
  border-radius: 12px;
}

:deep(.global-search-dialog .el-dialog__header) {
  display: none;
}

:deep(.global-search-dialog .el-dialog__body) {
  padding: 0;
}

.search-input-container {
  padding: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.search-input-container .el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.search-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

kbd {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--el-text-color-secondary);
}

.empty-state .el-icon {
  margin-bottom: 16px;
  color: var(--el-text-color-placeholder);
}

.quick-tips,
.suggestions {
  margin-top: 16px;
  font-size: 14px;
}

.suggestions {
  text-align: left;
  max-width: 200px;
  margin: 16px auto 0;
}

.tip,
.suggestion {
  margin: 4px 0;
}

.results-container {
  padding: 0 16px;
}

.result-category {
  margin-bottom: 24px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 8px;
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-count {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 10px;
}

.category-results {
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.result-item:hover {
  background: var(--el-fill-color-light);
}

.result-item.selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.result-item.page .result-icon {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.result-item.user .result-icon {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.result-item.tracking .result-icon {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.result-item.action .result-icon {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 4px;
}

.result-title .el-tag {
  height: 18px;
  line-height: 16px;
  font-size: 10px;
}

.result-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.result-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.result-item:hover .result-actions,
.result-item.selected .result-actions {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .global-search-dialog {
    width: 90vw !important;
    margin: 10vh auto;
  }

  .search-input-container {
    padding: 16px;
  }

  .search-results {
    max-height: 50vh;
  }
}
</style>
