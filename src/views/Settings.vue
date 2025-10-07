<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">System Settings</h1>
        <el-text type="info"
          >Configure system preferences and global settings</el-text
        >
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Check" @click="saveAllSettings">
          Save All Changes
        </el-button>
        <el-button :icon="Refresh" @click="resetSettings">
          Reset to Default
        </el-button>
      </div>
    </div>

    <!-- Settings Layout -->
    <el-row :gutter="20">
      <!-- Settings Navigation -->
      <el-col :xs="24" :md="8" :lg="6">
        <el-card class="settings-nav-card">
          <el-menu
            v-model="activeSetting"
            class="settings-menu"
            :default-active="activeSetting"
          >
            <el-menu-item index="general">
              <el-icon><Setting /></el-icon>
              <span>General Settings</span>
            </el-menu-item>
            <el-menu-item index="appearance">
              <el-icon><View /></el-icon>
              <span>Appearance</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>Security</span>
            </el-menu-item>
            <el-menu-item index="notifications">
              <el-icon><Bell /></el-icon>
              <span>Notifications</span>
            </el-menu-item>
            <el-menu-item index="backup">
              <el-icon><DataBoard /></el-icon>
              <span>Backup & Restore</span>
            </el-menu-item>
            <el-menu-item index="advanced">
              <el-icon><Cpu /></el-icon>
              <span>Advanced</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- Settings Content -->
      <el-col :xs="24" :md="16" :lg="18">
        <el-card class="settings-content-card">
          <!-- General Settings -->
          <div v-if="activeSetting === 'general'" class="settings-section">
            <h2 class="section-title">General Settings</h2>
            <el-form :model="settings.general" label-width="180px">
              <el-form-item label="Application Name">
                <el-input
                  v-model="settings.general.appName"
                  placeholder="Enter application name"
                  style="width: 300px"
                />
              </el-form-item>

              <el-form-item label="System Language">
                <el-select
                  v-model="settings.general.language"
                  placeholder="Select language"
                  style="width: 200px"
                >
                  <el-option label="English" value="en" />
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="繁體中文" value="zh-TW" />
                </el-select>
              </el-form-item>

              <el-form-item label="Time Zone">
                <el-select
                  v-model="settings.general.timezone"
                  placeholder="Select time zone"
                  style="width: 300px"
                >
                  <el-option
                    label="UTC-8:00 Pacific Time"
                    value="America/Los_Angeles"
                  />
                  <el-option
                    label="UTC-5:00 Eastern Time"
                    value="America/New_York"
                  />
                  <el-option label="UTC+0:00 London" value="Europe/London" />
                  <el-option label="UTC+8:00 Beijing" value="Asia/Shanghai" />
                </el-select>
              </el-form-item>

              <el-form-item label="Date Format">
                <el-radio-group v-model="settings.general.dateFormat">
                  <el-radio label="YYYY-MM-DD">2024-01-20</el-radio>
                  <el-radio label="MM/DD/YYYY">01/20/2024</el-radio>
                  <el-radio label="DD/MM/YYYY">20/01/2024</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Auto Save">
                <el-switch v-model="settings.general.autoSave" />
                <span class="setting-description">
                  Automatically save changes without confirmation
                </span>
              </el-form-item>
            </el-form>
          </div>

          <!-- Appearance Settings -->
          <div v-if="activeSetting === 'appearance'" class="settings-section">
            <h2 class="section-title">Appearance</h2>
            <el-form :model="settings.appearance" label-width="180px">
              <el-form-item label="Theme Mode">
                <el-radio-group v-model="settings.appearance.themeMode">
                  <el-radio label="light">Light</el-radio>
                  <el-radio label="dark">Dark</el-radio>
                  <el-radio label="auto">Auto (System)</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Primary Color">
                <div class="color-picker-group">
                  <el-color-picker
                    v-model="settings.appearance.primaryColor"
                    :predefine="predefinedColors"
                  />
                  <span class="color-value">{{
                    settings.appearance.primaryColor
                  }}</span>
                </div>
              </el-form-item>

              <el-form-item label="Layout Style">
                <el-radio-group v-model="settings.appearance.layout">
                  <el-radio label="sidebar">Sidebar Navigation</el-radio>
                  <el-radio label="top">Top Navigation</el-radio>
                  <el-radio label="mix">Mixed Navigation</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Page Animation">
                <el-switch v-model="settings.appearance.animation" />
                <span class="setting-description">
                  Enable page transition animations
                </span>
              </el-form-item>

              <el-form-item label="Dense Mode">
                <el-switch v-model="settings.appearance.denseMode" />
                <span class="setting-description">
                  Compact layout with smaller spacing
                </span>
              </el-form-item>
            </el-form>
          </div>

          <!-- Security Settings -->
          <div v-if="activeSetting === 'security'" class="settings-section">
            <h2 class="section-title">Security Settings</h2>
            <el-form :model="settings.security" label-width="180px">
              <el-form-item label="Password Policy">
                <el-select
                  v-model="settings.security.passwordPolicy"
                  style="width: 300px"
                >
                  <el-option label="Low - Minimum 6 characters" value="low" />
                  <el-option
                    label="Medium - Minimum 8 characters with numbers"
                    value="medium"
                  />
                  <el-option
                    label="High - Minimum 10 characters with numbers and symbols"
                    value="high"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Session Timeout">
                <el-input-number
                  v-model="settings.security.sessionTimeout"
                  :min="5"
                  :max="480"
                  controls-position="right"
                />
                <span class="unit-text">minutes</span>
              </el-form-item>

              <el-form-item label="Two-Factor Authentication">
                <el-switch v-model="settings.security.twoFactorAuth" />
              </el-form-item>

              <el-form-item label="Login Attempts">
                <el-input-number
                  v-model="settings.security.maxLoginAttempts"
                  :min="3"
                  :max="10"
                  controls-position="right"
                />
                <span class="unit-text">attempts before lockout</span>
              </el-form-item>

              <el-form-item label="IP Whitelist">
                <el-input
                  v-model="settings.security.ipWhitelist"
                  type="textarea"
                  :rows="3"
                  placeholder="Enter IP addresses (one per line)"
                  style="width: 400px"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- Notifications Settings -->
          <div
            v-if="activeSetting === 'notifications'"
            class="settings-section"
          >
            <h2 class="section-title">Notification Preferences</h2>
            <el-form :model="settings.notifications" label-width="180px">
              <el-form-item label="Email Notifications">
                <el-switch v-model="settings.notifications.emailEnabled" />
              </el-form-item>

              <el-form-item label="Push Notifications">
                <el-switch v-model="settings.notifications.pushEnabled" />
              </el-form-item>

              <el-divider content-position="left"
                >Notification Types</el-divider
              >

              <el-form-item label="New User Registration">
                <el-switch v-model="settings.notifications.types.newUser" />
              </el-form-item>

              <el-form-item label="System Updates">
                <el-switch
                  v-model="settings.notifications.types.systemUpdate"
                />
              </el-form-item>

              <el-form-item label="Security Alerts">
                <el-switch
                  v-model="settings.notifications.types.securityAlert"
                />
              </el-form-item>

              <el-form-item label="Performance Reports">
                <el-switch
                  v-model="settings.notifications.types.performanceReport"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- Backup & Restore -->
          <div v-if="activeSetting === 'backup'" class="settings-section">
            <h2 class="section-title">Backup & Restore</h2>

            <el-card class="backup-card" shadow="never">
              <template #header>
                <div class="backup-header">
                  <span>Automatic Backups</span>
                  <el-switch v-model="settings.backup.autoBackup" />
                </div>
              </template>

              <el-form :model="settings.backup" label-width="180px">
                <el-form-item label="Backup Frequency">
                  <el-select
                    v-model="settings.backup.frequency"
                    style="width: 200px"
                  >
                    <el-option label="Daily" value="daily" />
                    <el-option label="Weekly" value="weekly" />
                    <el-option label="Monthly" value="monthly" />
                  </el-select>
                </el-form-item>

                <el-form-item label="Retention Period">
                  <el-input-number
                    v-model="settings.backup.retentionDays"
                    :min="7"
                    :max="365"
                    controls-position="right"
                  />
                  <span class="unit-text">days</span>
                </el-form-item>
              </el-form>
            </el-card>

            <div class="backup-actions">
              <el-button type="primary" :icon="Download" @click="createBackup">
                Create Backup Now
              </el-button>
              <el-button :icon="Upload" @click="showRestoreDialog">
                Restore from Backup
              </el-button>
            </div>

            <!-- Backup History -->
            <el-card class="backup-history" shadow="never">
              <template #header>
                <span>Recent Backups</span>
              </template>
              <el-table :data="backupHistory" style="width: 100%">
                <el-table-column prop="date" label="Date" width="180" />
                <el-table-column prop="size" label="Size" width="120" />
                <el-table-column prop="type" label="Type" width="120">
                  <template #default="scope">
                    <el-tag :type="scope.row.type === 'auto' ? '' : 'success'">
                      {{ scope.row.type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Actions" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="downloadBackup(scope.row)">
                      Download
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <!-- Advanced Settings -->
          <div v-if="activeSetting === 'advanced'" class="settings-section">
            <h2 class="section-title">Advanced Settings</h2>
            <el-alert
              title="Warning"
              description="These settings are for advanced users only. Incorrect configuration may cause system instability."
              type="warning"
              show-icon
              :closable="false"
              class="advanced-warning"
            />

            <el-form :model="settings.advanced" label-width="180px">
              <el-form-item label="Debug Mode">
                <el-switch v-model="settings.advanced.debugMode" />
              </el-form-item>

              <el-form-item label="API Rate Limit">
                <el-input-number
                  v-model="settings.advanced.apiRateLimit"
                  :min="10"
                  :max="1000"
                  controls-position="right"
                />
                <span class="unit-text">requests per minute</span>
              </el-form-item>

              <el-form-item label="Cache Duration">
                <el-input-number
                  v-model="settings.advanced.cacheDuration"
                  :min="1"
                  :max="60"
                  controls-position="right"
                />
                <span class="unit-text">minutes</span>
              </el-form-item>

              <el-form-item label="Log Level">
                <el-select
                  v-model="settings.advanced.logLevel"
                  style="width: 200px"
                >
                  <el-option label="Error" value="error" />
                  <el-option label="Warning" value="warn" />
                  <el-option label="Info" value="info" />
                  <el-option label="Debug" value="debug" />
                </el-select>
              </el-form-item>

              <el-form-item label="Custom CSS">
                <el-input
                  v-model="settings.advanced.customCSS"
                  type="textarea"
                  :rows="4"
                  placeholder="Enter custom CSS code"
                  style="width: 400px"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Check,
  Refresh,
  Setting,
  View,
  Lock,
  Bell,
  DataBoard,
  Cpu,
  Download,
  Upload,
} from "@element-plus/icons-vue";

// Active settings section
const activeSetting = ref("general");

// Predefined colors for color picker
const predefinedColors = reactive([
  "#409EFF",
  "#67C23A",
  "#E6A23C",
  "#F56C6C",
  "#909399",
  "#ff4500",
  "#ff8c00",
  "#ffd700",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585",
]);

// Settings data structure
const settings = reactive({
  general: {
    appName: "VaaS Admin",
    language: "en",
    timezone: "Asia/Shanghai",
    dateFormat: "YYYY-MM-DD",
    autoSave: true,
  },
  appearance: {
    themeMode: "auto",
    primaryColor: "#409EFF",
    layout: "sidebar",
    animation: true,
    denseMode: false,
  },
  security: {
    passwordPolicy: "medium",
    sessionTimeout: 30,
    twoFactorAuth: false,
    maxLoginAttempts: 5,
    ipWhitelist: "",
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    types: {
      newUser: true,
      systemUpdate: true,
      securityAlert: true,
      performanceReport: false,
    },
  },
  backup: {
    autoBackup: true,
    frequency: "weekly",
    retentionDays: 30,
  },
  advanced: {
    debugMode: false,
    apiRateLimit: 100,
    cacheDuration: 10,
    logLevel: "info",
    customCSS: "",
  },
});

// Backup history data
const backupHistory = reactive([
  { date: "2024-01-20 14:30:25", size: "45.2 MB", type: "auto" },
  { date: "2024-01-13 14:30:25", size: "43.8 MB", type: "auto" },
  { date: "2024-01-06 14:30:25", size: "42.1 MB", type: "auto" },
  { date: "2024-01-02 10:15:30", size: "45.5 MB", type: "manual" },
]);

// Load settings from localStorage on component mount
onMounted(() => {
  loadSettings();
});

// Load settings from localStorage
const loadSettings = () => {
  const savedSettings = localStorage.getItem("vaas-settings");
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      Object.assign(settings, parsedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }
};

// Save all settings to localStorage
const saveAllSettings = async () => {
  try {
    localStorage.setItem("vaas-settings", JSON.stringify(settings));
    ElMessage.success("Settings saved successfully");
  } catch (error) {
    ElMessage.error("Failed to save settings");
  }
};

// Reset settings to default
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to reset all settings to default? This action cannot be undone.",
      "Reset Settings",
      {
        confirmButtonText: "Reset",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    localStorage.removeItem("vaas-settings");
    location.reload(); // Reload to apply default settings
  } catch (error) {
    // User canceled the reset
  }
};

// Create backup
const createBackup = () => {
  ElMessage.info("Backup creation started. This may take a few minutes.");
  // Simulate backup process
  setTimeout(() => {
    ElMessage.success("Backup created successfully");
    // Add to backup history
    backupHistory.unshift({
      date: new Date().toLocaleString("zh-CN"),
      size: "46.1 MB",
      type: "manual",
    });
  }, 2000);
};

// Show restore dialog
const showRestoreDialog = () => {
  ElMessage.info("Restore functionality will be implemented");
};

// Download backup
const downloadBackup = (backup: any) => {
  ElMessage.info(`Downloading backup from ${backup.date}`);
};
</script>

<style scoped>
.settings-page {
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

/* Settings Navigation */
.settings-nav-card {
  margin-bottom: 20px;
}

.settings-menu {
  border: none;
}

.settings-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 6px;
}

.settings-menu .el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* Settings Content */
.settings-content-card {
  min-height: 600px;
}

.settings-section {
  padding: 0 20px;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.setting-description {
  margin-left: 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.unit-text {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

/* Color Picker */
.color-picker-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-value {
  font-family: "Courier New", monospace;
  color: var(--el-text-color-regular);
}

/* Backup Section */
.backup-card {
  margin-bottom: 20px;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-actions {
  margin: 20px 0;
  display: flex;
  gap: 12px;
}

.backup-history {
  margin-top: 20px;
}

/* Advanced Warning */
.advanced-warning {
  margin-bottom: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-section {
    padding: 0 10px;
  }

  .backup-actions {
    flex-direction: column;
  }

  .backup-actions .el-button {
    width: 100%;
  }
}
</style>
