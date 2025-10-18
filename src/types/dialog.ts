import type { Component } from "vue";

export interface DialogPayload<T = any> {
  ok?: boolean;
  data?: T;
}

export interface DialogOptions<T = any> {
  title?: string;
  component: Component;
  props?: Record<string, any>;
  width?: string | number;
  top?: string;
  appendToBody?: boolean;
  modal?: boolean;
  closeOnClickModal?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
  // New options
  closable?: boolean; // Whether to show close button
  closeOnPressEscape?: boolean; // Whether to close on ESC key
  customClass?: string; // Custom CSS class
}

export interface DialogItem<T = any> extends DialogOptions<T> {
  id: string;
  show: boolean;
  visible: boolean;
  pathKey?: string;
  callBack?: (payload?: DialogPayload<T>) => void;
}
