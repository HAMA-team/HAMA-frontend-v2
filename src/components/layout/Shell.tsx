"use client";

import React from "react";
import LNB from "./LNB";
import { useLNBWidth } from "@/hooks/useLNBWidth";
import ToastContainer from "@/components/common/ToastContainer";

interface ShellProps {
  children: React.ReactNode;
}

/**
 * Shell Component
 *
 * 전체 레이아웃 래퍼 컴포넌트
 * - LNB (좌측 고정 260px)
 * - Main Content (flexbox로 남은 공간 차지)
 *
 * Design System v2.1 기반
 */
export default function Shell({ children }: ShellProps) {
  const { width: lnbWidth } = useLNBWidth();

  return (
    <div className="flex min-h-screen bg-app-bg overflow-x-hidden" style={{ width: "100vw", maxWidth: "100vw" }}>
      {/* LNB - 좌측 고정 사이드바 */}
      <LNB />

      {/* Main Content - 남은 공간 모두 사용 */}
      <main
        className="overflow-x-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: `${lnbWidth}px`,
          width: `calc(100vw - ${lnbWidth}px)`
        }}
      >
        {children}
      </main>

      {/* Toast Container - 전역 토스트 메시지 */}
      <ToastContainer />
    </div>
  );
}
