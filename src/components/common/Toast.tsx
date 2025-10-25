"use client";

import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import Link from "next/link";

/**
 * Toast Component
 *
 * 성공/실패 등의 알림을 표시하는 토스트 메시지
 * - 3초 후 자동으로 사라짐
 * - 닫기 버튼 제공
 * - 링크 버튼 지원 (예: "Artifacts 페이지에서 보기")
 *
 * @see ProductRequirements.md - US-1.3
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  linkText?: string;
  linkHref?: string;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  linkText,
  linkHref,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success"
    ? "var(--success-500)"
    : type === "error"
    ? "var(--error-500)"
    : "var(--info-500)";

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-toast animate-toast-in"
      role="alert"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
        style={{
          backgroundColor: bgColor,
          color: "var(--lnb-active-text)",
          minWidth: "320px",
          maxWidth: "480px",
        }}
      >
        {/* Icon */}
        <CheckCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-semibold">{message}</p>
          {linkText && linkHref && (
            <Link
              href={linkHref}
              className="text-xs underline mt-1 inline-block hover:opacity-80 transition-opacity duration-150"
              style={{ color: "var(--lnb-active-text)" }}
            >
              {linkText}
            </Link>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity duration-150"
          aria-label="닫기"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
