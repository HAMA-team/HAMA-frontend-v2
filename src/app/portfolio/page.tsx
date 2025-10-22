"use client";

import React from "react";
import PortfolioView from "@/components/portfolio/PortfolioView";
import ChatInput from "@/components/layout/ChatInput";
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
  return (
    <>
      <PortfolioView portfolio={mockPortfolio} />
      <ChatInput />
    </>
  );
}
