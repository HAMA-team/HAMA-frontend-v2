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
  const [showQuestion, setShowQuestion] = React.useState(false);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const sectionRef = React.useRef<HTMLElement>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const playAnimation = React.useCallback(() => {
    setShowQuestion(false);
    setShowAnswer(false);
    setIsVisible(true);

    setTimeout(() => setShowQuestion(true), 300);
    setTimeout(() => setShowAnswer(true), 1500);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play animation when section enters viewport
            playAnimation();

            // Start 30-second loop
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            intervalRef.current = setInterval(() => {
              setIsVisible(false);
              setTimeout(() => playAnimation(), 500);
            }, 30000);
          } else {
            // Stop loop when section leaves viewport
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      observer.disconnect();
    };
  }, [playAnimation]);

  return (
    <section ref={sectionRef} className="mb-12">
      {/* User Question Bubble */}
      <div
        className="flex justify-end mb-4 transition-opacity duration-500"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <div
          className={`inline-block px-6 py-3 rounded-2xl max-w-[80%] transition-all duration-500 ${
            showQuestion
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-8 opacity-0 scale-95"
          }`}
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
      <div
        className="w-full transition-opacity duration-500"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <div
          className={`p-6 rounded-2xl transition-all duration-700 ${
            showAnswer
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-98"
          }`}
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
 * 팀 소개 섹션
 */
export function TeamIntro() {
  const { t } = useTranslation();

  const members = [
    {
      key: "jiwoo",
      name: t("about.team.members.jiwoo.name"),
      role: t("about.team.members.jiwoo.role"),
    },
    {
      key: "seongmin",
      name: t("about.team.members.seongmin.name"),
      role: t("about.team.members.seongmin.role"),
    },
  ];

  return (
    <section className="mt-16 mb-12">
      <h2
        className="text-2xl md:text-3xl font-bold mb-8 text-center"
        style={{
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {t("about.team.title")}
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-2xl mx-auto">
        {members.map((member) => (
          <div key={member.key} className="text-center">
            {/* Name */}
            <h3
              className="text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {member.name}
            </h3>

            {/* Role */}
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
