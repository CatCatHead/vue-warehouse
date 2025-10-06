<template>
  <transition name="ripple">
    <div v-if="visible" class="ripple-effect" :style="rippleStyle"></div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Props {
  x: number;
  y: number;
  color: string;
}

const props = defineProps<Props>();

const visible = ref(false);
const size = ref(0);

const rippleStyle = computed(() => ({
  "--x": `${props.x}px`,
  "--y": `${props.y}px`,
  "--size": `${size.value}px`,
  "--color": props.color,
  "--duration": "800ms",
}));

const maxSize = computed(() => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const distances = [
    Math.hypot(props.x, props.y),
    Math.hypot(screenWidth - props.x, props.y),
    Math.hypot(props.x, screenHeight - props.y),
    Math.hypot(screenWidth - props.x, screenHeight - props.y),
  ];
  return Math.max(...distances) * 2;
});

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
    requestAnimationFrame(() => {
      size.value = maxSize.value;
    });
  });
});

const handleTransitionEnd = () => {
  visible.value = false;
};

defineExpose({
  handleTransitionEnd,
});
</script>

<style scoped>
.ripple-effect {
  position: fixed;
  left: var(--x);
  top: var(--y);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--color);
  transform: translate(-50%, -50%);
  opacity: 0.8;
  z-index: 9999;
  pointer-events: none;
  transition:
    width var(--duration) cubic-bezier(0.4, 0, 0.2, 1),
    height var(--duration) cubic-bezier(0.4, 0, 0.2, 1),
    opacity var(--duration) cubic-bezier(0.4, 0, 0.2, 1);
}

.ripple-enter-active,
.ripple-leave-active {
  transition: opacity 300ms;
}

.ripple-enter-from,
.ripple-leave-to {
  opacity: 0;
}

.ripple-effect {
  width: var(--size);
  height: var(--size);
}
</style>
