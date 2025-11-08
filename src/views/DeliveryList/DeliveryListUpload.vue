<template>
  <div class="upload-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Batch File Upload</span>
        </div>
      </template>

      <FileUpload
        :max-files="5"
        :max-size="5"
        accept-types=".jpg,.jpeg,.png,.pdf"
        upload-tip="Support jpg, png, pdf files, each file should not exceed 5MB"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
        @files-change="handleFilesChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { FileUpload } from "@/components/common/FileUpload";
import { ElMessage } from "element-plus";

const handleUploadSuccess = (files: any[]) => {
  ElMessage.success(`Successfully uploaded ${files.length} files`);
  console.log("Uploaded files:", files);
};

const handleUploadError = (error: Error) => {
  console.error("Upload error:", error);
};

const handleFilesChange = (files: any[]) => {
  console.log("Files changed:", files);
};
</script>

<style scoped>
.upload-page {
  padding: 20px;
}
</style>
