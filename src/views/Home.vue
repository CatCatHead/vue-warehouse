<template>
  <div class="home">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Welcome to Admin Dashboard</span>
        </div>
      </template>

      <p>This is the homepage of your Vue 3 admin dashboard.</p>

      <el-divider content-position="left">Features</el-divider>

      <div class="features">
        <div v-for="feature in features" :key="feature.name" class="feature-item">
          <strong>{{ feature.name }}</strong>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </el-card>

    <el-card class="welcome-card">
      <p>Welcome, {{ userInfo.name }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { USER_INFO } from '@/constants/app'

const userInfo = USER_INFO

const features = [
  {
    name: 'Vue 3',
    description: 'Composition API and TypeScript'
  },
  {
    name: 'Element Plus',
    description: 'Modern UI components'
  },
  {
    name: 'Vue Router',
    description: 'Ready to use application routing'
  }
]
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.features {
  text-align: left;
}

.feature-item {
  margin-bottom: 16px;
}

.feature-item strong {
  color: #409EFF;
}

.welcome-card {
  margin-top: 20px;
  text-align: center;
}
</style>