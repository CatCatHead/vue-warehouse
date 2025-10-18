export { default as DialogHost } from "./DialogHost.vue";
export {
  dialogList,
  addDialog,
  closeDialogById,
  nativeClose,
  addConfirm,
  closeAllDialogs,
  closeDialogsByRoute,
  getDialogById,
  hasOpenDialogs,
} from "@/composables/useDialog";
