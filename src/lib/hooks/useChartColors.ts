"use client";

import { useEffect, useState } from "react";

/**
 * useChartColors Hook
 *
 * CSS 변수로 정의된 차트 색상을 읽어서 실제 hex 값으로 변환
 * 다크 모드 전환 시 자동으로 업데이트됨
 *
 * @returns 차트 색상 배열과 수익/손실 색상
 */
export function useChartColors() {
  const [colors, setColors] = useState({
    chartColors: [] as string[],
    profitColor: "",
    lossColor: "",
  });

  useEffect(() => {
    const updateColors = () => {
      const rootStyles = getComputedStyle(document.documentElement);

      const chartColors = [
        rootStyles.getPropertyValue("--chart-blue").trim(),
        rootStyles.getPropertyValue("--chart-green").trim(),
        rootStyles.getPropertyValue("--chart-purple").trim(),
        rootStyles.getPropertyValue("--chart-orange").trim(),
        rootStyles.getPropertyValue("--chart-pink").trim(),
        rootStyles.getPropertyValue("--chart-indigo").trim(),
        rootStyles.getPropertyValue("--chart-cyan").trim(),
        rootStyles.getPropertyValue("--chart-yellow").trim(),
      ];

      const profitColor = rootStyles.getPropertyValue("--chart-profit").trim();
      const lossColor = rootStyles.getPropertyValue("--chart-loss").trim();

      setColors({ chartColors, profitColor, lossColor });
    };

    // 초기 색상 설정
    updateColors();

    // 다크 모드 전환 감지 (html 클래스 변경 감지)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /**
   * 수익률에 따른 색상 반환
   */
  const getReturnColor = (returnRate: number): string => {
    if (returnRate > 0) return colors.profitColor || "#10b981";
    if (returnRate < 0) return colors.lossColor || "#ef4444";
    return "#6b7280"; // neutral
  };

  return { ...colors, getReturnColor };
}
