import type { Directive, DirectiveBinding } from "vue";
import { hasPermission, type PermissionValue } from "@/utils/permission";

interface PermissionBinding extends DirectiveBinding {
  value: PermissionValue;
  modifiers: {
    disable?: boolean; // v-permission.disable
  };
}

const permissionDirective: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding: PermissionBinding) {
    applyPermission(el, binding);
  },
  updated(el, binding: PermissionBinding) {
    applyPermission(el, binding);
  },
};

function applyPermission(el: HTMLElement, binding: PermissionBinding) {
  const value = binding.value;
  const hasPerm = hasPermission(value);

  if (binding.modifiers.disable) {
    const disabled = !hasPerm;
    (el as any).disabled = disabled;
    if (disabled) {
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
    } else {
      el.classList.remove("is-disabled");
      el.removeAttribute("aria-disabled");
    }
    return;
  }

  if (!hasPerm && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

export default permissionDirective;
