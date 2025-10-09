// Use English comments only
import { reactive } from "vue";
import type { DialogItem, DialogPayload } from "@/types/dialog";
import ConfirmBody from "@/components/common/GDialog/ConfirmBody.vue";

let seed = 0;
function genId() {
  seed += 1;
  return `dlg_${Date.now()}_${seed}`;
}

export const dialogList = reactive<DialogItem<any>[]>([]);

export function addDialog<T = any>(
  item: Omit<DialogItem<T>, "id" | "visible" | "show">,
) {
  const id = genId();
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
  const i = dialogList.findIndex((d) => d.id === id);
  if (i === -1) return;
  const item = dialogList[i] as DialogItem<T>;
  item.visible = false;

  window.setTimeout(() => {
    dialogList.splice(i, 1);
    if (!isNativeClose) {
      item.callBack?.(payload);
    }
  }, 300);
}

export function nativeClose(id: string) {
  closeDialogById(id, undefined, { isNativeClose: true });
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
