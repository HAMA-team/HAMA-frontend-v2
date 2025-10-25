"use client";

import React, { useEffect, useRef } from "react";

export interface DialogProps {
  open: boolean;
  type: "confirm" | "alert";
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function Dialog({
  open,
  type,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="presentation"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={() => onCancel?.()}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-xl border shadow-lg"
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: "var(--container-background)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="px-5 py-4">
          {title && (
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              {title}
            </h2>
          )}
          {message && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {message}
            </p>
          )}
        </div>
        <div className="px-5 py-3 flex items-center justify-end gap-2 border-t" style={{ borderColor: "var(--border-default)" }}>
          {type === "confirm" && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold rounded-lg border"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                borderColor: "var(--border-default)",
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold rounded-lg"
            style={{
              backgroundColor: "var(--primary-500)",
              color: "var(--lnb-active-text)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

