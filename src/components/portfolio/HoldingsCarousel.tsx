"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Stock } from "@/lib/types/portfolio";

interface HoldingsCarouselProps {
  stocks: Stock[];
}

/**
 * HoldingsCarousel Component
 *
 * 보유 종목을 가로 스크롤 카드 형태로 표시 (모바일/작은 화면용)
 * - 각 종목을 개별 카드로 표시
 * - 가로 스크롤
 * - 카드 스타일: 배경, 테두리, 패딩
 *
 * @see references/mockup_references/Portfolio.png - 디자인 참조
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function HoldingsCarousel({ stocks }: HoldingsCarouselProps) {
  const { t } = useTranslation();

  // 평가금액 기준 내림차순 정렬
  const sortedStocks = [...stocks].sort((a, b) => b.value - a.value);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("ko-KR").format(Math.round(num));
  };

  const formatPercent = (num: number): string => {
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  return (
    <div>
      {/* 제목 */}
      <h3
        className="text-[16px] font-semibold mb-4"
        style={{
          color: "var(--text-primary)",
        }}
      >
        {t("portfolio.holdings.title")}
      </h3>

      {/* 가로 스크롤 카드 */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        {sortedStocks.length === 0 ? (
          <div
            className="text-center py-8 text-sm w-full"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {t("portfolio.holdings.empty")}
          </div>
        ) : (
          sortedStocks.map((stock) => (
            <div
              key={stock.code}
              className="flex-shrink-0 w-[200px] rounded-xl p-4 border"
              style={{
                backgroundColor: "var(--container-background)",
                borderColor: "var(--border-default)",
              }}
            >
              {/* 종목명 */}
              <div
                className="text-[15px] font-semibold mb-3"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {stock.name}
              </div>

              {/* 평가금액 */}
              <div className="mb-2">
                <div
                  className="text-[11px] mb-0.5"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("portfolio.holdings.value")}
                </div>
                <div
                  className="text-[17px] font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  ₩{formatNumber(stock.value)}
                </div>
              </div>

              {/* 보유 수량 */}
              <div className="mb-2">
                <div
                  className="text-[11px] mb-0.5"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("portfolio.holdings.quantity")}
                </div>
                <div
                  className="text-[13px]"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  {formatNumber(stock.quantity)} {t("common.shares")}
                </div>
              </div>

              {/* 수익률 */}
              <div>
                <div
                  className="text-[11px] mb-0.5"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("portfolio.holdings.return")}
                </div>
                <div
                  className="text-[15px] font-semibold"
                  style={{
                    color: stock.returnRate >= 0 ? "var(--chart-profit)" : "var(--chart-loss)",
                  }}
                >
                  {formatPercent(stock.returnRate)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
