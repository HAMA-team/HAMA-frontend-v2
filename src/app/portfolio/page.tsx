"use client";

import React, { useEffect, useState } from "react";
import PortfolioView from "@/components/portfolio/PortfolioView";
import ChatInput from "@/components/layout/ChatInput";
import { fetchPortfolioOverview } from "@/lib/api/portfolio";
import { Portfolio } from "@/lib/types/portfolio";
import { useTranslation } from "react-i18next";
import { useAppModeStore } from "@/store/appModeStore";
import { mockPortfolio } from "@/lib/mock/portfolioData";

/**
 * Portfolio Page
 *
 * 포트폴리오 페이지
 * - PortfolioView: 요약 정보 + 차트
 * - ChatInput: 하단 고정 (포트폴리오 기반 질문 유도)
 *
 * @see ProductRequirements.md - US-3.1, US-3.2
 * @see Userflow.md - Flow 3: 포트폴리오 조회 + 추가 질문 플로우
 */
export default function PortfolioPage() {
  const { t } = useTranslation();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useAppModeStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (mode === "demo") {
          if (mounted) setPortfolio(mockPortfolio);
        } else {
          const data = await fetchPortfolioOverview();
          if (mounted) setPortfolio(data);
        }
      } catch (e: any) {
        console.error("Failed to load portfolio:", e);
        if (mounted) setError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mode]);

  return (
    <>
      {loading && (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--main-background)" }}>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("common.loading")}</span>
        </div>
      )}
      {!loading && portfolio && <PortfolioView portfolio={portfolio} />}
      {!loading && !portfolio && (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--main-background)" }}>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{error || "Failed to load"}</span>
        </div>
      )}
      <ChatInput />
    </>
  );
}
