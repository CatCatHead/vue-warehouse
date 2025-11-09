<!-- src/components/common/FileUpload/FileUpload.vue -->
<template>
  <div class="file-upload">
    <!-- Upload Trigger -->
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      class="upload-demo"
      action="#"
      :auto-upload="false"
      :multiple="true"
      :limit="maxFiles"
      :accept="acceptTypes"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      list-type="picture-card"
    >
      <el-icon><Plus /></el-icon>

      <template #tip>
        <div class="el-upload__tip">
          {{ uploadTip }}
        </div>
      </template>

      <template #file="{ file }">
        <div class="file-item">
          <!-- Image Preview -->
          <img
            v-if="file.type?.startsWith('image/')"
            :src="file.url"
            class="file-preview"
            alt="preview"
            @click="handlePreview(file)"
          />

          <!-- PDF Icon -->
          <div
            v-else-if="file.type === 'application/pdf'"
            class="pdf-preview"
            @click="handlePreview(file)"
          >
            <el-icon class="pdf-icon"><Document /></el-icon>
            <span class="pdf-text">PDF</span>
          </div>

          <!-- Other File Type -->
          <div v-else class="other-file-preview" @click="handlePreview(file)">
            <el-icon class="file-icon"><Document /></el-icon>
            <span class="file-text">{{ getFileExtension(file.name) }}</span>
          </div>

          <!-- File Info -->
          <div class="file-info">
            <span class="file-name" :title="file.name">{{
              getShortFileName(file.name)
            }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>

          <!-- Actions -->
          <span class="file-actions">
            <el-icon class="delete-btn" @click="handleRemove(file)">
              <Close />
            </el-icon>
          </span>

          <!-- Upload Progress -->
          <el-progress
            v-if="file.status === 'uploading'"
            :percentage="file.percentage || 0"
            :stroke-width="4"
            class="upload-progress"
          />
        </div>
      </template>
    </el-upload>

    <!-- Upload Actions -->
    <div class="upload-actions" v-if="fileList.length > 0">
      <el-button @click="clearFiles" :disabled="uploading">
        Clear All
      </el-button>
      <el-button
        type="primary"
        @click="handleUpload"
        :loading="uploading"
        :disabled="fileList.length === 0"
      >
        {{
          uploading
            ? `Uploading... (${uploadedCount}/${fileList.length})`
            : `Upload ${fileList.length} File(s)`
        }}
      </el-button>
    </div>

    <!-- File Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      :title="previewFile?.name"
      width="80%"
      top="5vh"
      align-center
      @close="handlePreviewClose"
    >
      <div class="preview-content">
        <!-- Image Preview -->
        <img
          v-if="previewFile?.type?.startsWith('image/')"
          :src="previewFile.url"
          class="preview-image"
          alt="preview"
        />

        <!-- PDF Preview -->
        <div
          v-else-if="previewFile?.type === 'application/pdf'"
          class="pdf-preview-content"
        >
          <el-icon class="pdf-preview-icon"><Document /></el-icon>
          <p class="pdf-preview-text">PDF Preview</p>
          <p class="pdf-preview-filename">{{ previewFile?.name }}</p>
          <el-button type="primary" @click="downloadFile(previewFile)">
            Download PDF
          </el-button>
        </div>

        <!-- Other File Preview -->
        <div v-else class="other-file-preview-content">
          <el-icon class="file-preview-icon"><Document /></el-icon>
          <p class="file-preview-text">File Preview Not Available</p>
          <p class="file-preview-filename">{{ previewFile?.name }}</p>
          <el-button type="primary" @click="downloadFile(previewFile)">
            Download File
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type UploadInstance,
  type UploadRawFile,
  type UploadFile,
} from "element-plus";
import { Plus, Close, Document } from "@element-plus/icons-vue";

interface Props {
  maxFiles?: number;
  maxSize?: number; // MB
  acceptTypes?: string;
  autoUpload?: boolean;
  uploadTip?: string;
  multiple?: boolean;
}

interface Emits {
  (e: "upload-success", files: UploadFile[]): void;
  (e: "upload-error", error: Error): void;
  (e: "files-change", files: UploadFile[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  maxSize: 10, // 10MB
  acceptTypes: ".jpg,.jpeg,.png,.pdf,.gif,.bmp",
  autoUpload: false,
  multiple: true,
  uploadTip: "Support jpg, png, pdf files, each file should not exceed 10MB",
});

const emit = defineEmits<Emits>();

// Refs
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadFile[]>([]);
const previewVisible = ref(false);
const previewFile = ref<UploadFile | null>(null);
const uploading = ref(false);
const uploadedCount = ref(0);

// Computed
const totalFileSize = computed(() => {
  return fileList.value.reduce((total, file) => total + (file.size || 0), 0);
});

// Watchers
watch(
  fileList,
  (newFiles) => {
    emit("files-change", newFiles);
  },
  { deep: true },
);

// Methods
const handleExceed = (files: File[]) => {
  ElMessage.warning(
    `Maximum ${props.maxFiles} files allowed. You selected ${files.length} files.`,
  );
};

const beforeUpload = (rawFile: UploadRawFile) => {
  const allowedTypes = props.acceptTypes.split(",");
  const fileExtension = "." + rawFile.name.split(".").pop()?.toLowerCase();

  if (!allowedTypes.includes(fileExtension)) {
    ElMessage.error(
      `File type ${fileExtension} is not allowed. Supported types: ${props.acceptTypes}`,
    );
    return false;
  }
  const isLtMaxSize = rawFile.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    ElMessage.error(`File size should not exceed ${props.maxSize}MB`);
    return false;
  }

  return true;
};

const handleChange = (file: UploadFile, fileList: UploadFile[]) => {
  console.log("File changed:", file, fileList);
};

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.indexOf(file);
  if (index > -1) {
    fileList.value.splice(index, 1);
  }
};

const handlePreview = (file: UploadFile) => {
  previewFile.value = file;
  previewVisible.value = true;
};

const handlePreviewClose = () => {
  previewVisible.value = false;
  previewFile.value = null;
};

const clearFiles = () => {
  if (fileList.value.length === 0) return;

  ElMessageBox.confirm("Are you sure to clear all files?", "Confirm Clear", {
    confirmButtonText: "Clear All",
    cancelButtonText: "Cancel",
    type: "warning",
  }).then(() => {
    fileList.value = [];
    ElMessage.success("All files cleared");
  });
};

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning("Please select files to upload");
    return;
  }

  uploading.value = true;
  uploadedCount.value = 0;

  try {
    const files = fileList.value.map((file) => file.raw!);

    const responses = await uploadApi.uploadFiles(files, (progress) => {
      console.log("Total progress:", progress);
    });

    ElMessage.success(`Successfully uploaded ${fileList.value.length} file(s)`);
    emit("upload-success", responses);
  } catch (error) {
    ElMessage.error("Upload failed. Please try again.");
    emit("upload-error", error as Error);
  } finally {
    uploading.value = false;
    uploadedCount.value = 0;
  }
};

const downloadFile = (file: UploadFile | null) => {
  if (!file) return;

  if (file.url) {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  } else {
    ElMessage.info("Download functionality to be implemented with backend API");
  }
};

const getShortFileName = (filename: string, maxLength: number = 20): string => {
  if (filename.length <= maxLength) return filename;

  const extension = filename.split(".").pop();
  const name = filename.substring(0, filename.lastIndexOf("."));
  const charsToShow = maxLength - extension!.length - 4; // 4 for "..."

  return name.substring(0, charsToShow) + "..." + extension;
};

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toUpperCase() || "FILE";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

defineExpose({
  clearFiles,
  startUpload: handleUpload,
  getFiles: () => fileList.value,
  addFiles: (files: File[]) => {
    files.forEach((file) => {
      const uploadFile: UploadFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        raw: file,
        status: "ready",
        uid: Date.now() + Math.random(),
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadFile.url = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      fileList.value.push(uploadFile);
    });
  },
});
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* File Item Styles */
.file-item {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 8px 8px 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s;
}

.file-item:hover {
  border-color: var(--el-color-primary);
}

.file-preview {
  width: 100%;
  height: 60px;
  object-fit: cover;
  cursor: pointer;
}

.pdf-preview,
.other-file-preview {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  cursor: pointer;
}

.pdf-icon,
.file-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.pdf-text,
.file-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

/* File Info */
.file-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px;
  font-size: 10px;
  line-height: 1.2;
}

.file-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  opacity: 0.8;
}

/* File Actions */
.file-actions {
  position: absolute;
  top: 2px;
  right: 2px;
}

.delete-btn {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 2px;
  font-size: 12px;
  color: var(--el-color-danger);
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: var(--el-color-danger);
  color: white;
  transform: scale(1.1);
}

/* Upload Progress */
.upload-progress {
  position: absolute;
  bottom: 20px;
  left: 10px;
  right: 10px;
}

/* Upload Actions */
.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Preview Dialog */
.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.pdf-preview-content,
.other-file-preview-content {
  text-align: center;
  padding: 40px;
}

.pdf-preview-icon,
.file-preview-icon {
  font-size: 64px;
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.pdf-preview-text,
.file-preview-text {
  font-size: 18px;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.pdf-preview-filename,
.file-preview-filename {
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .file-item {
    width: 80px;
    height: 80px;
  }

  .preview-content {
    min-height: 300px;
  }

  .upload-actions {
    flex-direction: column;
  }

  .upload-actions .el-button {
    width: 100%;
  }
}
</style>
