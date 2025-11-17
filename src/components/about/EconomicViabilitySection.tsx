"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import TAMSAMSOMDiagram from "./TAMSAMSOMDiagram";
import MAUDisplay from "./MAUDisplay";
import PhaseRoadmap from "./PhaseRoadmap";

/**
 * Economic Viability Section (메인 컴포넌트)
 *
 * TAM/SAM/SOM, MAU, Scalability, Phase Roadmap을 통합
 * - 다크모드 지원
 * - i18n 지원
 * - About 페이지에서 사용
 */

export default function EconomicViabilitySection() {
  const { t } = useTranslation();

  return (
    <section
      className="py-8"
      style={{ backgroundColor: "var(--main-background)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {t("about.economic.title")}
          </h2>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto"
            style={{
              color: "var(--text-secondary)",
              lineHeight: "1.7",
            }}
          >
            {t("about.economic.subtitle")}
          </p>
        </div>

        {/* TAM/SAM/SOM + MAU Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div
            className="p-8 rounded-2xl"
            style={{
              backgroundColor: "var(--container-background)",
              border: "1px solid var(--border-default)",
            }}
          >
            <TAMSAMSOMDiagram />
          </div>
          <MAUDisplay />
        </div>

        {/* Phase Roadmap */}
        <PhaseRoadmap />
      </div>
    </section>
  );
}
