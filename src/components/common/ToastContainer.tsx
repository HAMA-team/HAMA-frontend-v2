"use client";

import React from "react";
import Toast from "./Toast";
import { useToastStore } from "@/store/toastStore";

/**
 * ToastContainer Component
 *
 * 전역 토스트 메시지를 관리하는 컨테이너
 * - Zustand store를 통해 토스트 상태 관리
 * - Shell 컴포넌트에 추가하여 앱 전역에서 사용
 *
 * @see ProductRequirements.md - US-1.3
 */

export default function ToastContainer() {
  const { isVisible, message, type, linkText, linkHref, hideToast } = useToastStore();

  if (!isVisible) {
    return null;
  }

  return (
    <Toast
      message={message}
      type={type}
      linkText={linkText}
      linkHref={linkHref}
      onClose={hideToast}
    />
  );
}
