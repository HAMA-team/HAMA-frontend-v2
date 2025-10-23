"use client";

import React from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Stock } from "@/lib/types/portfolio";
import { useChartColors } from "@/lib/hooks/useChartColors";

interface PortfolioTreemapProps {
  stocks: Stock[];
}

/**
 * PortfolioTreemap Component
 *
 * 트리맵 차트 - 종목별 비중을 면적으로 표시
 * - 크기: 평가금액
 * - 색상: 순서대로 할당
 * - 툴팁: 종목명, 비중, 수익률
 *
 * @see DesignSystem.md - Chart Colors
 * @see ProductRequirements.md - US-3.1 포트폴리오 즉시 시각화
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function PortfolioTreemap({ stocks }: PortfolioTreemapProps) {
  const { chartColors } = useChartColors();

  const data = stocks.map((stock, index) => ({
    name: stock.name,
    size: stock.value,
    weight: stock.weight,
    returnRate: stock.returnRate,
    fill: chartColors[index % chartColors.length] || "#3b82f6", // fallback
  }));

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
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
            평가금액: {formatCurrency(data.size)}
          </p>
          <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>
            비중: {data.weight.toFixed(2)}%
          </p>
          <p
            className="text-xs font-semibold"
            style={{
              color: data.returnRate >= 0 ? "var(--chart-profit)" : "var(--chart-loss)",
            }}
          >
            수익률: {formatPercentage(data.returnRate)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, weight, returnRate, fill, root, depth, index } = props;

    // Recharts가 전달하는 실제 데이터 확인
    const actualWeight = weight !== undefined ? weight : (root?.name === name ? root?.weight : 0);
    const actualReturnRate = returnRate !== undefined ? returnRate : 0;

    // 박스 크기에 따라 폰트 크기 동적 조정
    const boxArea = width * height;
    const baseFontSize = Math.max(10, Math.min(18, Math.sqrt(boxArea) / 15));
    const nameFontSize = baseFontSize * 1.1;
    const weightFontSize = baseFontSize * 0.9;
    const returnFontSize = baseFontSize * 0.8;

    // 텍스트 표시 최소 크기
    const showText = width > 60 && height > 40;

    // 둥근 모서리 반경
    const borderRadius = Math.min(12, width / 10, height / 10);

    return (
      <g>
        {/* 배경 rect (둥근 모서리 바깥 영역을 흰색으로 채움) */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={borderRadius}
          ry={borderRadius}
          style={{
            fill: "var(--container-background)",
            stroke: "none",
          }}
        />
        {/* 메인 rect (색상) */}
        <rect
          x={x + 1.5}
          y={y + 1.5}
          width={width - 3}
          height={height - 3}
          rx={borderRadius}
          ry={borderRadius}
          style={{
            fill,
            stroke: "none",
          }}
        />
        {showText && name && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - weightFontSize}
              textAnchor="middle"
              fill="var(--lnb-active-text)"
              fontSize={nameFontSize}
              fontWeight="600"
            >
              {name}
            </text>
            {actualWeight > 0 && (
              <text
                x={x + width / 2}
                y={y + height / 2 + weightFontSize * 0.5}
                textAnchor="middle"
                fill="var(--lnb-active-text)"
                fontSize={weightFontSize}
              >
                {actualWeight.toFixed(1)}%
              </text>
            )}
            <text
              x={x + width / 2}
              y={y + height / 2 + weightFontSize * 0.5 + returnFontSize * 1.5}
              textAnchor="middle"
              fill="var(--lnb-active-text)"
              fontSize={returnFontSize}
              fontWeight="500"
            >
              {formatPercentage(actualReturnRate)}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div
      className="rounded-xl p-6 border treemap-container"
      style={{
        backgroundColor: "var(--container-background)",
        borderColor: "var(--border-default)",
      }}
    >
      <div style={{ width: "100%", height: 500, backgroundColor: "var(--container-background)" }}>
        <ResponsiveContainer width="100%" height={500}>
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            content={<CustomContent />}
            isAnimationActive={false}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
