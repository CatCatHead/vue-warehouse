<!-- src/components/common/MockBanner.vue -->
<template>
  <div v-if="visible" class="mock-banner">
    <el-alert
      :title="bannerTitle"
      type="info"
      :closable="true"
      show-icon
      @close="handleClose"
    >
      <template #description>
        <div class="banner-description">
          <span>{{ bannerDescription }}</span>
          <div class="banner-actions">
            <el-button type="text" size="small" @click="toggleDetails">
              {{ showDetails ? "Hide" : "Show" }} Details
            </el-button>
            <el-button
              v-if="config.useMock"
              type="text"
              size="small"
              @click="reloadWithoutMock"
            >
              Try Real API
            </el-button>
          </div>

          <div v-if="showDetails" class="mock-details">
            <el-divider />
            <p><strong>Mock Mode Details:</strong></p>
            <ul>
              <li>All data is stored locally and will reset on page refresh</li>
              <li>File uploads are simulated</li>
              <li>API delays: {{ config.mockDelay }}ms</li>
              <li>Backend URL: {{ config.apiBaseUrl }}</li>
            </ul>
          </div>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { config, isMockMode } from "@/utils/config";

const visible = ref(true);
const showDetails = ref(false);

const bannerTitle = computed(() => {
  return isMockMode
    ? "Development Mode - Using Mock Data"
    : "Development Mode - Connected to Backend";
});

const bannerDescription = computed(() => {
  return isMockMode
    ? "Backend API is not available. Using mock data for demonstration."
    : "Connected to backend API. All changes will persist.";
});

const handleClose = () => {
  visible.value = false;
  localStorage.setItem("hide-mock-banner", "true");
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const reloadWithoutMock = () => {
  if (confirm("Switch to real API mode? This will reload the page.")) {
    localStorage.setItem("force-real-api", "true");
    window.location.reload();
  }
};
</script>

<style scoped>
.mock-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.banner-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.banner-actions {
  display: flex;
  gap: 16px;
}

.mock-details {
  font-size: 12px;
  color: #666;
}

.mock-details ul {
  margin: 8px 0;
  padding-left: 16px;
}

.mock-details li {
  margin: 4px 0;
}
</style>
