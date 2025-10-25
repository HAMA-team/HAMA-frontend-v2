"use client";

import React from "react";
import { useUserStore } from "@/store/userStore";
import { useTranslation } from "react-i18next";

/**
 * InvestmentProfile Component
 *
 * 초개인화된 투자 성향 프로필 표시
 * - 4단계 분류 (안정형, 안정추구형, 위험중립형, 공격투자형)
 * - LLM 생성 서술형 프로필 (매매 패턴, 선호 섹터, 리스크 성향, 포트폴리오 전략)
 * - 마지막 업데이트 시간
 *
 * @see PRD - US-5.1 (초개인화 투자 성향)
 * @see IA - Section MyPage
 *
 * Phase 3 구현 예정 - 현재는 구조만 준비
 */

export default function InvestmentProfile() {
  const { t } = useTranslation();
  const { investmentProfile, isLoadingProfile } = useUserStore();

  // TODO: Phase 3 - API 연동
  // useEffect(() => {
  //   fetchInvestmentProfile();
  // }, []);

  // Phase 2: 플레이스홀더 표시
  if (!investmentProfile) {
    return (
      <div
        className="p-6 rounded-xl border text-center"
        style={{
          backgroundColor: "var(--container-background)",
          borderColor: "var(--border-default)",
        }}
      >
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--primary-50)" }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            style={{ color: "var(--primary-500)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("mypage.profile.title")}
        </h3>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("mypage.profile.comingSoon")}
        </p>

        <div
          className="inline-block px-4 py-2 text-xs font-semibold rounded-full"
          style={{
            backgroundColor: "var(--primary-50)",
            color: "var(--primary-500)",
          }}
        >
          Phase 3
        </div>
      </div>
    );
  }

  // Phase 3: 실제 프로필 표시
  return (
    <div
      className="p-6 rounded-xl border space-y-4"
      style={{
        backgroundColor: "var(--container-background)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {t("mypage.profile.title")}
        </h3>

        {/* 업데이트 날짜 */}
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {t("mypage.profile.lastUpdated")}: {investmentProfile.last_updated}
        </span>
      </div>

      {/* 4단계 분류 */}
      <div>
        <span
          className="inline-block px-3 py-1 text-sm font-semibold rounded-full"
          style={{
            backgroundColor: "var(--primary-50)",
            color: "var(--primary-500)",
          }}
        >
          {investmentProfile.type}
        </span>
      </div>

      {/* LLM 생성 서술형 프로필 */}
      <div
        className="p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          backgroundColor: "var(--main-background)",
          color: "var(--text-primary)",
        }}
      >
        {investmentProfile.description}
      </div>

      {/* 로딩 상태 */}
      {isLoadingProfile && (
        <div className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          <div className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          {t("common.loading")}
        </div>
      )}
    </div>
  );
}
