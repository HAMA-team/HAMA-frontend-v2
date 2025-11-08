"use client";

import React, { useState, useEffect } from "react";
import { useUserStore, useHydration } from "@/store/userStore";
import { useToastStore } from "@/store/toastStore";
import { useAppModeStore } from "@/store/appModeStore";
import { useTranslation } from "react-i18next";
import { updateAutomationLevel } from "@/lib/api/settings";
import type { HITLConfig, HITLPreset, HITLPhases, HITLTradeValue } from "@/types/hitl";
import { PRESET_PILOT, PRESET_COPILOT, PRESET_ADVISOR, matchPreset } from "@/types/hitl";
import CustomHITLSettings from "./CustomHITLSettings";

/**
 * AutomationLevelSelector Component
 *
 * 자동화 레벨 선택 UI - 투자 워크플로우 기반 (hitl_config 사용)
 * - 5단계 워크플로우: 데이터 수집 → 데이터 분석 → 포트폴리오 구성 → 리스크 분석 → 매매
 * - 레벨별 HITL 개입 지점 시각화 (빨간색 점)
 * - 3단계 프리셋: Pilot / Copilot / Advisor
 * - Settings API 연동 (PUT /api/v1/settings/automation-level)
 *
 * @see PRD - US-4.1 (자동화 레벨 설정)
 * @see docs/AutomationLevelAPIChanges.md - Frontend Migration
 * @see docs/qa/Settings_Approvals_API_Complete_Design.md - Section 2
 */

interface WorkflowStep {
  id: string;
  label: string;
}

interface LevelOption {
  preset: HITLPreset;
  config: HITLConfig;
  name: string;
  shortName: string;
  description: string;
  features: string[];
  hitlSteps: string[]; // HITL 개입이 필요한 단계 ID
}

export default function AutomationLevelSelector() {
  const { t } = useTranslation();
  const hasHydrated = useHydration();
  const { hitlConfig, customModePhases, setHITLConfig, setLoading, setLastSyncedConfig, rollbackHITLConfig, isLoading: globalLoading } = useUserStore();
  const { showToast } = useToastStore();
  const { mode } = useAppModeStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // 임시 phases (워크플로우 바에서 조작 중인 설정)
  const [tempPhases, setTempPhases] = useState<HITLPhases | null>(null);

  // Hydration이 완료될 때까지 로딩 표시
  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("common.loading")}...
          </p>
        </div>
      </div>
    );
  }

  // hitlConfig가 없을 경우 방어 처리 (이론적으로는 발생하지 않아야 함)
  if (!hitlConfig) {
    console.error("hitlConfig is undefined after hydration");
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--error-500)" }}>
            {t("mypage.automation.loadError") || "Failed to load automation settings"}
          </p>
        </div>
      </div>
    );
  }

  // 실제로 표시할 phases (임시 설정이 있으면 그걸 사용, 없으면 현재 설정)
  const displayPhases = tempPhases || hitlConfig.phases;

  // 임시 설정이 기존 설정과 다른지 (저장 버튼 표시 여부)
  const hasUnsavedChanges = tempPhases !== null && JSON.stringify(tempPhases) !== JSON.stringify(hitlConfig.phases);

  // 5단계 투자 워크플로우
  const workflowSteps: WorkflowStep[] = [
    { id: "data-collection", label: t("mypage.automation.workflow.dataCollection") },
    { id: "data-analysis", label: t("mypage.automation.workflow.analysis") },
    { id: "portfolio", label: t("mypage.automation.workflow.portfolio") },
    { id: "risk", label: t("mypage.automation.workflow.risk") },
    { id: "trade", label: t("mypage.automation.workflow.trade") },
  ];

  const levelOptions: LevelOption[] = [
    {
      preset: "pilot",
      config: PRESET_PILOT,
      name: t("mypage.automation.pilot.name"),
      shortName: "Pilot",
      description: t("mypage.automation.pilot.description"),
      features: [
        t("mypage.automation.pilot.feature1"),
        t("mypage.automation.pilot.feature2"),
        t("mypage.automation.pilot.feature3"),
      ],
      hitlSteps: ["trade"], // 매매만 HITL (저위험 시 자동)
    },
    {
      preset: "copilot",
      config: PRESET_COPILOT,
      name: t("mypage.automation.copilot.name"),
      shortName: "Copilot",
      description: t("mypage.automation.copilot.description"),
      features: [
        t("mypage.automation.copilot.feature1"),
        t("mypage.automation.copilot.feature2"),
        t("mypage.automation.copilot.feature3"),
      ],
      hitlSteps: ["portfolio", "trade"], // 포트폴리오, 매매
    },
    {
      preset: "advisor",
      config: PRESET_ADVISOR,
      name: t("mypage.automation.advisor.name"),
      shortName: "Advisor",
      description: t("mypage.automation.advisor.description"),
      features: [
        t("mypage.automation.advisor.feature1"),
        t("mypage.automation.advisor.feature2"),
        t("mypage.automation.advisor.feature3"),
      ],
      hitlSteps: ["data-analysis", "portfolio", "trade"], // 분석, 포트폴리오, 매매
    },
    {
      preset: "custom",
      config: {
        preset: "custom",
        // Custom 모드 선택 시:
        // 1. 임시 설정이 있으면 그걸 사용 (워크플로우 바에서 조작 중)
        // 2. 저장된 Custom 설정이 있으면 그걸 사용 (이전에 Custom 모드 사용했던 기록)
        // 3. 없으면 현재 프리셋의 phases 사용 (처음 Custom 모드 진입)
        phases: tempPhases || customModePhases || hitlConfig.phases
      },
      name: t("mypage.automation.custom.name") || "Custom",
      shortName: "Custom",
      description: t("mypage.automation.custom.description") || "각 단계별로 세밀하게 제어",
      features: [
        t("mypage.automation.custom.feature1") || "Phase별 개별 HITL 제어",
        t("mypage.automation.custom.feature2") || "조건부 매매 승인 지원",
        t("mypage.automation.custom.feature3") || "고급 사용자를 위한 모드",
      ],
      hitlSteps: [], // Custom mode는 동적으로 결정
    },
  ];

  // 워크플로우 점 클릭 핸들러
  const handleDotClick = (stepId: string) => {
    // 로딩 중이면 클릭 무시
    if (globalLoading || isUpdating) {
      showToast(t("mypage.automation.updateInProgress") || "업데이트 중입니다. 잠시 후 다시 시도하세요", "error");
      return;
    }

    try {
      // 현재 phases 복사 (임시 설정이 있으면 그걸 사용)
      const currentPhases = { ...(tempPhases || hitlConfig.phases) };

      // 매매 단계: 빨강(true) → 노랑(conditional) → 파랑(false) → 빨강
      if (stepId === "trade") {
        const current = currentPhases.trade;
        if (current === true) {
          currentPhases.trade = "conditional";
        } else if (current === "conditional") {
          currentPhases.trade = false;
        } else {
          currentPhases.trade = true;
        }
      }
      // 다른 단계: 빨강(true) ↔ 파랑(false)
      else {
        const phaseKey = stepId === "data-collection" ? "data_collection" : stepId === "data-analysis" ? "analysis" : stepId as keyof HITLPhases;
        if (phaseKey in currentPhases && phaseKey !== "trade") {
          currentPhases[phaseKey] = !currentPhases[phaseKey];
        } else {
          // 유효하지 않은 stepId
          console.error(`Invalid stepId: ${stepId}`);
          return;
        }
      }

      // 임시 설정 업데이트
      setTempPhases(currentPhases);

      // 프리셋과 일치하는지 확인
      const matched = matchPreset(currentPhases);

      if (matched) {
        // 프리셋과 일치하면 즉시 적용 (저장 버튼 없이)
        const presetConfig: HITLConfig = {
          preset: matched,
          phases: currentPhases,
        };
        handleLevelChange(presetConfig);
        setTempPhases(null); // 임시 설정 초기화
      }
      // 일치하지 않으면 Custom 모드 (저장 버튼 표시)
    } catch (error) {
      console.error("Failed to handle dot click:", error);
      showToast(t("mypage.automation.changeFailed") || "설정 변경에 실패했습니다", "error");
    }
  };

  // 임시 설정 저장
  const handleSaveTemp = async () => {
    if (!tempPhases) {
      console.warn("No temporary phases to save");
      return;
    }

    try {
      const customConfig: HITLConfig = {
        preset: "custom",
        phases: tempPhases,
      };

      await handleLevelChange(customConfig);
      setTempPhases(null); // 저장 후 임시 설정 초기화
    } catch (error) {
      console.error("Failed to save temporary config:", error);
      // handleLevelChange 내부에서 이미 롤백과 토스트 처리됨
    }
  };

  // 임시 설정 취소
  const handleCancelTemp = () => {
    try {
      setTempPhases(null);
    } catch (error) {
      console.error("Failed to cancel temporary config:", error);
      // 심각한 에러는 아니지만 로그는 남김
      setTempPhases(null); // 강제로 초기화
    }
  };

  const handleLevelChange = async (newConfig: HITLConfig) => {
    // 같은 프리셋이면 무시 (phases는 다를 수 있으므로 체크)
    if (newConfig.preset === hitlConfig.preset && JSON.stringify(newConfig.phases) === JSON.stringify(hitlConfig.phases)) {
      console.log("Same config, skipping update");
      return;
    }

    // 전역 로딩 중이면 동시 수정 방지
    if (globalLoading || isUpdating) {
      showToast(t("mypage.automation.updateInProgress") || "다른 설정이 업데이트 중입니다", "error");
      return;
    }

    setIsUpdating(true);
    setLoading(true);

    // 낙관적 업데이트: 즉시 UI 반영
    const previousConfig = hitlConfig;

    try {
      setHITLConfig(newConfig);
    } catch (error) {
      console.error("Failed to set HITL config (LocalStorage full?):", error);
      showToast(t("mypage.automation.changeFailed") || "설정 저장에 실패했습니다", "error");
      setIsUpdating(false);
      setLoading(false);
      return;
    }

    try {
      // Demo 모드가 아닐 때만 API 호출
      if (mode === "live") {
        await updateAutomationLevel(newConfig);
        // API 성공 시 lastSyncedConfig 업데이트 (롤백 기준점)
        setLastSyncedConfig(newConfig);
      } else {
        // Demo 모드에서는 로컬만 업데이트 (시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 300));
        setLastSyncedConfig(newConfig);
      }

      // 성공 토스트
      showToast(t("mypage.automation.changeSuccess"), "success");
    } catch (error: any) {
      console.error("Failed to update automation level:", error);

      // 롤백: 이전 설정으로 복구
      try {
        setHITLConfig(previousConfig);
      } catch (rollbackError) {
        console.error("Critical: Failed to rollback config:", rollbackError);
        // 최악의 경우: 새로고침 유도
        showToast("설정 복구에 실패했습니다. 페이지를 새로고침하세요", "error");
        return;
      }

      // 실패 토스트 (에러 메시지 포함)
      const errorMessage = error?.response?.data?.message || error?.message || t("mypage.automation.changeFailed");
      showToast(errorMessage, "error");
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  };

  // 현재 표시할 HITL 단계 (displayPhases 기반)
  const currentHitlSteps = (() => {
    const steps: string[] = [];
    if (displayPhases.data_collection) steps.push("data-collection");
    if (displayPhases.analysis) steps.push("data-analysis");
    if (displayPhases.portfolio) steps.push("portfolio");
    if (displayPhases.risk) steps.push("risk");
    // Trade는 색상 구분을 위해 별도 처리 (아래 렌더링에서)
    if (displayPhases.trade === true || displayPhases.trade === "conditional") {
      steps.push("trade");
    }
    return steps;
  })();

  // Trade 단계의 색상 결정
  const getTradeColor = () => {
    if (displayPhases.trade === true) return "#ef4444"; // 빨강
    if (displayPhases.trade === "conditional") return "#f59e0b"; // 노랑
    return "var(--primary-500)"; // 파랑
  };

  const getTradeLabel = () => {
    if (displayPhases.trade === true) return t("mypage.customHitl.trade.always");
    if (displayPhases.trade === "conditional") return t("mypage.customHitl.trade.conditional");
    return t("mypage.customHitl.trade.never");
  };

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {t("mypage.automation.title")}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("mypage.automation.subtitle")}
          </p>
        </div>

        {/* 취소/저장 버튼 (Custom 모드 + 변경사항 있을 때만 표시) */}
        {hasUnsavedChanges && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleCancelTemp}
              disabled={isUpdating || globalLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--container-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSaveTemp}
              disabled={isUpdating || globalLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
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

      {/* 워크플로우 프로그레스 바 */}
      <div className="relative pb-12" style={{ paddingTop: "32px" }}>

        {/* 배경 라인 */}
        <div
          className="absolute left-0 right-0 h-0.5 rounded-full"
          style={{
            backgroundColor: "var(--border-default)",
            top: "32px" // paddingTop과 동일
          }}
        />

        {/* 워크플로우 단계들 */}
        <div className="relative flex justify-between">
          {workflowSteps.map((step, index) => {
            const isHitl = currentHitlSteps.includes(step.id);
            // 매매 단계는 특별 처리 (3-state)
            const isTrade = step.id === "trade";
            const dotColor = isTrade ? getTradeColor() : (isHitl ? "#ef4444" : "var(--primary-500)");

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: "20%" }}
              >
                {/* 점 (클릭 가능) - 라인과 정확히 같은 높이 */}
                <div className="relative" style={{ height: "0px" }}>
                  <button
                    onClick={() => handleDotClick(step.id)}
                    disabled={isUpdating || globalLoading}
                    className="rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-110 active:scale-95 cursor-pointer"
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: dotColor,
                      border: `2px solid ${dotColor}`,
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    title={isTrade ? getTradeLabel() : (isHitl ? t("mypage.automation.workflow.approvalRequired") : t("mypage.automation.workflow.autoExecute"))}
                  />
                </div>

                {/* 레이블 */}
                <div
                  className="text-xs text-center"
                  style={{
                    color: "var(--text-secondary)",
                    marginTop: "20px"
                  }}
                >
                  {step.label}
                </div>

                {/* HITL 표시 */}
                {isHitl && (
                  <div
                    className="text-xs mt-1 font-semibold"
                    style={{ color: dotColor }}
                  >
                    {isTrade && displayPhases.trade === "conditional" ? (
                      <span>⚡ {getTradeLabel()}</span>
                    ) : (
                      <span>👤 {t("mypage.automation.workflow.approvalRequired")}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 설명 텍스트 */}
        <div
          className="text-center text-xs mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          <span style={{ color: "var(--primary-500)" }}>●</span> {t("mypage.automation.workflow.autoExecute")}{" "}
          <span style={{ color: "#ef4444" }}>●</span> {t("mypage.automation.workflow.approvalRequired")}{" "}
          <span style={{ color: "#f59e0b" }}>●</span> {t("mypage.automation.workflow.conditional") || "조건부"}
        </div>
      </div>

      {/* 레벨 카드 */}
      <div className="grid grid-cols-1 gap-4">
        {levelOptions.map((option) => {
          // 임시 설정이 있으면 (Custom 조합) → Custom 카드만 선택된 것처럼 표시
          // 임시 설정이 없으면 → 실제 hitlConfig.preset 기준으로 표시
          const isSelected = hasUnsavedChanges
            ? option.preset === "custom"
            : option.preset === hitlConfig.preset;

          return (
            <button
              key={option.preset}
              onClick={() => {
                // 임시 설정이 있으면 먼저 취소
                if (tempPhases) {
                  setTempPhases(null);
                }
                handleLevelChange(option.config);
              }}
              disabled={isUpdating || globalLoading}
              className="text-left p-5 rounded-xl border-2 transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: isSelected
                  ? "var(--primary-50)"
                  : "var(--container-background)",
                borderColor: isSelected
                  ? "var(--primary-500)"
                  : "var(--border-default)",
              }}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* 라디오 버튼 */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected
                        ? "var(--primary-500)"
                        : "var(--border-default)",
                    }}
                  >
                    {isSelected && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "var(--primary-500)" }}
                      />
                    )}
                  </div>

                  {/* 이름 */}
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.name}
                  </h3>
                </div>

                {/* 뱃지 */}
                {isSelected && (
                  <span
                    className="px-3 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: "var(--primary-500)",
                      color: "white",
                    }}
                  >
                    {t("mypage.automation.current")}
                  </span>
                )}
              </div>

              {/* 설명 */}
              <p
                className="text-sm mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {option.description}
              </p>

              {/* 특징 리스트 */}
              <ul className="space-y-2">
                {option.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      style={{ color: "var(--success-500)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Custom HITL Settings (고급 설정) */}
      {(hitlConfig.preset === "custom" || hasUnsavedChanges) && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border-default)" }}>
          <CustomHITLSettings
            tempPhases={tempPhases}
            setTempPhases={setTempPhases}
            onSave={handleSaveTemp}
            onCancel={handleCancelTemp}
            hasUnsavedChanges={hasUnsavedChanges}
            isUpdating={isUpdating}
          />
        </div>
      )}
    </div>
  );
}
