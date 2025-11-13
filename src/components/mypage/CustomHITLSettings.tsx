"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Info } from "lucide-react";
import type { HITLConfig, HITLPhases } from "@/types/hitl";
import { useUserStore } from "@/store/userStore";
import { useToastStore } from "@/store/toastStore";
import { useAppModeStore } from "@/store/appModeStore";
import { updateAutomationLevel } from "@/lib/api/settings";

/**
 * Custom HITL Settings Component
 *
 * Phase별로 개별적으로 HITL 개입 여부를 설정하는 고급 UI
 * - 5단계 워크플로우 각각에 대해 토글 제공
 * - Pilot 모드의 conditional trade 지원
 * - 부모 컴포넌트(AutomationLevelSelector)의 tempPhases와 동기화
 *
 * @see docs/AutomationLevelAPIChanges.md - Custom Mode
 */

interface CustomHITLSettingsProps {
  tempPhases: HITLPhases | null;
  setTempPhases: (phases: HITLPhases | null) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  hasUnsavedChanges: boolean;
  isUpdating: boolean;
}

export default function CustomHITLSettings({
  tempPhases,
  setTempPhases,
  onSave,
  onCancel,
  hasUnsavedChanges,
  isUpdating,
}: CustomHITLSettingsProps) {
  const { t } = useTranslation();
  const { hitlConfig, isLoading: globalLoading } = useUserStore();

  // 표시할 phases (임시 설정이 있으면 그걸 사용, 없으면 현재 설정)
  const displayPhases = tempPhases || hitlConfig.phases;

  const handlePhaseToggle = (phase: keyof HITLPhases) => {
    const currentPhases = { ...(tempPhases || hitlConfig.phases) };
    currentPhases[phase] = !currentPhases[phase];
    setTempPhases(currentPhases);
  };

  const handleTradeToggle = () => {
    const currentPhases = { ...(tempPhases || hitlConfig.phases) };
    const current = currentPhases.trade;
    // true → false → "conditional" → true
    let next: boolean | "conditional";
    if (current === true) {
      next = false;
    } else if (current === false) {
      next = "conditional";
    } else {
      next = true;
    }
    currentPhases.trade = next;
    setTempPhases(currentPhases);
  };

  const getTradeLabel = () => {
    if (displayPhases.trade === true) return t("mypage.customHitl.trade.always") || "항상 승인";
    if (displayPhases.trade === false) return t("mypage.customHitl.trade.never") || "자동 실행";
    return t("mypage.customHitl.trade.conditional") || "조건부";
  };

  const getTradeColor = () => {
    if (displayPhases.trade === true) return "#ef4444";
    if (displayPhases.trade === false) return "#10b981";
    return "#f59e0b";
  };

  const phases = [
    { key: "data_collection" as const, label: t("mypage.automation.workflow.dataCollection") },
    { key: "analysis" as const, label: t("mypage.automation.workflow.analysis") },
    { key: "portfolio" as const, label: t("mypage.automation.workflow.portfolio") },
    { key: "risk" as const, label: t("mypage.automation.workflow.risk") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
        <div>
          <h3
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("mypage.customHitl.title") || "Custom 모드 설정"}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("mypage.customHitl.subtitle") || "각 단계별로 HITL 개입 여부를 설정하세요"}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div
        className="flex gap-3 p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--lnb-background)",
          borderColor: "var(--primary-200)",
        }}
      >
        <Info
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          style={{ color: "var(--primary-500)" }}
        />
        <div className="text-sm"
        style={{ color: "var(--text-secondary)" }}>
          {t("mypage.customHitl.info") ||
            "Custom 모드는 고급 사용자를 위한 기능입니다. 각 단계에서 AI가 자동으로 진행할지, 사용자 승인을 받을지 세밀하게 제어할 수 있습니다."}
        </div>
      </div>

      {/* Phase Toggles */}
      <div className="space-y-3">
        {phases.map((phase) => (
          <div
            key={phase.key}
            className="flex items-center justify-between p-4 rounded-lg"
            style={{
              backgroundColor: "var(--container-background)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="flex-1">
              <div
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {phase.label}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {displayPhases[phase.key]
                  ? t("mypage.customHitl.approvalRequired") || "사용자 승인 필요"
                  : t("mypage.customHitl.autoExecute") || "자동 실행"}
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => handlePhaseToggle(phase.key)}
              disabled={isUpdating || globalLoading}
              className="relative w-12 h-6 rounded-full transition-colors disabled:opacity-50"
              style={{
                backgroundColor: displayPhases[phase.key]
                  ? "var(--primary-500)"
                  : "var(--border-default)",
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow"
                style={{
                  left: displayPhases[phase.key] ? "calc(100% - 22px)" : "2px",
                }}
              />
            </button>
          </div>
        ))}

        {/* Trade Phase (Special: 3-state) */}
        <div
          className="flex items-center justify-between p-4 rounded-lg"
          style={{
            backgroundColor: "var(--container-background)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="flex-1">
            <div
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.automation.workflow.trade")}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: getTradeColor() }}
            >
              {getTradeLabel()}
            </div>
            {displayPhases.trade === "conditional" && (
              <div
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                💡 {t("mypage.customHitl.trade.conditionalHint") || "저위험 매매는 자동, 고위험 매매는 승인"}
              </div>
            )}
          </div>

          {/* 3-State Button */}
          <button
            onClick={handleTradeToggle}
            disabled={isUpdating || globalLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: getTradeColor(),
              color: "white",
            }}
          >
            {getTradeLabel()}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      {hasUnsavedChanges && (
        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
          <button
            onClick={onCancel}
            disabled={isUpdating || globalLoading}
            className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--container-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onSave}
            disabled={isUpdating || globalLoading}
            className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary-500)",
              color: "white",
            }}
          >
            {isUpdating || globalLoading ? t("common.loading") : t("common.save")}
          </button>
        </div>
      )}
    </div>
  );
}
