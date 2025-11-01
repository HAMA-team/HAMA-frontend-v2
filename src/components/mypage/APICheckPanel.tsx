"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppModeStore } from "@/store/appModeStore";
import { fetchArtifactsList } from "@/lib/api/artifacts";
import { fetchApprovalsList } from "@/lib/api/approvals";
import { getAutomationLevel } from "@/lib/api/settings";
import { fetchPortfolioChartData } from "@/lib/api/portfolio";
import { CheckCircle2, XCircle, MinusCircle, RefreshCcw } from "lucide-react";
import { formatAbsoluteDate } from "@/lib/utils";

type Status = "idle" | "success" | "error" | "skipped";

interface CheckResult {
  key: string;
  name: string;
  path: string;
  status: Status;
  error?: string;
}

export default function APICheckPanel() {
  const { t, i18n } = useTranslation();
  const { mode } = useAppModeStore();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  const items = useMemo(
    () => [
      { key: "artifacts", name: t("mypage.apiStatus.items.artifacts"), path: "/api/v1/artifacts/", run: fetchArtifactsList },
      { key: "approvals", name: t("mypage.apiStatus.items.approvals"), path: "/api/v1/approvals/", run: fetchApprovalsList },
      { key: "automationLevel", name: t("mypage.apiStatus.items.automationLevel"), path: "/api/v1/settings/automation-level", run: getAutomationLevel },
      { key: "portfolioChart", name: t("mypage.apiStatus.items.portfolioChart"), path: "/api/v1/portfolio/chart-data", run: fetchPortfolioChartData },
    ],
    [t]
  );

  const runChecks = useCallback(async () => {
    if (mode !== "live") {
      const skipped: CheckResult[] = items.map((it) => ({
        key: it.key,
        name: it.name,
        path: it.path,
        status: "skipped",
      }));
      setResults(skipped);
      setLastCheckedAt(Date.now());
      return;
    }

    setRunning(true);
    try {
      const promises = items.map(async (it) => {
        try {
          await it.run();
          return { key: it.key, name: it.name, path: it.path, status: "success" as Status };
        } catch (err: any) {
          const message = err?.response?.status
            ? `${err.response.status} ${err.response.statusText || ""}`.trim()
            : err?.message || "Unknown error";
          return { key: it.key, name: it.name, path: it.path, status: "error" as Status, error: message };
        }
      });
      const settled = await Promise.all(promises);
      setResults(settled);
      setLastCheckedAt(Date.now());
    } finally {
      setRunning(false);
    }
  }, [items, mode]);

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: "var(--container-background)", borderColor: "var(--border-default)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("mypage.apiStatus.title")}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {mode === "live" ? t("mypage.apiStatus.subtitleLive") : t("mypage.apiStatus.subtitleDemo")}
          </p>
        </div>
        <button
          onClick={runChecks}
          disabled={running}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border"
          style={{
            backgroundColor: running ? "var(--border-default)" : "transparent",
            color: "var(--text-primary)",
            borderColor: "var(--border-default)",
            opacity: running ? 0.7 : 1,
          }}
          title={t("mypage.apiStatus.checkNow")}
        >
          <RefreshCcw size={16} />
          {t("mypage.apiStatus.checkNow")}
        </button>
      </div>

      <div className="space-y-2 min-w-0">
        {items.map((it) => {
          const result = results.find((r) => r.key === it.key);
          const status = result?.status || "idle";
          const Icon = status === "success" ? CheckCircle2 : status === "error" ? XCircle : status === "skipped" ? MinusCircle : undefined;
          const statusLabel =
            status === "success"
              ? t("mypage.apiStatus.status.success")
              : status === "error"
              ? t("mypage.apiStatus.status.error")
              : status === "skipped"
              ? t("mypage.apiStatus.status.skipped")
              : t("mypage.apiStatus.status.idle");

          return (
            <div
              key={it.key}
              className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg border"
              style={{ backgroundColor: "var(--surface-muted)", borderColor: "var(--border-default)" }}
            >
              <div className="min-w-0">
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {it.name}
                </div>
                <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {it.path}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {result?.error && status === "error" ? (
                  <span className="text-xs" style={{ color: "#ef4444" }} title={result.error}>
                    {result.error}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  {Icon ? <Icon size={16} style={{ color: status === "success" ? "#16a34a" : status === "error" ? "#ef4444" : "var(--text-secondary)" }} /> : null}
                  <span style={{ color: "var(--text-primary)" }}>{statusLabel}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
        {lastCheckedAt ? (
          <span title={formatAbsoluteDate(lastCheckedAt, i18n?.language || "en")}>
            {t("mypage.apiStatus.lastChecked")}
          </span>
        ) : (
          <span>{t("mypage.apiStatus.notCheckedYet")}</span>
        )}
      </div>
    </div>
  );
}

