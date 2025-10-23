"use client";

import React, { useEffect } from "react";
import "@/lib/i18n";

/**
 * I18nProvider Component
 *
 * i18n 초기화를 위한 클라이언트 컴포넌트
 * - react-i18next 로드
 * - 브라우저 언어 자동 감지
 * - LocalStorage에서 언어 설정 불러오기
 *
 * @see ProductRequirements.md - US-7.1
 */

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // i18n is already initialized in lib/i18n.ts
    console.log("i18n initialized");
  }, []);

  return <>{children}</>;
}
