"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { economicData, formatKRW, formatShort } from "@/config/economicData";
import { useThemeStore } from "@/store/themeStore";

/**
 * TAM/SAM/SOM 동심원 다이어그램
 *
 * 3개의 원으로 시장 규모를 시각화
 * - 다크모드 지원 (CSS 변수 사용)
 * - i18n 지원
 * - 호버 시 상세 정보 표시
 */

export default function TAMSAMSOMDiagram() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [hoveredCircle, setHoveredCircle] = React.useState<
    "tam" | "sam" | "som" | null
  >(null);

  const circleData = [
    {
      id: "tam",
      label: t("about.economic.tam.label"),
      fullName: t("about.economic.tam.fullName"),
      description: t("about.economic.tam.description"),
      value: formatKRW(economicData.tam.value, t),
      users: formatShort(economicData.tam.users, t),
      radius: 140,
      color: isDark ? "#1e3a8a" : "#bfdbfe",
      strokeColor: isDark ? "#1e40af" : "#93c5fd",
    },
    {
      id: "sam",
      label: t("about.economic.sam.label"),
      fullName: t("about.economic.sam.fullName"),
      description: t("about.economic.sam.description"),
      value: formatKRW(economicData.sam.value, t),
      users: formatShort(economicData.sam.users, t),
      radius: 100,
      color: isDark ? "#1e40af" : "#60a5fa",
      strokeColor: isDark ? "#2563eb" : "#3b82f6",
    },
    {
      id: "som",
      label: t("about.economic.som.label"),
      fullName: t("about.economic.som.fullName"),
      description: t("about.economic.som.description"),
      value: formatKRW(economicData.som.value, t),
      users: formatShort(economicData.som.users, t),
      radius: 60,
      color: isDark ? "#2563eb" : "#2563eb",
      strokeColor: isDark ? "#3b82f6" : "#1d4ed8",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <h3
        className="text-2xl font-semibold mb-6 text-center"
        style={{ color: "var(--text-primary)" }}
      >
        TAM / SAM / SOM
      </h3>

      {/* SVG 다이어그램 */}
      <div className="relative" style={{ width: "320px", height: "320px" }}>
        <svg width="320" height="320" viewBox="0 0 320 320">
          <defs>
            {/* Gradient for better visual */}
            <radialGradient id="tamGradient">
              <stop offset="0%" stopColor={isDark ? "#1e3a8a" : "#dbeafe"} />
              <stop offset="100%" stopColor={isDark ? "#1e3a8a" : "#bfdbfe"} />
            </radialGradient>
            <radialGradient id="samGradient">
              <stop offset="0%" stopColor={isDark ? "#1e40af" : "#93c5fd"} />
              <stop offset="100%" stopColor={isDark ? "#1e40af" : "#60a5fa"} />
            </radialGradient>
            <radialGradient id="somGradient">
              <stop offset="0%" stopColor={isDark ? "#2563eb" : "#3b82f6"} />
              <stop offset="100%" stopColor={isDark ? "#3b82f6" : "#2563eb"} />
            </radialGradient>
          </defs>

          {/* TAM Circle */}
          <circle
            cx="160"
            cy="160"
            r={circleData[0].radius}
            fill="url(#tamGradient)"
            stroke={circleData[0].strokeColor}
            strokeWidth="2"
            opacity={hoveredCircle === "tam" ? 1 : 0.9}
            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={() => setHoveredCircle("tam")}
            onMouseLeave={() => setHoveredCircle(null)}
          />

          {/* SAM Circle */}
          <circle
            cx="160"
            cy="160"
            r={circleData[1].radius}
            fill="url(#samGradient)"
            stroke={circleData[1].strokeColor}
            strokeWidth="2"
            opacity={hoveredCircle === "sam" ? 1 : 0.9}
            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={() => setHoveredCircle("sam")}
            onMouseLeave={() => setHoveredCircle(null)}
          />

          {/* SOM Circle */}
          <circle
            cx="160"
            cy="160"
            r={circleData[2].radius}
            fill="url(#somGradient)"
            stroke={circleData[2].strokeColor}
            strokeWidth="2"
            opacity={hoveredCircle === "som" ? 1 : 0.9}
            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={() => setHoveredCircle("som")}
            onMouseLeave={() => setHoveredCircle(null)}
          />

          {/* Labels - 테마별 색상 */}
          <text
            x="160"
            y="40"
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill={isDark ? "#93c5fd" : "#1e40af"}
          >
            {circleData[0].label}
          </text>
          <text
            x="160"
            y="80"
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill={isDark ? "#60a5fa" : "#1e3a8a"}
          >
            {circleData[1].label}
          </text>
          <text
            x="160"
            y="160"
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="white"
          >
            {circleData[2].label}
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredCircle && (
          <div
            className="absolute top-0 left-0 right-0 mx-auto p-4 rounded-lg shadow-lg"
            style={{
              backgroundColor: "var(--container-background)",
              border: "1px solid var(--border-default)",
              maxWidth: "280px",
              marginTop: "340px",
            }}
          >
            <h4
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {circleData.find((c) => c.id === hoveredCircle)?.fullName}
            </h4>
            <p
              className="text-sm mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {circleData.find((c) => c.id === hoveredCircle)?.description}
            </p>
            <div className="flex justify-between text-sm">
              <div>
                <span style={{ color: "var(--text-muted)" }}>{t("about.economic.labels.marketSize")}: </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {circleData.find((c) => c.id === hoveredCircle)?.value}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>{t("about.economic.labels.users")}: </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {circleData.find((c) => c.id === hoveredCircle)?.users}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 space-y-2">
        {circleData.map((circle) => (
          <div key={circle.id} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: circle.color }}
            />
            <div className="flex-1">
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {circle.label}
              </span>
              <span
                className="text-sm ml-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {circle.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
