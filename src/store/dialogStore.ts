import { create } from 'zustand';

type DialogType = 'confirm' | 'alert';

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  openConfirm: (opts: {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  openAlert: (opts: {
    title?: string;
    message?: string;
    confirmLabel?: string; // OK label
    onConfirm?: () => void;
  }) => void;
  close: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  type: 'alert',
  title: undefined,
  message: undefined,
  confirmLabel: undefined,
  cancelLabel: undefined,
  onConfirm: undefined,
  onCancel: undefined,

  openConfirm: ({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) =>
    set({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onCancel,
    }),

  openAlert: ({ title, message, confirmLabel, onConfirm }) =>
    set({
      isOpen: true,
      type: 'alert',
      title,
      message,
      confirmLabel,
      cancelLabel: undefined,
      onConfirm,
      onCancel: undefined,
    }),

  close: () =>
    set({
      isOpen: false,
      onConfirm: undefined,
      onCancel: undefined,
    }),
}));

