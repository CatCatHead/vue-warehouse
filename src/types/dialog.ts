import type { Component } from "vue";

export interface DialogPayload<T = any> {
  ok?: boolean;
  data?: T;
}

export interface DialogItem<T = any> {
  id: string;
  title?: string;
  component: Component;
  props?: Record<string, any>;
  width?: string | number;
  top?: string;
  appendToBody?: boolean;
  modal?: boolean;
  closeOnClickModal?: boolean;
  destroyOnClose?: boolean;
  show: boolean;
  visible: boolean;
  pathKey?: string;
  zIndex?: number;
  callBack?: (payload?: DialogPayload<T>) => void;
}
