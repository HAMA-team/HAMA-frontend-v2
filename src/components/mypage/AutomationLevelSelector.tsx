"use client";

import React, { useState } from "react";
import { useUserStore, AutomationLevel } from "@/store/userStore";
import { useTranslation } from "react-i18next";

/**
 * AutomationLevelSelector Component
 *
 * 자동화 레벨 선택 UI - 투자 워크플로우 기반
 * - 5단계 워크플로우: 데이터 수집 → 데이터 분석 → 포트폴리오 구성 → 리스크 분석 → 매매
 * - 레벨별 HITL 개입 지점 시각화 (빨간색 점)
 * - 3단계 레벨: Pilot (1) / Copilot (2) / Advisor (3)
 *
 * @see PRD - US-4.1 (자동화 레벨 설정)
 * @see BackendPRD - Section 3.2 (레벨별 개입 지점 매트릭스)
 * @see Mockup - My Page.png
 */

interface WorkflowStep {
  id: string;
  label: string;
}

interface LevelOption {
  value: AutomationLevel;
  name: string;
  shortName: string;
  description: string;
  features: string[];
  hitlSteps: string[]; // HITL 개입이 필요한 단계 ID
}

export default function AutomationLevelSelector() {
  const { t } = useTranslation();
  const { automationLevel, setAutomationLevel } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);

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
      value: 1,
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
      value: 2,
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
      value: 3,
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
  ];

  const handleLevelChange = async (newLevel: AutomationLevel) => {
    if (newLevel === automationLevel) return;

    setIsUpdating(true);

    try {
      // TODO: Phase 2+ - API 호출
      setAutomationLevel(newLevel);
    } catch (error) {
      console.error("Failed to update automation level:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 현재 선택된 레벨의 HITL 단계
  const currentHitlSteps =
    levelOptions.find((opt) => opt.value === automationLevel)?.hitlSteps || [];

  return (
    <div className="space-y-6">
      {/* 워크플로우 프로그레스 바 */}
      <div className="relative pt-8 pb-12">
        {/* 배경 라인 */}
        <div
          className="absolute top-4 left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: "var(--border-default)" }}
        />

        {/* 워크플로우 단계들 */}
        <div className="relative flex justify-between">
          {workflowSteps.map((step, index) => {
            const isHitl = currentHitlSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: "20%" }}
              >
                {/* 점 */}
                <div
                  className="w-4 h-4 rounded-full border-2 transition-all duration-300"
                  style={{
                    backgroundColor: isHitl
                      ? "#ef4444"
                      : "var(--primary-500)",
                    borderColor: isHitl ? "#ef4444" : "var(--primary-500)",
                  }}
                />

                {/* 레이블 */}
                <div
                  className="text-xs mt-2 text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.label}
                </div>

                {/* HITL 표시 */}
                {isHitl && (
                  <div
                    className="text-xs mt-1 font-semibold"
                    style={{ color: "#ef4444" }}
                  >
                    👤 {t("mypage.automation.workflow.approvalRequired")}
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
          <span style={{ color: "#ef4444" }}>●</span> {t("mypage.automation.workflow.approvalRequired")}
        </div>
      </div>

      {/* 레벨 카드 */}
      <div className="grid grid-cols-1 gap-4">
        {levelOptions.map((option) => {
          const isSelected = option.value === automationLevel;

          return (
            <button
              key={option.value}
              onClick={() => handleLevelChange(option.value)}
              disabled={isUpdating}
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
    </div>
  );
}
