"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { economicData } from "@/config/economicData";

/**
 * MAU (Monthly Active Users) 표시 컴포넌트
 *
 * 큰 숫자로 예상 MAU 강조
 * - 다크모드 지원
 * - i18n 지원
 */

export default function MAUDisplay() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl" style={{
      backgroundColor: "var(--container-background)",
      border: "1px solid var(--border-default)",
    }}>
      <h3
        className="text-xl font-semibold mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        {t("about.economic.mau.title")}
      </h3>

      {/* Big Number */}
      <div
        className="text-6xl font-bold mb-2"
        style={{
          color: "var(--primary-600)",
          letterSpacing: "-0.02em",
        }}
      >
        {economicData.mau.value.toLocaleString()}
      </div>

      <div
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        {t("about.economic.mau.value")}
      </div>

      {/* Description */}
      <p
        className="text-sm text-center max-w-xs"
        style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}
      >
        {t("about.economic.mau.description")}
      </p>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t w-full" style={{ borderColor: "var(--border-default)" }}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("about.economic.mau.annualUsers")}
            </div>
            <div className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>
              {economicData.mau.annualUsers.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("about.economic.mau.activationRate")}
            </div>
            <div className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>
              {(economicData.mau.activationRate * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
