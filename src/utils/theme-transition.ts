import { createApp } from "vue";
import RippleEffect from "@/styles/RippleEffect.vue";

interface ThemeTransitionOptions {
  x: number;
  y: number;
  fromColor: string;
  toColor: string;
  onComplete: () => void;
}

export const createThemeTransition = (options: ThemeTransitionOptions) => {
  const rippleApp = createApp(RippleEffect, {
    x: options.x,
    y: options.y,
    color: options.toColor,
  });

  const container = document.createElement("div");
  document.body.appendChild(container);

  const instance = rippleApp.mount(container) as any;

  const handleTransitionEnd = () => {
    options.onComplete();

    setTimeout(() => {
      rippleApp.unmount();
      document.body.removeChild(container);
    }, 300);
  };

  setTimeout(() => {
    instance.handleTransitionEnd = handleTransitionEnd;
  }, 100);

  return instance;
};

export const getThemeColor = (isDark: boolean): string => {
  return isDark ? "#1a1a1a" : "#f5f7fa";
};
