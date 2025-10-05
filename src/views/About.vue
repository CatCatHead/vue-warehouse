<template>
  <div class="about">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>About This Project</span>
        </div>
      </template>

      <p>This is a Vue 3 admin dashboard project built with modern web technologies.</p>

      <el-divider content-position="left">Technology Stack</el-divider>

      <el-table :data="techStack" style="width: 100%">
        <el-table-column prop="name" label="Technology" width="180" />
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="version" label="Version" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue'

interface TechItem {
  name: string
  description: string
  version: string
}

const techStack: TechItem[] = [
  { name: 'Vue 3', description: 'Progressive JavaScript Framework', version: '3.x' },
  { name: 'TypeScript', description: 'JavaScript with syntax for types', version: '5.x' },
  { name: 'Element Plus', description: 'Vue 3 Component Library', version: '2.x' },
  { name: 'Vite', description: 'Next Generation Frontend Tooling', version: '4.x' },
  { name: 'Vue Router', description: 'Official Router for Vue.js', version: '4.x' },
  { name: 'Pinia', description: 'Intuitive state management library', version: '2.x' }
]
</script>

<style scoped>
.about {
  max-width: 1200px;
}
</style>