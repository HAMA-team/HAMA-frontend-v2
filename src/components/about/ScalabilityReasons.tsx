"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";

/**
 * Scalability Reasons 컴포넌트
 *
 * 왜 확장 가능한지 3가지 이유 표시
 * - 다크모드 지원
 * - i18n 지원
 */

export default function ScalabilityReasons() {
  const { t } = useTranslation();

  const reasons = [
    {
      key: "reason1",
      icon: "🤖",
    },
    {
      key: "reason2",
      icon: "🔧",
    },
    {
      key: "reason3",
      icon: "💰",
    },
  ];

  return (
    <div className="mb-16">
      <h3
        className="text-3xl font-bold text-center mb-3"
        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
      >
        {t("about.economic.scalability.title")}
      </h3>
      <p
        className="text-center text-lg mb-12 max-w-3xl mx-auto"
        style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}
      >
        {t("about.economic.scalability.description")}
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {reasons.map((reason) => (
          <div
            key={reason.key}
            className="p-6 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: "var(--container-background)",
              border: "1px solid var(--border-default)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary-500)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
              backgroundColor: "var(--primary-100)",
            }}>
              <span className="text-3xl">{reason.icon}</span>
            </div>

            {/* Title */}
            <h4
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {t(`about.economic.scalability.${reason.key}.title`)}
            </h4>

            {/* Description */}
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}
            >
              {t(`about.economic.scalability.${reason.key}.description`)}
            </p>

            {/* Check Icon */}
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle
                className="w-4 h-4"
                style={{ color: "var(--primary-500)" }}
                strokeWidth={2}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--primary-600)" }}
              >
                Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
