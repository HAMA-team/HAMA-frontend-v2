"use client";

import React from "react";
import { useUserStore } from "@/store/userStore";
import { useThemeStore } from "@/store/themeStore";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import AutomationLevelSelector from "./AutomationLevelSelector";
import InvestmentProfile from "./InvestmentProfile";
import { Sun, Moon, Globe } from "lucide-react";

/**
 * MyPageView Component
 *
 * 마이페이지 메인 뷰
 * Sections:
 * 1. 사용자 정보
 * 2. 자동화 레벨 설정 (Phase 2) ⭐
 * 3. 투자 성향 프로필 (Phase 3 구조만)
 * 4. 테마 & 언어 설정
 * 5. 온보딩 체험하기 버튼 (선택적)
 *
 * @see PRD - US-4, US-5
 * @see IA - MyPage Section
 * @see DesignSystem - Section 10
 */

export default function MyPageView() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { userInfo } = useUserStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  // TODO: Phase 3 - 실제 사용자 정보 로드
  const displayUser = userInfo || {
    id: "demo-user",
    name: t("mypage.user.demoName"),
    email: "demo@hama.ai",
    avatar_url: undefined,
  };

  const handleLanguageChange = (lang: "ko" | "en") => {
    i18n.changeLanguage(lang);
    // LocalStorage에 자동 저장됨 (i18n 설정)
  };

  const handleOnboardingClick = () => {
    router.push("/onboarding");
  };

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("mypage.title")}
        </h1>
        <p
          className="text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("mypage.subtitle")}
        </p>
      </div>

      {/* 섹션 1: 사용자 정보 */}
      <section>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {t("mypage.user.title")}
        </h2>

        <div
          className="p-6 rounded-xl border flex items-center gap-4"
          style={{
            backgroundColor: "var(--container-background)",
            borderColor: "var(--border-default)",
          }}
        >
          {/* 아바타 */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              backgroundColor: "var(--primary-500)",
              color: "white",
            }}
          >
            {displayUser.avatar_url ? (
              <img
                src={displayUser.avatar_url}
                alt={displayUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              displayUser.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1">
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {displayUser.name}
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {displayUser.email}
            </p>
          </div>
        </div>
      </section>

      {/* 섹션 2: 자동화 레벨 설정 ⭐ Phase 2 */}
      <section>
        <div className="mb-4">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {t("mypage.automation.title")}
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("mypage.automation.subtitle")}
          </p>
        </div>

        <AutomationLevelSelector />
      </section>

      {/* 섹션 3: 투자 성향 프로필 (Phase 3 구조만) */}
      <section>
        <div className="mb-4">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {t("mypage.profile.title")}
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("mypage.profile.subtitle")}
          </p>
        </div>

        <InvestmentProfile />
      </section>

      {/* 섹션 4: 테마 & 언어 설정 */}
      <section>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {t("mypage.preferences.title")}
        </h2>

        <div className="space-y-4">
          {/* 테마 설정 */}
          <div
            className="p-5 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: "var(--container-background)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: "var(--text-primary)" }}
                />
              ) : (
                <Sun
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: "var(--text-primary)" }}
                />
              )}
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("mypage.preferences.theme.title")}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {isDarkMode
                    ? t("mypage.preferences.theme.dark")
                    : t("mypage.preferences.theme.light")}
                </p>
              </div>
            </div>

            {/* 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--primary-500)"
                  : "var(--border-default)",
              }}
            >
              <span
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200"
                style={{
                  transform: isDarkMode ? "translateX(24px)" : "translateX(0)",
                }}
              />
            </button>
          </div>

          {/* 언어 설정 */}
          <div
            className="p-5 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: "var(--container-background)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="flex items-center gap-3">
              <Globe
                size={20}
                strokeWidth={1.5}
                style={{ color: "var(--text-primary)" }}
              />
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("mypage.preferences.language.title")}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {i18n.language === "ko"
                    ? t("mypage.preferences.language.korean")
                    : t("mypage.preferences.language.english")}
                </p>
              </div>
            </div>

            {/* 언어 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange("ko")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
                style={{
                  backgroundColor:
                    i18n.language === "ko"
                      ? "var(--primary-500)"
                      : "transparent",
                  color:
                    i18n.language === "ko"
                      ? "white"
                      : "var(--text-secondary)",
                  border:
                    i18n.language === "ko"
                      ? "none"
                      : "1px solid var(--border-default)",
                }}
              >
                한국어
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
                style={{
                  backgroundColor:
                    i18n.language === "en"
                      ? "var(--primary-500)"
                      : "transparent",
                  color:
                    i18n.language === "en"
                      ? "white"
                      : "var(--text-secondary)",
                  border:
                    i18n.language === "en"
                      ? "none"
                      : "1px solid var(--border-default)",
                }}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 섹션 5: 온보딩 체험하기 (선택적) */}
      <section>
        <div
          className="p-6 rounded-xl border text-center"
          style={{
            backgroundColor: "var(--container-background)",
            borderColor: "var(--border-default)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {t("mypage.onboarding.title")}
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("mypage.onboarding.description")}
          </p>

          <button
            onClick={handleOnboardingClick}
            className="px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: "var(--primary-500)",
              color: "white",
            }}
          >
            {t("mypage.onboarding.button")}
          </button>
        </div>
      </section>
    </div>
  );
}
