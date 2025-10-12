import type { Directive } from "vue";
import { useAuthStore } from "@/store/auth";

export const hasPerm: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const ok = useAuthStore().hasPerm(binding.value);
    if (!ok && el.parentNode) el.parentNode.removeChild(el);
  },
};
