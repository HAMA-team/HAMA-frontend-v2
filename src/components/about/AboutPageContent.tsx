"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { WhatIsHAMA, TeamIntro } from "@/components/about/AboutContent";
import EconomicViabilitySection from "@/components/about/EconomicViabilitySection";

/**
 * About Page Content
 *
 * i18n을 사용하는 About 페이지 콘텐츠
 * Dynamic import로 분리하여 hydration 에러 방지
 */
export default function AboutPageContent() {
  const { t } = useTranslation();

  return (
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
  );
}
