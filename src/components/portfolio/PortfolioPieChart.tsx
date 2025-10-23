"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
export default function PortfolioPieChart({ stocks }: PortfolioPieChartProps) {
  const { chartColors } = useChartColors();

  // 종목별로 직접 표시 (섹터 그룹화 제거)
  const data = stocks.map((stock, index) => ({
    name: stock.name,
    value: stock.value,
    weight: stock.weight,
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
