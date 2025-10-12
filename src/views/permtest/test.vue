<template>
  <el-button v-has-perm="'user:add'" type="primary">Create</el-button>
  <el-button v-has-perm="'user:edit'">Edit</el-button>
  <el-button v-has-perm="'user:delete'" type="danger">Delete</el-button>
  <el-button>Always Visible</el-button>
</template>
<script setup lang="ts"></script>
