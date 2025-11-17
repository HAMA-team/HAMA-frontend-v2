"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { WhatIsHAMA, TeamIntro } from "@/components/about/AboutContent";
import EconomicViabilitySection from "@/components/about/EconomicViabilitySection";

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
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      {/* About Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-6 py-8 w-full">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {t("about.title")}
            </h1>
            <p
              className="text-lg md:text-xl"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {t("about.subtitle")}
            </p>
          </div>

          {/* Sections */}
          <WhatIsHAMA />
          <EconomicViabilitySection />
          <TeamIntro />
        </div>
      </div>
    </div>
  );
}
