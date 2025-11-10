"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Portfolio, ChartType } from "@/lib/types/portfolio";
import PortfolioSummary from "./PortfolioSummary";
import ChartTypeSelector from "./ChartTypeSelector";
import PortfolioTreemap from "./PortfolioTreemap";
import PortfolioPieChart from "./PortfolioPieChart";
import PortfolioBarChart from "./PortfolioBarChart";
import HoldingsList from "./HoldingsList";
import HoldingsCarousel from "./HoldingsCarousel";

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
 * - HoldingsList: 보유 종목 목록 (반응형)
 * - LocalStorage: 차트 타입 선택 상태 저장
 *
 * **반응형 레이아웃:**
 * - 큰 화면(>=1024px): 차트(왼쪽) + 보유 종목(오른쪽, 세로 스크롤)
 * - 작은 화면(<1024px): 보유 종목(위, 가로 스크롤) + 차트(아래)
 *
 * @see DesignSystem.md - Layout Dimensions
 * @see Userflow.md - 포트폴리오 조회 + 추가 질문 플로우
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 * @see references/mockup_references/Portfolio.png - 디자인 참조
 */
export default function PortfolioView({ portfolio }: PortfolioViewProps) {
  const { t } = useTranslation();
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
        return <PortfolioTreemap stocks={portfolio.stocks || []} />;
      case "pie":
        return <PortfolioPieChart stocks={portfolio.stocks || []} />;
      case "bar":
        return <PortfolioBarChart stocks={portfolio.stocks || []} />;
      default:
        return <PortfolioTreemap stocks={portfolio.stocks || []} />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-32" style={{ backgroundColor: "var(--main-background)" }}>
      <div className="max-w-[1400px] mx-auto px-8 py-8 w-full min-w-0">
        {/* 페이지 제목 */}
        <h1
          className="text-[28px] font-bold tracking-tight mb-6"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {t("portfolio.title")}
        </h1>

        {/* 요약 카드 */}
        <PortfolioSummary summary={portfolio.summary} />

        {/* 차트 타입 선택 */}
        <ChartTypeSelector selectedType={chartType} onTypeChange={handleChartTypeChange} />

        {/* 차트 + 보유 종목 (큰 화면: 나란히 배치) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 차트 영역 */}
          <div className="flex-1 min-w-0">
            {renderChart()}
          </div>

          {/* 보유 종목 (큰 화면: 오른쪽, 차트와 같은 높이) */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <div
              className="rounded-xl border overflow-y-auto"
              style={{
                backgroundColor: "var(--container-background)",
                borderColor: "var(--border-default)",
                height: "100%",
              }}
            >
              <div className="p-6">
                <HoldingsList stocks={portfolio.stocks || []} />
              </div>
            </div>
          </div>
        </div>

        {/* 보유 종목 (작은 화면: 차트 아래 가로 스크롤 카드) */}
        <div className="lg:hidden mt-6">
          <HoldingsCarousel stocks={portfolio.stocks || []} />
        </div>
      </div>
    </div>
  );
}
