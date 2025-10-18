// src/directives/lazyLoad.ts
import type { Directive } from "vue";

export const lazyLoad: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          observer.unobserve(el);
        }
      });
    });

    observer.observe(el);
  },
};
