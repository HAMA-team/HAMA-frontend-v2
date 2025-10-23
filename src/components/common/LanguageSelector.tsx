"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

/**
 * LanguageToggle Component
 *
 * 한국어/영어 토글 버튼
 * - Globe 아이콘 + KO/EN 텍스트로 표시
 * - 클릭 시 토글
 * - LocalStorage에 자동 저장
 *
 * @see ProductRequirements.md - US-7.1
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-2 h-8 rounded transition-colors duration-150"
      style={{ backgroundColor: "transparent" }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      aria-label={i18n.language === "ko" ? "Switch to English" : "한국어로 전환"}
      title={i18n.language === "ko" ? "English" : "한국어"}
    >
      <Globe className="w-4 h-4" style={{ color: "var(--text-secondary)" }} strokeWidth={1.5} />
      <span
        className="text-xs font-semibold"
        style={{ color: "var(--text-secondary)" }}
      >
        {i18n.language === "ko" ? "EN" : "KO"}
      </span>
    </button>
  );
}
