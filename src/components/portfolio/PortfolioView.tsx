"use client";

import React, { useState, useEffect } from "react";
import { Portfolio, ChartType } from "@/lib/types/portfolio";
import PortfolioSummary from "./PortfolioSummary";
import ChartTypeSelector from "./ChartTypeSelector";
import PortfolioTreemap from "./PortfolioTreemap";
import PortfolioPieChart from "./PortfolioPieChart";
import PortfolioBarChart from "./PortfolioBarChart";

interface PortfolioViewProps {
  portfolio: Portfolio;
}

/**
 * PortfolioView Component
 *
 * 포트폴리오 메인 뷰 - 모든 컴포넌트 통합
 * - PortfolioSummary: 4개 요약 카드
 * - ChartTypeSelector: 차트 타입 선택 버튼
 * - Chart Components: 선택된 차트 표시
 * - LocalStorage: 차트 타입 선택 상태 저장
 *
 * @see DesignSystem.md - Layout Dimensions
 * @see Userflow.md - 포트폴리오 조회 + 추가 질문 플로우
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function PortfolioView({ portfolio }: PortfolioViewProps) {
  const [chartType, setChartType] = useState<ChartType>("treemap");

  // LocalStorage에서 차트 타입 로드
  useEffect(() => {
    const savedType = localStorage.getItem("portfolioChartType") as ChartType | null;
    if (savedType && ["treemap", "pie", "bar"].includes(savedType)) {
      setChartType(savedType);
    }
  }, []);

  // 차트 타입 변경 시 LocalStorage에 저장
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    localStorage.setItem("portfolioChartType", type);
  };

  const renderChart = () => {
    switch (chartType) {
      case "treemap":
        return <PortfolioTreemap stocks={portfolio.stocks} />;
      case "pie":
        return <PortfolioPieChart stocks={portfolio.stocks} />;
      case "bar":
        return <PortfolioBarChart stocks={portfolio.stocks} />;
      default:
        return <PortfolioTreemap stocks={portfolio.stocks} />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-32" style={{ backgroundColor: "var(--main-background)" }}>
      <div className="max-w-[1200px] mx-auto px-8 py-8 w-full min-w-0">
        {/* 페이지 제목 */}
        <h1
          className="text-[28px] font-bold tracking-tight mb-6"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          포트폴리오
        </h1>

        {/* 요약 카드 */}
        <PortfolioSummary summary={portfolio.summary} />

        {/* 차트 타입 선택 */}
        <ChartTypeSelector selectedType={chartType} onTypeChange={handleChartTypeChange} />

        {/* 선택된 차트 표시 */}
        <div>{renderChart()}</div>
      </div>
    </div>
  );
}
