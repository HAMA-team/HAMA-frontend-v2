"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

/**
 * ThemeToggle Component
 *
 * 라이트/다크 모드 토글 버튼
 * - 아이콘 전환 (Sun/Moon)
 * - LocalStorage에 저장
 * - Zustand로 전역 상태 관리
 *
 * @see ProductRequirements.md - US-6.2 (Dark Mode)
 */

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#f3f4f6] dark:hover:bg-[#27272a] transition-colors duration-150"
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      title={theme === "light" ? "다크 모드" : "라이트 모드"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" style={{ color: "#6b7280" }} />
      ) : (
        <Sun className="w-5 h-5" style={{ color: "#a1a1aa" }} />
      )}
    </button>
  );
}
