<!-- src/views/tracking/TrackingScan.vue -->
<template>
  <div class="page-container">
    <el-card class="scan-card" shadow="never">
      <div class="scan-form">
        <el-form :inline="true" label-width="110px">
          <el-form-item label="Carrier">
            <el-select
              v-model="carrier"
              placeholder="Select carrier"
              style="width: 220px"
            >
              <el-option label="FedEx Express" value="FEDEX_EXPRESS" />
              <el-option label="FedEx Ground" value="FEDEX_GROUND" />
              <el-option label="UPS" value="UPS" />
              <el-option label="Other" value="OTHER" />
            </el-select>
          </el-form-item>

          <el-form-item label="Input Mode">
            <el-radio-group v-model="inputMode">
              <el-radio label="auto">Auto detect (Scanner / Keyboard)</el-radio>
              <el-radio label="manual">Manual only</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="scan-input-wrapper">
          <label class="scan-label">Scan or type here</label>
          <el-input
            ref="scanInputRef"
            v-model="scanValue"
            placeholder="Focus here and scan tracking number"
            @focus="handleFocus"
            @blur="handleBlur"
            @keyup.enter="handleEnter"
            clearable
          >
            <template #suffix>
              <el-tag size="small" type="info">
                {{ focused ? "Focused" : "Click to focus" }}
              </el-tag>
            </template>
          </el-input>

          <div class="hint-text">
            <p>
              • Use barcode scanner as keyboard input. Make sure this field has
              focus.
            </p>
            <p>
              • Auto mode: fast input (length ≥ {{ minLength }} and duration ≤
              {{ maxDuration }} ms) will be treated as scanner.
            </p>
          </div>

          <div class="actions-row">
            <el-button type="primary" @click="handleManualSubmit">
              Submit manually
            </el-button>
            <el-button @click="clearScanInput">Clear</el-button>
            <el-button
              link
              :type="keepFocus ? 'primary' : 'default'"
              @click="toggleFocusLock"
            >
              <el-icon><aim /></el-icon>
              {{ keepFocus ? "Unlock focus" : "Lock focus" }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="list-card" shadow="never">
      <div class="list-header">
        <div>
          <span class="list-title">Recent scans</span>
          <span class="list-subtitle">(latest {{ recentLimit }} items)</span>
        </div>
        <div>
          <el-button link @click="clearRecentList">Clear list</el-button>
        </div>
      </div>

      <el-table :data="recentList" border style="width: 100%">
        <el-table-column prop="time" label="Time" width="180" />
        <el-table-column prop="carrier" label="Carrier" width="140">
          <template #default="{ row }">
            {{ renderCarrier(row.carrier) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="trackingNumber"
          label="Tracking Number"
          min-width="220"
        />
        <el-table-column prop="source" label="Source" width="120" />
        <el-table-column prop="status" label="Status" width="140">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'SUCCESS' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="Message" min-width="220" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Aim } from "@element-plus/icons-vue";

import {
  createTrackingEntry,
  type CreateTrackingEntryDto,
} from "@/api/trackingEntry";

const carrier = ref<string>("FEDEX_EXPRESS");

const inputMode = ref<"auto" | "manual">("auto");

const scanValue = ref<string>("");

const scanInputRef = ref();

const focused = ref(false);

const scannedSet = new Set<string>();

const minLength = 6;
const maxDuration = 300;

let scanStartTime: number | null = null;
let lastKeyTime: number | null = null;

// auto scan delay and timer
const scanEndDelay = 180;
let scanTimeout: number | null = null;

interface RecentItem {
  time: string;
  carrier: string;
  trackingNumber: string;
  source: string;
  status: "SUCCESS" | "ERROR";
  message: string;
}

const recentList = reactive<RecentItem[]>([]);
const recentLimit = 50;

// button to control auto-focus
const keepFocus = ref(false);

function toggleFocusLock() {
  keepFocus.value = !keepFocus.value;

  if (keepFocus.value) {
    focusInput();
    ElMessage.success("Focus locked");
  } else {
    ElMessage.info("Focus unlocked");
  }
}

function pushRecent(item: RecentItem) {
  recentList.unshift(item);
  if (recentList.length > recentLimit) {
    recentList.splice(recentLimit);
  }
}

function focusInput() {
  setTimeout(() => {
    if (scanInputRef.value && typeof scanInputRef.value.focus === "function") {
      scanInputRef.value.focus();
      focused.value = true;
    }
  }, 0);
}

function handleFocus() {
  focused.value = true;
}

function handleBlur() {
  focused.value = false;

  if (keepFocus.value) {
    setTimeout(() => {
      focusInput();
    }, 0);
  }
}

async function handleEnter() {
  const value = scanValue.value.trim();
  if (!value) return;

  resetScanTiming();

  const now = performance.now();
  const duration = scanStartTime != null ? now - scanStartTime : 9999;
  const length = value.length;

  let isScanner = false;
  if (inputMode.value === "auto") {
    isScanner = length >= minLength && duration <= maxDuration;
  }

  await submitTracking(value, isScanner ? "SCANNER" : "KEYBOARD");
  resetScanState();
  focusInput();
}

async function handleManualSubmit() {
  const value = scanValue.value.trim();
  if (!value) {
    ElMessage.warning("Please input tracking number first.");
    return;
  }
  await submitTracking(value, "MANUAL_BUTTON");
}

function clearScanInput() {
  resetScanState();
}

function clearRecentList() {
  recentList.splice(0, recentList.length);
}

async function submitTracking(value: string, source: string) {
  const carrierValue = carrier.value;
  if (!carrierValue) {
    ElMessage.warning("Please select carrier first.");
    return;
  }

  const key = `${carrierValue}|${value}`;

  if (scannedSet.has(key)) {
    pushRecent({
      time: new Date().toLocaleString(),
      carrier: carrierValue,
      trackingNumber: value,
      source,
      status: "ERROR",
      message: "Duplicate in current session",
    });
    ElMessage.warning(
      "This tracking number has already been scanned in this session.",
    );
    clearScanInput();
    focusInput();
    return;
  }

  const payload: CreateTrackingEntryDto = {
    carrier: carrierValue,
    trackingNumber: value,
    scanSource: `PC_${source}`,
    scannedAt: new Date().toISOString(),
  };

  try {
    await createTrackingEntry(payload);

    pushRecent({
      time: new Date().toLocaleString(),
      carrier: carrierValue,
      trackingNumber: value,
      source,
      status: "SUCCESS",
      message: "Saved",
    });

    ElMessage.success("Tracking entry saved.");
    clearScanInput();
    focusInput();
  } catch (error: any) {
    console.error("Failed to create tracking entry:", error);

    const msg =
      (error && (error.message || error.msg || error.error)) ||
      "Failed to save";

    pushRecent({
      time: new Date().toLocaleString(),
      carrier: carrierValue,
      trackingNumber: value,
      source,
      status: "ERROR",
      message: msg,
    });

    ElMessage.error(msg);
  }
}

function resetScanTiming() {
  if (scanTimeout != null) {
    clearTimeout(scanTimeout);
    scanTimeout = null;
  }
  scanStartTime = null;
}

function resetScanState() {
  resetScanTiming();
  scanValue.value = "";
}

async function autoSubmitIfScannerWithoutEnter() {
  const value = scanValue.value.trim();
  if (!value) {
    resetScanTiming();
    return;
  }

  if (inputMode.value !== "auto") {
    resetScanTiming();
    return;
  }

  const now = performance.now();
  const duration = scanStartTime != null ? now - scanStartTime : 0;
  const length = value.length;

  const isScanner = length >= minLength && duration <= maxDuration;

  if (!isScanner) {
    resetScanTiming();
    return;
  }

  try {
    await submitTracking(value, "SCANNER");
  } finally {
    resetScanState();
    focusInput();
  }
}

function renderCarrier(c: string) {
  switch (c) {
    case "FEDEX_EXPRESS":
      return "FedEx Express";
    case "FEDEX_GROUND":
      return "FedEx Ground";
    case "UPS":
      return "UPS";
    case "OTHER":
      return "Other";
    default:
      return c || "-";
  }
}

watch(
  () => scanValue.value,
  (newVal) => {
    const value = newVal?.trim() ?? "";

    if (!value) {
      resetScanTiming();
      return;
    }

    const now = performance.now();

    if (scanStartTime == null) {
      scanStartTime = now;
    }

    if (inputMode.value !== "auto") {
      return;
    }

    if (scanTimeout != null) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }

    scanTimeout = window.setTimeout(() => {
      autoSubmitIfScannerWithoutEnter();
    }, scanEndDelay);
  },
);

onMounted(() => {
  focusInput();
});

onBeforeUnmount(() => {});
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.scan-card {
  margin-bottom: 16px;
}

.scan-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scan-input-wrapper {
  margin-top: 4px;
}

.scan-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.actions-row {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.list-card {
  margin-bottom: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-title {
  font-weight: 600;
  margin-right: 8px;
}

.list-subtitle {
  font-size: 12px;
  color: #999;
}
</style>
