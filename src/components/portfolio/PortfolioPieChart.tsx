"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { Stock } from "@/lib/types/portfolio";
import { useChartColors } from "@/lib/hooks/useChartColors";

interface PortfolioPieChartProps {
  stocks: Stock[];
}

/**
 * PortfolioPieChart Component
 *
 * 원형 차트 - 섹터별 비중 표시
 * - 섹터별로 그룹화하여 비중 계산
 * - 색상: CHART_COLORS 사용
 * - 툴팁: 섹터명, 평가금액, 비중
 *
 * @see DesignSystem.md - Chart Colors
 * @see ProductRequirements.md - US-3.1 포트폴리오 즉시 시각화
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function PortfolioPieChart({ stocks = [] }: PortfolioPieChartProps) {
  const { t } = useTranslation();
  const { chartColors } = useChartColors();

  // 섹터별 그룹화: 같은 섹터의 종목들을 합산
  const sectorMap = new Map<string, { value: number; weight: number }>();
  const totalValue = stocks.reduce((sum, stock) => sum + stock.value, 0);

  stocks.forEach((stock) => {
    // 섹터가 없으면 "기타"로 분류
    const sectorName = stock.sector && stock.sector.trim() !== "" ? stock.sector : "기타";

    const existing = sectorMap.get(sectorName) || { value: 0, weight: 0 };
    existing.value += stock.value;
    existing.weight += stock.weight;
    sectorMap.set(sectorName, existing);
  });

  // Map을 배열로 변환하여 차트 데이터 생성
  const dataArray = Array.from(sectorMap.entries()).map(([name, { value, weight }]) => ({
    name,
    value,
    weight,
  }));

  // 정렬: 큰 것부터 (기타는 맨 마지막)
  dataArray.sort((a, b) => {
    if (a.name === "기타") return 1;
    if (b.name === "기타") return -1;
    return b.value - a.value; // 큰 것부터
  });

  // 색상 할당
  const data = dataArray.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length] || "#3b82f6", // fallback
  }));

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="rounded-lg p-3 shadow-lg border"
          style={{
            backgroundColor: "var(--container-background)",
            borderColor: "var(--border-default)",
          }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {data.name}
          </p>
          <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>
            평가금액: {formatCurrency(data.value)}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            비중: {data.weight.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return `${entry.name} (${entry.weight.toFixed(1)}%)`;
  };

  return (
    <div
      className="rounded-xl p-6 border"
      style={{
        backgroundColor: "var(--container-background)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* 차트 제목 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {t("portfolio.charts.pie.title")}
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("portfolio.charts.pie.description")}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderCustomLabel}
            outerRadius={150}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
