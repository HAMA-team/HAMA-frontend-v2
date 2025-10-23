"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

/**
 * LanguageSelector Component
 *
 * 언어 선택 드롭다운
 * - 한국어/영어 전환
 * - LocalStorage에 저장
 *
 * @see ProductRequirements.md - US-7.1
 */

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" style={{ color: "#6b7280" }} strokeWidth={1.5} />
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="text-sm outline-none cursor-pointer"
        style={{
          backgroundColor: "transparent",
          color: "#374151",
          border: "none",
        }}
      >
        <option value="ko">{t("language.ko")}</option>
        <option value="en">{t("language.en")}</option>
      </select>
    </div>
  );
}
