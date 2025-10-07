<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Dashboard</h1>
        <el-text type="info">System overview and key metrics</el-text>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData">
          Refresh
        </el-button>
        <el-button :icon="Calendar" @click="handleDateRange">
          Date Range
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon user-stat">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1,248</div>
              <div class="stat-label">Total Users</div>
              <div class="stat-trend trend-up">
                <el-icon><TrendCharts /></el-icon>
                <span>12.5%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon order-stat">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">3,456</div>
              <div class="stat-label">Total Orders</div>
              <div class="stat-trend trend-up">
                <el-icon><TrendCharts /></el-icon>
                <span>8.3%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon revenue-stat">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥ 89,245</div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-trend trend-up">
                <el-icon><TrendCharts /></el-icon>
                <span>15.7%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon view-stat">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">45.6K</div>
              <div class="stat-label">Page Views</div>
              <div class="stat-trend trend-down">
                <el-icon><TrendCharts /></el-icon>
                <span>3.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Section -->
    <el-row :gutter="20" class="charts-section">
      <!-- Revenue Chart -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>Revenue Overview</span>
              <el-radio-group v-model="chartDateRange" size="small">
                <el-radio-button label="week">Week</el-radio-button>
                <el-radio-button label="month">Month</el-radio-button>
                <el-radio-button label="year">Year</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- Placeholder for chart - we'll use a mock chart visual -->
            <div class="mock-chart">
              <div class="chart-bars">
                <div
                  v-for="(item, index) in revenueData"
                  :key="index"
                  class="chart-bar"
                  :style="{ height: (item.value / 5000) * 100 + '%' }"
                >
                  <div class="bar-value">¥{{ item.value }}</div>
                </div>
              </div>
              <div class="chart-labels">
                <div
                  v-for="(item, index) in revenueData"
                  :key="index"
                  class="chart-label"
                >
                  {{ item.month }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- User Analytics -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <span>User Analytics</span>
          </template>
          <div class="chart-container">
            <div class="pie-chart-mock">
              <div class="pie-segment new-users">
                <div class="segment-label">New Users</div>
                <div class="segment-value">65%</div>
              </div>
              <div class="pie-segment returning-users">
                <div class="segment-label">Returning</div>
                <div class="segment-value">35%</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions & Recent Activity -->
    <el-row :gutter="20" class="bottom-section">
      <!-- Quick Actions -->
      <el-col :xs="24" :lg="12">
        <el-card class="action-card">
          <template #header>
            <span>Quick Actions</span>
          </template>
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.id"
              :icon="action.icon"
              class="action-button"
              @click="handleQuickAction(action.id)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Recent Activity -->
      <el-col :xs="24" :lg="12">
        <el-card class="activity-card">
          <template #header>
            <span>Recent Activity</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.time"
              :type="activity.type"
            >
              <div class="activity-item">
                <div class="activity-content">
                  <span class="activity-user">{{ activity.user }}</span>
                  <span class="activity-action">{{ activity.action }}</span>
                </div>
                <el-tag
                  v-if="activity.tag"
                  :type="activity.tagType"
                  size="small"
                >
                  {{ activity.tag }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  Refresh,
  Calendar,
  User,
  ShoppingCart,
  Money,
  View,
  TrendCharts,
  Plus,
  Edit,
  Download,
  Upload,
  Setting,
} from "@element-plus/icons-vue";

// Chart data
const chartDateRange = ref("month");
const revenueData = reactive([
  { month: "Jan", value: 12500 },
  { month: "Feb", value: 18900 },
  { month: "Mar", value: 15600 },
  { month: "Apr", value: 23400 },
  { month: "May", value: 19800 },
  { month: "Jun", value: 28700 },
]);

// Quick actions
const quickActions = reactive([
  { id: "add-user", label: "Add User", icon: Plus },
  { id: "manage-users", label: "Manage Users", icon: User },
  { id: "export-data", label: "Export Data", icon: Download },
  { id: "import-data", label: "Import Data", icon: Upload },
  { id: "system-settings", label: "Settings", icon: Setting },
  { id: "edit-profile", label: "Edit Profile", icon: Edit },
]);

// Recent activities
const recentActivities = reactive([
  {
    id: 1,
    user: "John Doe",
    action: "created a new user account",
    time: "2024-01-20 14:30",
    type: "primary",
    tag: "User",
    tagType: "success",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "updated system settings",
    time: "2024-01-20 13:15",
    type: "warning",
    tag: "System",
    tagType: "warning",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "exported user data",
    time: "2024-01-20 11:45",
    type: "info",
    tag: "Export",
    tagType: "info",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "processed 245 orders",
    time: "2024-01-20 10:20",
    type: "success",
    tag: "Orders",
    tagType: "success",
  },
]);

// Methods
const refreshData = () => {
  ElMessage.success("Data refreshed successfully");
  // In real application, this would trigger API calls
};

const handleDateRange = () => {
  ElMessage.info("Date range selector will be implemented");
};

const handleQuickAction = (actionId: string) => {
  switch (actionId) {
    case "add-user":
      ElMessage.info("Navigate to add user page");
      break;
    case "manage-users":
      ElMessage.info("Navigate to user management");
      break;
    case "export-data":
      ElMessage.info("Export data functionality");
      break;
    case "import-data":
      ElMessage.info("Import data functionality");
      break;
    case "system-settings":
      ElMessage.info("Navigate to system settings");
      break;
    case "edit-profile":
      ElMessage.info("Navigate to profile edit");
      break;
  }
};
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left .page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* Statistics Cards */
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.user-stat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.order-stat {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.revenue-stat {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.view-stat {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  color: var(--el-color-success);
}

.trend-down {
  color: var(--el-color-error);
}

/* Charts Section */
.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mock Chart Styles */
.mock-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  padding: 20px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #409eff, #79bbff);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-width: 40px;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.bar-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid var(--el-border-color-light);
}

.chart-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

/* Pie Chart Mock */
.pie-chart-mock {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(#409eff 0% 65%, #67c23a 65% 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-segment {
  position: absolute;
  text-align: center;
}

.new-users {
  top: 30%;
  left: 25%;
}

.returning-users {
  top: 30%;
  right: 25%;
}

.segment-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.segment-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* Bottom Section */
.bottom-section {
  margin-bottom: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-button {
  width: 100%;
  height: 60px;
  justify-content: flex-start;
  padding-left: 20px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-content {
  flex: 1;
}

.activity-user {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.activity-action {
  color: var(--el-text-color-regular);
  margin-left: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .chart-card {
    height: 300px;
  }
}
</style>
