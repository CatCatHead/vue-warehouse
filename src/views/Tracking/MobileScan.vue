<template>
  <div class="mobile-scan">
    <!-- 配置区域：承运商选择 + 自动提交开关 -->
    <div class="config-bar">
      <el-select
        v-model="selectedCarrier"
        size="small"
        class="carrier-select"
        placeholder="Carrier"
      >
        <el-option
          v-for="c in carriers"
          :key="c.value"
          :label="c.label"
          :value="c.value"
        />
      </el-select>

      <el-switch v-model="autoSubmit" size="small" active-text="Auto submit" />
    </div>

    <!-- 预览区域 -->
    <div class="preview-wrapper">
      <video
        ref="videoRef"
        class="preview-video"
        autoplay
        playsinline
        muted
      ></video>

      <div class="scan-frame"></div>
    </div>

    <el-button
      type="primary"
      class="scan-btn"
      :loading="isScanning"
      @click="toggleScanning"
    >
      {{ isScanning ? "Stop scanning" : "Start scanning" }}
    </el-button>

    <!-- 扫描历史 -->
    <div class="history-panel">
      <div class="history-header">
        <span>Recent scans</span>
        <el-link type="info" v-if="scanHistory.length" @click="clearHistory">
          Clear
        </el-link>
      </div>

      <el-empty
        v-if="!scanHistory.length"
        description="No scans yet"
        :image-size="60"
      />

      <ul v-else class="history-list">
        <li
          v-for="record in scanHistory"
          :key="record.id"
          class="history-item"
          :class="record.status"
        >
          <div class="code-line">
            <span class="code">{{ record.code }}</span>
            <span class="carrier">{{ record.carrier }}</span>
          </div>
          <div class="meta-line">
            <span class="time">{{ record.time }}</span>
            <span class="status-tag" :data-status="record.status">
              {{ record.statusLabel }}
            </span>
            <el-link
              v-if="record.status === 'error'"
              type="danger"
              @click="retryRecord(record)"
            >
              Retry
            </el-link>
          </div>
          <div v-if="record.message" class="msg-line">
            {{ record.message }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from "vue";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { ElMessage } from "element-plus";
import { trackingEntryApi } from "@/api/trackingEntry";

type ScanStatus = "pending" | "success" | "error";

interface ScanRecord {
  id: number;
  code: string;
  carrier: string;
  time: string;
  status: ScanStatus;
  message?: string;
}

const videoRef = ref<HTMLVideoElement | null>(null);
const isScanning = ref(false);

const codeReader = new BrowserMultiFormatReader();

const carriers = [
  { label: "UPS", value: "UPS" },
  { label: "FedEx", value: "FEDEX" },
  { label: "FedEx-Express", value: "FedEx-Express" },
  { label: "Other", value: "OTHER" },
];
const selectedCarrier = ref<string>("UPS");

const autoSubmit = ref(true);

const scanHistory = ref<ScanRecord[]>([]);
let nextRecordId = 1;

const DEDUP_WINDOW_MS = 5000;

const recentMap = new Map<string, number>();

const hasHistory = computed(() => scanHistory.value.length > 0);

async function startScanning() {
  if (!videoRef.value) return;

  isScanning.value = true;

  try {
    await codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.value,
      (result, err) => {
        if (result) {
          const text = result.getText().trim();
          handleDecoded(text).catch((e) =>
            console.error("handleDecoded error:", e),
          );
        } else if (err) {
          //
        }
      },
    );

    if (videoRef.value) {
      const v = videoRef.value;
      v.onloadedmetadata = () => v.play().catch(() => {});
    }
  } catch (e) {
    console.error("Failed to start scanning:", e);
    ElMessage.error("Failed to start camera.");
    isScanning.value = false;
  }
}

async function stopScanning() {
  try {
    codeReader.reset();
  } catch (e) {
    console.warn("Error while resetting reader:", e);
  }

  if (videoRef.value) {
    const v = videoRef.value;
    const stream = v.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    v.srcObject = null;
  }

  isScanning.value = false;
}

async function toggleScanning() {
  if (isScanning.value) {
    await stopScanning();
  } else {
    await stopScanning();
    await startScanning();
  }
}

async function handleDecoded(rawCode: string) {
  const code = rawCode.trim();
  if (!code) return;

  const now = Date.now();
  const last = recentMap.get(code);
  if (last && now - last < DEDUP_WINDOW_MS) {
    return;
  }
  recentMap.set(code, now);

  if (navigator.vibrate) {
    navigator.vibrate(80);
  }

  const record: ScanRecord = {
    id: nextRecordId++,
    code,
    carrier: selectedCarrier.value,
    time: new Date().toLocaleTimeString(),
    status: "pending",
  };
  scanHistory.value.unshift(record);
  if (scanHistory.value.length > 50) {
    scanHistory.value.pop();
  }

  if (!autoSubmit.value) {
    record.status = "error";
    record.message = "Auto submit is off. Tap Retry to submit.";
    return;
  }

  await submitRecord(record);
}

async function submitRecord(record: ScanRecord) {
  record.status = "pending";
  record.message = undefined;

  try {
    await trackingEntryApi.createTrackingEntry({
      carrier: record.carrier,
      trackingNumber: record.code,
      scanSource: "MOBILE",
      scannedAt: new Date().toISOString(),
    });

    record.status = "success";
    record.message = undefined;
  } catch (e: any) {
    console.error("submitRecord error:", e);
    record.status = "error";
    record.message =
      e?.message || "Submit failed. Please check network or server logs.";
  }
}

async function retryRecord(record: ScanRecord) {
  await submitRecord(record);
}

function clearHistory() {
  scanHistory.value = [];
  recentMap.clear();
}

onBeforeUnmount(() => {
  stopScanning();
});

const statusLabelMap: Record<ScanStatus, string> = {
  pending: "Submitting…",
  success: "Success",
  error: "Error",
};

scanHistory.value = new Proxy(scanHistory.value, {
  //
}) as any;
</script>

<style scoped>
.mobile-scan {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.config-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.carrier-select {
  flex: 1;
}

.preview-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 0 auto;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-frame {
  position: absolute;
  inset: 16px;
  border: 3px solid #00ff00;
  border-radius: 12px;
  pointer-events: none;
}

.scan-btn {
  margin: 12px auto;
  width: 220px;
}

.history-panel {
  margin-top: 8px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
  color: #666;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 6px;
  font-size: 12px;
}

.history-item.success {
  border-color: #10b981;
  background: #ecfdf5;
}

.history-item.error {
  border-color: #f97373;
  background: #fef2f2;
}

.code-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.code {
  font-weight: 600;
  font-size: 13px;
}

.carrier {
  color: #4b5563;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.time {
  flex-shrink: 0;
}

.status-tag {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid #d1d5db;
}

.status-tag[data-status="success"] {
  border-color: #059669;
  color: #065f46;
}

.status-tag[data-status="error"] {
  border-color: #dc2626;
  color: #991b1b;
}

.status-tag[data-status="pending"] {
  border-color: #2563eb;
  color: #1d4ed8;
}

.msg-line {
  margin-top: 2px;
  color: #9ca3af;
}
</style>
