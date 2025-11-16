/**
 * About Content Component
 *
 * 나중에 수정하기 쉽도록 별도 컴포넌트로 분리
 * 각 섹션은 독립적으로 수정 가능
 */

"use client";

import React from "react";

/**
 * HAMA 소개 섹션
 */
export function WhatIsHAMA() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
        HAMA란?
      </h2>
      <div className="prose max-w-none" style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed mb-4">
          HAMA는 Human-in-the-Loop AI 투자 시스템으로, AI의 분석 능력과 인간의 판단력을 결합한 차세대 투자 플랫폼입니다.
        </p>
        <p className="text-base leading-relaxed">
          사용자가 원하는 자동화 수준을 직접 설정하여, AI와 협업하며 투자 의사결정을 수행할 수 있습니다.
        </p>
      </div>
    </section>
  );
}

/**
 * 비즈니스 모델 섹션
 */
export function BusinessModel() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
        비즈니스 모델
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {/* 수익 구조 */}
        <div className="p-6 rounded-lg border" style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--border-primary)"
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            수익 구조
          </h3>
          <div className="space-y-2" style={{ color: "var(--text-secondary)" }}>
            <p className="text-sm">내용 추후 업데이트 예정</p>
          </div>
        </div>

        {/* 타겟 고객 */}
        <div className="p-6 rounded-lg border" style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--border-primary)"
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            타겟 고객
          </h3>
          <div className="space-y-2" style={{ color: "var(--text-secondary)" }}>
            <p className="text-sm">내용 추후 업데이트 예정</p>
          </div>
        </div>

        {/* 시장 분석 */}
        <div className="p-6 rounded-lg border md:col-span-2" style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--border-primary)"
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            시장 분석
          </h3>
          <div className="space-y-2" style={{ color: "var(--text-secondary)" }}>
            <p className="text-sm">내용 추후 업데이트 예정</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 팀 소개 섹션 (선택사항)
 */
export function TeamIntro() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
        팀 소개
      </h2>
      <div className="prose max-w-none" style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed">
          내용 추후 업데이트 예정
        </p>
      </div>
    </section>
  );
}
