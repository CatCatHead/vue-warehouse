import { reactive } from "vue";
import type { DialogItem, DialogPayload, DialogOptions } from "@/types/dialog";
import ConfirmBody from "@/components/common/GDialog/ConfirmBody.vue";

// Constants
const MAX_DIALOGS = 20;

// ID generation with better uniqueness
function genId(): string {
  return `dlg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const dialogList = reactive<DialogItem<any>[]>([]);

export function addDialog<T = any>(
  item: DialogOptions<T> & {
    callBack?: (payload?: DialogPayload<T>) => void;
  },
) {
  // Prevent memory leaks by limiting maximum dialogs
  if (dialogList.length >= MAX_DIALOGS) {
    console.warn(
      `Maximum dialog limit (${MAX_DIALOGS}) reached. Closing oldest dialog.`,
    );
    closeDialogById(dialogList[0].id);
  }

  const id = genId();

  // Prevent duplicate IDs (though very unlikely with the new ID generation)
  if (dialogList.some((dialog) => dialog.id === id)) {
    console.warn(`Dialog with id ${id} already exists`);
    return id;
  }

  const merged: DialogItem<T> = {
    id,
    title: "Dialog",
    width: "520px",
    top: "15vh",
    appendToBody: true,
    modal: true,
    closeOnClickModal: false,
    destroyOnClose: true,
    zIndex: 2000,
    closable: true,
    closeOnPressEscape: true,
    show: true,
    visible: true,
    ...item,
  };

  dialogList.push(merged);
  return id;
}

export function closeDialogById<T = any>(
  id: string,
  payload?: DialogPayload<T>,
  { isNativeClose = false }: { isNativeClose?: boolean } = {},
) {
  const index = dialogList.findIndex((d) => d.id === id);
  if (index === -1) return;

  const item = dialogList[index] as DialogItem<T>;
  item.visible = false;

  // Use double requestAnimationFrame for better timing with CSS transitions
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dialogList.splice(index, 1);
      if (!isNativeClose) {
        item.callBack?.(payload);
      }
    });
  });
}

export function nativeClose(id: string) {
  closeDialogById(id, undefined, { isNativeClose: true });
}

export function closeAllDialogs() {
  // Close all dialogs with animation
  dialogList.forEach((dialog) => {
    dialog.visible = false;
  });

  // Remove all after animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dialogList.length = 0;
    });
  });
}

export function closeDialogsByRoute(routePath: string) {
  const dialogsToClose = dialogList.filter(
    (dialog) => dialog.pathKey === routePath,
  );
  dialogsToClose.forEach((dialog) => {
    closeDialogById(dialog.id);
  });
}

export function addConfirm(opts: {
  title?: string;
  message: string;
  width?: string | number;
  confirmText?: string;
  cancelText?: string;
}) {
  return new Promise<boolean>((resolve) => {
    addDialog({
      title: opts.title ?? "Confirm",
      width: opts.width ?? 420,
      modal: true,
      closeOnClickModal: false,
      component: ConfirmBody,
      props: {
        message: opts.message,
        confirmText: opts.confirmText ?? "Confirm",
        cancelText: opts.cancelText ?? "Cancel",
      },
      callBack: (p) => resolve(!!p?.ok),
    });
  });
}

// Utility function to get dialog by ID
export function getDialogById(id: string): DialogItem<any> | undefined {
  return dialogList.find((dialog) => dialog.id === id);
}

// Utility function to check if any dialogs are open
export function hasOpenDialogs(): boolean {
  return dialogList.length > 0;
}
