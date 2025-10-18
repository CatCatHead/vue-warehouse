// src/utils/lazyLoad.ts
export const lazyLoad = (component: () => Promise<any>) => ({
    component: component(),
    loading: {
        template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span style="margin-left: 8px;">loading...</span>
      </div>
    `
    },
    delay: 200,
    timeout: 5000
})

{
    path: 'users',
        component: () => lazyLoad(() => import('@/views/system/user/index.vue')).component
}