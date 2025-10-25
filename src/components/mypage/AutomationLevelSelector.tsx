"use client";

import React, { useState } from "react";
import { useUserStore, AutomationLevel } from "@/store/userStore";
import { useTranslation } from "react-i18next";

/**
 * AutomationLevelSelector Component
 *
 * 자동화 레벨 선택 UI
 * - 3단계 레벨: Advisor (1) / Copilot (2) / Pilot (3)
 * - 프로그레스 바 시각화
 * - 각 레벨 설명 표시
 * - 변경 시 확인 모달 (Phase 2+)
 *
 * @see PRD - US-4.1 (자동화 레벨 설정)
 * @see DesignSystem - Section 10 (MyPage Container)
 */

interface LevelOption {
  value: AutomationLevel;
  name: string;
  shortName: string;
  description: string;
  features: string[];
}

export default function AutomationLevelSelector() {
  const { t } = useTranslation();
  const { automationLevel, setAutomationLevel } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const levelOptions: LevelOption[] = [
    {
      value: 1,
      name: t("mypage.automation.advisor.name"),
      shortName: "Advisor",
      description: t("mypage.automation.advisor.description"),
      features: [
        t("mypage.automation.advisor.feature1"),
        t("mypage.automation.advisor.feature2"),
        t("mypage.automation.advisor.feature3"),
      ],
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
    },
    {
      value: 3,
      name: t("mypage.automation.pilot.name"),
      shortName: "Pilot",
      description: t("mypage.automation.pilot.description"),
      features: [
        t("mypage.automation.pilot.feature1"),
        t("mypage.automation.pilot.feature2"),
        t("mypage.automation.pilot.feature3"),
      ],
    },
  ];

  const handleLevelChange = async (newLevel: AutomationLevel) => {
    if (newLevel === automationLevel) return;

    setIsUpdating(true);

    try {
      // TODO: Phase 2+ - API 호출
      // await fetch('/api/v1/user/automation-level', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ automation_level: newLevel }),
      // });

      // Phase 1: LocalStorage만 사용
      setAutomationLevel(newLevel);

      // TODO: Phase 2+ - Toast 알림
      // toast.success(t('mypage.automation.changeSuccess'));
    } catch (error) {
      console.error("Failed to update automation level:", error);
      // TODO: Phase 2+ - 에러 처리
      // toast.error(t('mypage.automation.changeFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  // 프로그레스 바 위치 계산 (0% - 50% - 100%)
  const progressPosition = {
    1: "0%",
    2: "50%",
    3: "100%",
  }[automationLevel];

  return (
    <div className="space-y-6">
      {/* 프로그레스 바 */}
      <div className="relative pt-8">
        {/* 배경 라인 */}
        <div
          className="absolute top-4 left-0 right-0 h-1 rounded-full"
          style={{ backgroundColor: "var(--border-default)" }}
        />

        {/* 활성 라인 */}
        <div
          className="absolute top-4 left-0 h-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: "var(--primary-500)",
            width: progressPosition,
          }}
        />

        {/* 레벨 포인트들 */}
        <div className="relative flex justify-between">
          {levelOptions.map((option) => {
            const isActive = option.value === automationLevel;
            const isPassed = option.value <= automationLevel;

            return (
              <button
                key={option.value}
                onClick={() => handleLevelChange(option.value)}
                disabled={isUpdating}
                className="flex flex-col items-center gap-2 transition-opacity disabled:opacity-50"
              >
                {/* 포인트 */}
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: isPassed
                      ? "var(--primary-500)"
                      : "var(--container-background)",
                    borderColor: isPassed
                      ? "var(--primary-500)"
                      : "var(--border-default)",
                  }}
                >
                  {isPassed && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="white"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* 레이블 */}
                <div className="text-center">
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {option.shortName}
                  </div>
                  {isActive && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--primary-500)" }}
                    >
                      {t("mypage.automation.current")}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* HITL 아이콘 표시 */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>👤</span>
          <span>{t("mypage.automation.hitlIndicator")}</span>
        </div>
      </div>

      {/* 레벨 카드 */}
      <div className="grid grid-cols-1 gap-4 mt-12">
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
