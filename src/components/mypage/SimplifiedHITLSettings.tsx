"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Search, TrendingUp, Lock, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserStore, useHydration } from "@/store/userStore";
import { useAppModeStore } from "@/store/appModeStore";
import { useToastStore } from "@/store/toastStore";
import { updateAutomationLevel } from "@/lib/api/settings";
import type { HITLConfig, HITLPhases } from "@/types/hitl";
import { useThemeStore } from "@/store/themeStore";

interface SimplifiedHITLSettingsProps {
  className?: string;
}

/**
 * SimplifiedHITLSettings - HITL Control
 *
 * 3-stage system:
 * - Trading: Always enabled (fixed) - 시각적으로 고정됨을 표시
 * - Research: On/Off toggle (분석 단계 HITL)
 * - Portfolio Rebalancing: On/Off toggle (포트폴리오 단계 HITL)
 *
 * 실제 설정은 HITLConfig(phases)를 통해 저장/동기화된다.
 */
export default function SimplifiedHITLSettings({
  className = "",
}: SimplifiedHITLSettingsProps) {
  const { t } = useTranslation();
  const hasHydrated = useHydration();
  const {
    hitlConfig,
    setHITLConfig,
    setLastSyncedConfig,
    setLoading,
    isLoading: globalLoading,
  } = useUserStore();
  const { theme } = useThemeStore();
  const { mode } = useAppModeStore();
  const { showToast } = useToastStore();

  // Research & Portfolio HITL 상태와 연동된 마스터 토글
  const [isHITLEnabled, setIsHITLEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hydration + 서버 설정 기준으로 토글 초기 상태 동기화
  useEffect(() => {
    if (!hasHydrated || !hitlConfig) return;
    const phases = hitlConfig.phases;
    const enabled = Boolean(phases.analysis || phases.portfolio);
    setIsHITLEnabled(enabled);
  }, [hasHydrated, hitlConfig]);

  const applyToggleToConfig = (enable: boolean, current: HITLConfig): HITLConfig => {
    const phases: HITLPhases = {
      ...current.phases,
      analysis: enable,
      portfolio: enable,
    };
    return {
      ...current,
      preset: "custom",
      phases,
    };
  };

  const handleMasterToggle = async () => {
    if (!hasHydrated || !hitlConfig) return;
    if (isUpdating || globalLoading) {
      showToast(t("mypage.automation.updateInProgress") || "다른 설정이 업데이트 중입니다", "error");
      return;
    }

    const nextEnabled = !isHITLEnabled;
    const previousConfig = hitlConfig;
    const newConfig = applyToggleToConfig(nextEnabled, previousConfig);

    // 변경 없음이면 스킵
    if (JSON.stringify(newConfig.phases) === JSON.stringify(previousConfig.phases)) {
      setIsHITLEnabled(nextEnabled);
      return;
    }

    setIsUpdating(true);
    setLoading(true);

    // 낙관적 UI 업데이트
    setIsHITLEnabled(nextEnabled);
    try {
      setHITLConfig(newConfig);
    } catch (error) {
      console.error("Failed to set HITL config (LocalStorage full?):", error);
      showToast(t("mypage.automation.changeFailed") || "설정 저장에 실패했습니다", "error");
      setIsHITLEnabled(!nextEnabled);
      setIsUpdating(false);
      setLoading(false);
      return;
    }

    try {
      if (mode === "live") {
        await updateAutomationLevel(newConfig);
        setLastSyncedConfig(newConfig);
      } else {
        // Demo 모드에서는 로컬만 업데이트 (시뮬레이션)
        await new Promise((resolve) => setTimeout(resolve, 300));
        setLastSyncedConfig(newConfig);
      }
      showToast(t("mypage.automation.changeSuccess"), "success");
    } catch (error) {
      console.error("Failed to update intervention settings:", error);
      // 롤백
      try {
        setHITLConfig(previousConfig);
      } catch (rollbackError) {
        console.error("Failed to rollback HITL config:", rollbackError);
      }
      setIsHITLEnabled(Boolean(previousConfig.phases.analysis || previousConfig.phases.portfolio));
      showToast(t("mypage.automation.changeFailed") || "설정 저장에 실패했습니다", "error");
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
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
            <div
              className="flex items-start gap-2 mt-2 p-2 rounded-md"
              style={{
                backgroundColor:
                  theme === "dark" ? "var(--main-background)" : "var(--warning-50)",
              }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
              <strong>Note:</strong> {t("mypage.hitlControl.masterToggle.note")}
              </span>
            </div>
        </div>
        <button
          onClick={handleMasterToggle}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ml-4 disabled:opacity-50"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-500)" : "#d1d5db"
          }}
          disabled={isUpdating || globalLoading}
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
              // Light: 기존 주황 톤 유지, Dark: 조금 어두운 주황 톤으로만 조정
              backgroundColor: theme === "dark" ? "#7c2d12" : "#fff7ed", // orange-900-ish / orange-50
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
