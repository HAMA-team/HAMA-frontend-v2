"use client";

import React, { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

/**
 * ThemeProvider Component
 *
 * 테마 초기화를 위한 클라이언트 컴포넌트
 * - LocalStorage에서 테마 설정 불러오기
 * - html 태그에 theme class 적용
 *
 * @see ProductRequirements.md - US-6.2 (Dark Mode)
 */

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    console.log(`Theme initialized: ${theme}`);
  }, [theme]);

  return <>{children}</>;
}
