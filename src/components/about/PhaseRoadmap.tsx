"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

/**
 * Phase Roadmap 컴포넌트
 *
 * Phase 1 (B2C) → Phase 2 (B2B) 로드맵 시각화
 * - 다크모드 지원
 * - i18n 지원
 * - 호버 애니메이션
 */

export default function PhaseRoadmap() {
  const { t } = useTranslation();

  const phases = [
    {
      id: "phase1",
      key: "phase1",
    },
    {
      id: "phase2",
      key: "phase2",
    },
  ];

  return (
    <div>
      <h3
        className="text-2xl md:text-3xl font-bold text-center mb-3"
        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
      >
        {t("about.economic.phases.title")}
      </h3>
      <p
        className="text-center text-sm md:text-base mb-10"
        style={{ color: "var(--text-secondary)" }}
      >
        {t("about.economic.phases.tagline")}
      </p>

      {/* Phase Cards */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {phases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            {/* Phase Card */}
            <div
              className="flex-1 w-full max-w-md p-8 rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: "var(--container-background)",
                border: "1px solid var(--border-default)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-500)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(37, 99, 235, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div className="text-5xl mb-4 text-center">
                {t(`about.economic.phases.${phase.key}.icon`)}
              </div>

              {/* Title */}
              <h4
                className="text-xl md:text-2xl font-bold mb-2 text-center"
                style={{ color: "var(--text-primary)" }}
              >
                {t(`about.economic.phases.${phase.key}.title`)}
              </h4>

              {/* Subtitle */}
              <p
                className="text-center mb-6 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {t(`about.economic.phases.${phase.key}.subtitle`)}
              </p>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                    {t("about.economic.labels.target")}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {t(`about.economic.phases.${phase.key}.target`)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                    {t("about.economic.labels.pricing")}
                  </div>
                  <div className="text-lg font-bold" style={{ color: "var(--primary-600)" }}>
                    {t(`about.economic.phases.${phase.key}.pricing`)}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow (between phases) */}
            {index < phases.length - 1 && (
              <div className="hidden md:block flex-shrink-0">
                <ArrowRight
                  className="w-10 h-10"
                  style={{ color: "var(--primary-500)" }}
                  strokeWidth={2.5}
                />
              </div>
            )}

            {/* Arrow (mobile - vertical) */}
            {index < phases.length - 1 && (
              <div className="block md:hidden rotate-90 flex-shrink-0">
                <ArrowRight
                  className="w-10 h-10"
                  style={{ color: "var(--primary-500)" }}
                  strokeWidth={2.5}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
