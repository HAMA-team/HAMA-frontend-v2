/**
 * About Content Component
 *
 * 나중에 수정하기 쉽도록 별도 컴포넌트로 분리
 * 각 섹션은 독립적으로 수정 가능
 */

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

/**
 * HAMA 소개 섹션 - Chat 스타일
 */
export function WhatIsHAMA() {
  const { t } = useTranslation();

  return (
    <section className="mb-12">
      {/* User Question Bubble */}
      <div className="flex justify-end mb-4">
        <div
          className="inline-block px-6 py-3 rounded-2xl max-w-[80%]"
          style={{
            backgroundColor: "var(--primary-500)",
          }}
        >
          <p
            className="text-base font-medium"
            style={{ color: "white" }}
          >
            {t("about.whatIsHAMA.title")}
          </p>
        </div>
      </div>

      {/* AI Response */}
      <div className="w-full">
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "var(--container-background)",
            border: "1px solid var(--border-default)",
          }}
        >
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{
              color: "var(--text-primary)",
              lineHeight: "1.8",
            }}
          >
            {t("about.whatIsHAMA.description1")}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * 팀 소개 섹션 (선택사항)
 */
export function TeamIntro() {
  const { t } = useTranslation();

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
        {t("about.team.title")}
      </h2>
      <div className="prose max-w-none" style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed">
          {t("about.team.content")}
        </p>
      </div>
    </section>
  );
}
