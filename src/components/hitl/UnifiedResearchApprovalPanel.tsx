"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import type { ResearchApprovalRequest } from "@/lib/types/chat";

interface UnifiedResearchApprovalPanelProps {
  request: ResearchApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * UnifiedResearchApprovalPanel
 *
 * 개인 투자자 친화 UI로 재구성된 Research HITL 패널 (Demo 우선 적용)
 * - 폭: UnifiedTrading 패널과 동일한 최대폭 유지
 * - 쉬운 라벨/설명 위주, 내부 워커 명칭 노출 지양
 */
export default function UnifiedResearchApprovalPanel({
  request,
  onApprove,
  onReject,
  variant = "drawer",
  disabled = false,
}: UnifiedResearchApprovalPanelProps) {
  const { t } = useTranslation();

  // 선택 상태(데모용 로컬 상태) – 백엔드 권장값이 오면 기본값으로 매핑
  const [subgraph, setSubgraph] = React.useState<"qualitative" | "quantitative" | "both">("both");
  const [depth, setDepth] = React.useState<"brief" | "detailed" | "comprehensive">(request.depth_level || "detailed");
  const [scope, setScope] = React.useState<"narrow" | "balanced" | "broad">("balanced");
  const [perspectives, setPerspectives] = React.useState<string[]>(["macro", "fundamental", "technical"]);

  const depthLabel = (key: string) =>
    key === "brief"
      ? t("hitl.research.depth.brief")
      : key === "detailed"
      ? t("hitl.research.depth.detailed")
      : t("hitl.research.depth.comprehensive");
  const scopeLabel = (key: string) =>
    key === "narrow"
      ? t("hitl.researchUnified.scope.narrow")
      : key === "balanced"
      ? t("hitl.researchUnified.scope.balanced")
      : t("hitl.researchUnified.scope.broad");
  const methodLabel = (key: string) =>
    key === "qualitative"
      ? t("hitl.researchUnified.method.qualitative")
      : key === "quantitative"
      ? t("hitl.researchUnified.method.quantitative")
      : t("hitl.researchUnified.method.both");

  const chipStyle = (selected: boolean) => ({
    backgroundColor: selected ? "var(--primary-100)" : "var(--container-background)",
    color: selected ? "var(--primary-700)" : "var(--text-secondary)",
    borderColor: selected ? "var(--primary-300)" : "var(--border-default)",
    fontWeight: selected ? 600 : 500,
  } as React.CSSProperties);

  const togglePerspective = (key: string) => {
    setPerspectives((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  return (
    <div
      className={
        variant === "floating"
          ? "fixed bottom-4 right-4 flex flex-col z-hitl-panel shadow-2xl rounded-xl overflow-hidden overflow-x-hidden transition-transform duration-300"
          : "fixed top-0 right-0 h-screen flex flex-col z-hitl-panel shadow-2xl overflow-x-hidden transition-transform duration-300"
      }
      style={{
        width: "min(90vw, 500px)",
        maxHeight: variant === "floating" ? "80vh" : undefined,
        backgroundColor: "var(--container-background)",
        borderLeft: variant === "floating" ? undefined : "1px solid var(--border-default)",
        border: variant === "floating" ? "1px solid var(--border-default)" : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("hitl.researchUnified.title")}
          </h2>
        </div>
        <span
          className="px-3 py-1 text-xs font-semibold rounded-full"
          style={{ backgroundColor: "var(--lnb-background)", color: "var(--text-secondary)" }}
        >
          {t("hitl.pending")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Summary Card */}
        <div className="rounded-lg border p-4" style={{ borderColor: "#fed7aa", backgroundColor: "#fff7ed" }}>
          <div className="grid gap-y-2 items-start" style={{ display: "grid", gridTemplateColumns: "110px 1fr" }}>
            {request.stock_code && request.stock_name && (
              <>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("hitl.unified.stock")}</div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {request.stock_name} ({request.stock_code})
                </div>
              </>
            )}
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("hitl.research.query")}</div>
            <div className="text-sm whitespace-pre-wrap break-words" style={{ color: "var(--text-primary)" }}>
              {request.query}
            </div>
          </div>
        </div>

        {/* Plan Summary Line */}
        <div className="flex items-center justify-between py-2 border-b"
             style={{ borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            {t("hitl.researchUnified.plan.title")}
          </h3>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {`${depthLabel(depth)} • ${scopeLabel(scope)} • ${methodLabel(subgraph)}`}
          </div>
        </div>

        {/* Plan: Depth / Scope / Perspectives */}
        <div className="space-y-4">
          {/* Depth */}
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.researchUnified.plan.depth")}
            </div>
            <div className="flex gap-2">
              {([
                { key: "brief", label: t("hitl.research.depth.brief") },
                { key: "detailed", label: t("hitl.research.depth.detailed") },
                { key: "comprehensive", label: t("hitl.research.depth.comprehensive") },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDepth(opt.key as any)}
                  className="px-3 py-2 rounded-lg text-sm border"
                  style={chipStyle(depth === opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.researchUnified.plan.scope")}
            </div>
            <div className="flex gap-2">
              {([
                { key: "narrow", label: t("hitl.researchUnified.scope.narrow") },
                { key: "balanced", label: t("hitl.researchUnified.scope.balanced") },
                { key: "broad", label: t("hitl.researchUnified.scope.broad") },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setScope(opt.key as any)}
                  className="px-3 py-2 rounded-lg text-sm border"
                  style={chipStyle(scope === opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Perspectives */}
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.researchUnified.plan.perspectives")}
            </div>
            <div className="flex flex-wrap gap-2">
              {["macro", "fundamental", "technical", "flow", "strategy", "bull", "bear"].map((key) => (
                <button
                  key={key}
                  onClick={() => togglePerspective(key)}
                  className="px-3 py-2 rounded-lg text-sm border"
                  style={chipStyle(perspectives.includes(key))}
                >
                  {t(`hitl.researchUnified.perspective.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "var(--border-default)" }} />

        {/* Method: Qualitative / Quantitative / Both */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            {t("hitl.researchUnified.method.title")}
          </h3>
          <div className="flex gap-2">
            {([
              { key: "qualitative", label: t("hitl.researchUnified.method.qualitative") },
              { key: "quantitative", label: t("hitl.researchUnified.method.quantitative") },
              { key: "both", label: t("hitl.researchUnified.method.both") },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSubgraph(opt.key as any)}
                className="px-3 py-2 rounded-lg text-sm border"
                style={chipStyle(subgraph === opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border-default)" }}>
        <button
          onClick={disabled ? undefined : onReject}
          disabled={disabled}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: disabled ? "var(--border-default)" : "var(--container-background)",
            color: disabled ? "var(--text-secondary)" : "var(--text-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t("hitl.reject")}
        </button>
        <button
          onClick={disabled ? undefined : onApprove}
          disabled={disabled}
          className="flex-1 px-6 py-3 rounded-lg font-medium"
          style={{ backgroundColor: "var(--primary-500)", color: "var(--lnb-active-text)" }}
        >
          {t("hitl.approve")}
        </button>
      </div>
    </div>
  );
}
