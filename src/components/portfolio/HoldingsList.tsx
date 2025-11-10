"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Stock } from "@/lib/types/portfolio";

interface HoldingsListProps {
  stocks: Stock[];
  className?: string;
}

/**
 * HoldingsList Component
 *
 * 보유 종목 목록을 간결한 리스트 형태로 표시
 * - 종목명 + 평가금액 (첫 줄)
 * - 비중 + 수익률 (둘째 줄)
 * - 수익률에 따라 색상 변경 (빨강/초록)
 * - 다크모드 지원 (CSS 변수 사용)
 *
 * @see references/mockup_references/Portfolio.png - 디자인 참조
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function HoldingsList({ stocks, className = "" }: HoldingsListProps) {
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
    <div className={className}>
      {/* 제목 */}
      <h3
        className="text-[16px] font-semibold mb-4"
        style={{
          color: "var(--text-primary)",
        }}
      >
        {t("portfolio.holdings.title")}
      </h3>

      {/* 종목 목록 */}
      <div className="flex flex-col gap-4">
        {sortedStocks.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {t("portfolio.holdings.empty")}
          </div>
        ) : (
          sortedStocks.map((stock) => (
            <div key={stock.code} className="flex flex-col gap-1">
              {/* 종목명 + 평가금액 */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[15px] font-semibold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  {stock.name}
                </span>
                <span
                  className="text-[15px] font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  ₩{formatNumber(stock.value)}
                </span>
              </div>

              {/* 보유 수량 + 수익률 */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px]"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {formatNumber(stock.quantity)} {t("common.shares")}
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{
                    color: stock.returnRate >= 0 ? "var(--chart-profit)" : "var(--chart-loss)",
                  }}
                >
                  {formatPercent(stock.returnRate)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
