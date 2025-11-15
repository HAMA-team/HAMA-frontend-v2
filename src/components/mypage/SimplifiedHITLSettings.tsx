"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, TrendingUp, Lock, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SimplifiedHITLSettingsProps {
  className?: string;
}

/**
 * SimplifiedHITLSettings - HITL Control
 *
 * 3-stage system:
 * - Trading: Always enabled (fixed) - 시각적으로 고정됨을 표시
 * - Research: On/Off toggle (토글과 연동)
 * - Portfolio Rebalancing: On/Off toggle (토글과 연동, Research와 함께 제어)
 */
export default function SimplifiedHITLSettings({
  className = "",
}: SimplifiedHITLSettingsProps) {
  const { t } = useTranslation();
  // Research and Portfolio are linked via master switch
  const [isHITLEnabled, setIsHITLEnabled] = useState(false);

  const handleMasterToggle = () => {
    setIsHITLEnabled(!isHITLEnabled);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          {t("mypage.hitlControl.title")}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {t("mypage.hitlControl.subtitle")}
        </p>
      </div>

      {/* Master Toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border-2"
        style={{
          backgroundColor: "var(--container-background)",
          borderColor: "var(--border-default)"
        }}
      >
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            {t("mypage.hitlControl.masterToggle.title")}
          </h4>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {t("mypage.hitlControl.masterToggle.description")}
          </p>
          {/* Inline Note - 토글 바로 아래에 추가 */}
          <div className="flex items-start gap-2 mt-2 p-2 rounded-md" style={{ backgroundColor: "var(--warning-50)" }}>
            <span className="text-xs text-[var(--warning-700)] dark:text-[var(--warning-300)]">
              <strong>Note:</strong> {t("mypage.hitlControl.masterToggle.note")}
            </span>
          </div>
        </div>
        <button
          onClick={handleMasterToggle}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ml-4"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-500)" : "#d1d5db"
          }}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              isHITLEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trading Card - Always Required (주황색 테마) */}
        <div
          className="p-5 rounded-xl border-2 transition-all relative flex flex-col"
          style={{
            backgroundColor: "#fff7ed", // orange-50
            borderColor: "#ea580c", // orange-600
          }}
        >
          {/* "Always Required" Badge - 상단 가운데 */}
          <div className="flex justify-center mb-3">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: "#fed7aa", // orange-200
                color: "#9a3412", // orange-800
                border: "1px solid #fb923c", // orange-400
              }}
            >
              <Lock size={10} strokeWidth={2.5} />
              <span className="font-medium">{t("mypage.hitlControl.badges.alwaysRequired")}</span>
            </div>
          </div>

          {/* 제목 */}
          <div className="flex items-start gap-2 mb-3">
            <ShieldCheck className="w-5 h-5" style={{ color: "#ea580c" }} strokeWidth={1.5} />
            <h4 className="font-semibold text-[var(--text-primary)]">{t("mypage.hitlControl.trading.title")}</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {t("mypage.hitlControl.trading.description")}
          </p>
          <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <span style={{ color: "#ea580c" }}>•</span>
              <span>{t("mypage.hitlControl.trading.features.reviewRisk")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "#ea580c" }}>•</span>
              <span>{t("mypage.hitlControl.trading.features.confirmChanges")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "#ea580c" }}>•</span>
              <span>{t("mypage.hitlControl.trading.features.approveOrder")}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-center">
            <span
              className="px-3 py-1 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: "#ea580c",
                color: "white",
              }}
            >
              {t("mypage.hitlControl.status.manualApproval")}
            </span>
          </div>
        </div>

        {/* Research Card - Linked to Toggle */}
        <div
          className="p-5 rounded-xl border-2 transition-all relative flex flex-col"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-50)" : "var(--container-background)",
            borderColor: isHITLEnabled ? "var(--primary-500)" : "var(--border-default)",
          }}
        >
          {/* "Linked to Toggle" Badge - 상단 가운데 (작고 심플) */}
          <div className="flex justify-center mb-3">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: isHITLEnabled ? "var(--primary-50)" : "var(--gray-100)",
                color: isHITLEnabled ? "var(--primary-600)" : "var(--text-tertiary)",
                border: `1px solid ${isHITLEnabled ? "var(--primary-200)" : "var(--border-default)"}`,
              }}
            >
              <Link2 size={10} strokeWidth={2.5} />
              <span className="font-medium">{t("mypage.hitlControl.badges.linkedToToggle")}</span>
            </div>
          </div>

          {/* 제목 */}
          <div className="flex items-start gap-2 mb-3">
            <Search className="w-5 h-5 text-[var(--primary-500)]" strokeWidth={1.5} />
            <h4 className="font-semibold text-[var(--text-primary)]">{t("mypage.hitlControl.research.title")}</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {t("mypage.hitlControl.research.description")}
          </p>
          <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>{t("mypage.hitlControl.research.features.setDepth")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>{t("mypage.hitlControl.research.features.defineScope")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>{t("mypage.hitlControl.research.features.selectSources")}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-center">
            {isHITLEnabled ? (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                }}
              >
                {t("mypage.hitlControl.status.manualApproval")}
              </span>
            ) : (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--border-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                {t("mypage.hitlControl.status.autoExecution")}
              </span>
            )}
          </div>
        </div>

        {/* Portfolio Rebalancing Card - Linked to Toggle */}
        <div
          className="p-5 rounded-xl border-2 transition-all relative flex flex-col"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-50)" : "var(--container-background)",
            borderColor: isHITLEnabled ? "var(--primary-500)" : "var(--border-default)",
          }}
        >
          {/* "Linked to Toggle" Badge - 상단 가운데 (작고 심플) */}
          <div className="flex justify-center mb-3">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: isHITLEnabled ? "var(--primary-50)" : "var(--gray-100)",
                color: isHITLEnabled ? "var(--primary-600)" : "var(--text-tertiary)",
                border: `1px solid ${isHITLEnabled ? "var(--primary-200)" : "var(--border-default)"}`,
              }}
            >
              <Link2 size={10} strokeWidth={2.5} />
              <span className="font-medium">{t("mypage.hitlControl.badges.linkedToToggle")}</span>
            </div>
          </div>

          {/* 제목 */}
          <div className="flex items-start gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-[var(--primary-500)]" strokeWidth={1.5} />
            <h4 className="font-semibold text-[var(--text-primary)]">{t("mypage.hitlControl.portfolio.title")}</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {t("mypage.hitlControl.portfolio.description")}
          </p>
          <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>{t("mypage.hitlControl.portfolio.features.adjustIntensity")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>{t("mypage.hitlControl.portfolio.features.determineDirection")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>{t("mypage.hitlControl.portfolio.features.reflectSectors")}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-center">
            {isHITLEnabled ? (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                }}
              >
                {t("mypage.hitlControl.status.manualApproval")}
              </span>
            ) : (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--border-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                {t("mypage.hitlControl.status.autoExecution")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
