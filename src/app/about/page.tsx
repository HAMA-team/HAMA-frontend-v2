"use client";

import React from "react";
import { WhatIsHAMA, BusinessModel, TeamIntro } from "@/components/about/AboutContent";

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
      {/* About Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-6 py-8 w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight break-words" style={{ color: "var(--text-primary)" }}>
              About HAMA
            </h1>
            <p className="mt-2 text-base break-words" style={{ color: "var(--text-secondary)" }}>
              Human-in-the-Loop AI 투자 시스템
            </p>
          </div>

          {/* Sections */}
          <WhatIsHAMA />
          <BusinessModel />
          <TeamIntro />
        </div>
      </div>
    </div>
  );
}
