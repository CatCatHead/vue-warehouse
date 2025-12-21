import { useAuthStore } from "@/store/auth";

export type PermissionValue = string | string[];

export function hasPermission(value: PermissionValue): boolean {
  const authStore = useAuthStore();
  const userPerms = authStore.user?.permissions || [];

  if (!value) return true;

  const required = Array.isArray(value) ? value : [value];
  if (required.length === 0) return true;

  const permSet = new Set(userPerms);
  return required.some((p) => permSet.has(p));
}
