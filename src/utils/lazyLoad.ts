// src/utils/lazyLoad.ts
import { defineAsyncComponent, type AsyncComponentLoader } from "vue";
import { ElLoading } from "element-plus";

/**
 * Lazy load component with loading state and error handling
 * @param loader Component import function
 * @param delay Loading delay in ms
 * @param timeout Timeout in ms
 * @param loadingComponent Custom loading component
 */
export function lazyLoad(
  loader: AsyncComponentLoader<any>,
  delay: number = 200,
  timeout: number = 10000,
  loadingComponent?: any,
) {
  return defineAsyncComponent({
    loader,
    delay,
    timeout,
    loadingComponent: loadingComponent || createLoadingComponent(),
    errorComponent: createErrorComponent(),
    onError(error, retry, fail, attempts) {
      console.error("Component load failed:", error);
      if (attempts <= 3) {
        retry();
      } else {
        fail();
      }
    },
  });
}

/**
 * Create default loading component
 */
function createLoadingComponent() {
  return {
    template: `
      <div class="lazy-loading-container">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <div class="loading-text">Loading...</div>
        </div>
      </div>
    `,
  };
}

/**
 * Create error component for lazy load failures
 */
function createErrorComponent() {
  return {
    props: ["error"],
    template: `
      <div class="lazy-load-error">
        <div class="error-content">
          <el-icon :size="48" color="#F56C6C"><Warning /></el-icon>
          <div class="error-message">Component failed to load</div>
          <el-button type="primary" @click="$emit('retry')">Retry</el-button>
        </div>
      </div>
    `,
    components: {
      Warning: () =>
        import("@element-plus/icons-vue").then((module) => module.Warning),
    },
  };
}

/**
 * Preload components for better user experience
 * @param components Array of component import functions
 */
export async function preloadComponents(components: Array<() => Promise<any>>) {
  const promises = components.map((component) => component().catch(() => null));
  await Promise.all(promises);
}
