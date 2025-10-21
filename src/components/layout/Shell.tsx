"use client";

import React from "react";
import LNB from "./LNB";

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
  return (
    <div className="flex min-h-screen bg-app-bg">
      {/* LNB - 좌측 고정 사이드바 */}
      <LNB />

      {/* Main Content - 남은 공간 모두 사용 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
