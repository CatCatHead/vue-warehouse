// src/composables/useProgress.ts
import { ref } from "vue";
import { useRouter } from "vue-router";

export function useProgress() {
  const progress = ref(0);
  const isLoading = ref(false);
  const router = useRouter();

  const start = () => {
    isLoading.value = true;
    progress.value = 0;
    const timer = setInterval(() => {
      progress.value += Math.random() * 10;
      if (progress.value >= 90) {
        clearInterval(timer);
      }
    }, 200);
  };

  const finish = () => {
    isLoading.value = false;
    progress.value = 100;
    setTimeout(() => {
      progress.value = 0;
    }, 500);
  };

  router.beforeEach(() => {
    start();
  });

  router.afterEach(() => {
    finish();
  });

  return {
    progress,
    isLoading,
  };
}
