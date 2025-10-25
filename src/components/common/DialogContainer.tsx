"use client";

import React from "react";
import Dialog from "./Dialog";
import { useDialogStore } from "@/store/dialogStore";
import { useTranslation } from "react-i18next";

export default function DialogContainer() {
  const { t, i18n } = useTranslation();
  const { isOpen, type, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, close } = useDialogStore();

  const handleConfirm = () => {
    try {
      onConfirm?.();
    } finally {
      close();
    }
  };
  const handleCancel = () => {
    try {
      onCancel?.();
    } finally {
      close();
    }
  };

  return (
    <Dialog
      open={isOpen}
      type={type}
      title={title}
      message={message}
      confirmLabel={confirmLabel || t('common.confirm')}
      cancelLabel={cancelLabel || t('common.cancel')}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}

