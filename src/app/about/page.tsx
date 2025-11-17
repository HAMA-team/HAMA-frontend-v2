"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamic import로 hydration 에러 방지
const AboutContent = dynamic(() => import("@/components/about/AboutPageContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{
          borderColor: "var(--primary-500)",
          borderTopColor: "transparent",
        }}
      />
    </div>
  ),
});

/**
 * About Page
 *
 * HAMA 프로젝트 소개 및 비즈니스 모델 설명
 * 캡스톤 발표회에서 교수님들께 보여줄 수 있는 내용
 *
 * 구조:
 * - HAMA란?
 * - 비즈니스 모델 (수익 구조, 타겟 고객, 시장 분석)
 * - 팀 소개
 *
 * 각 섹션은 AboutContent.tsx에서 관리하여 수정 용이
 */
export default function AboutPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      <AboutContent />
    </div>
  );
}
