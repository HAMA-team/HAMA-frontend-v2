"use client";

import React from "react";
import { useAppModeStore } from "@/store/appModeStore";
import { useTranslation } from "react-i18next";

export default function DevDemoToggle() {
  const { t } = useTranslation();
  const { mode, toggleMode } = useAppModeStore();

  const isDemo = mode === "demo";

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-2 px-2 h-8 rounded transition-colors duration-150"
      style={{
        backgroundColor: isDemo ? "var(--primary-500)" : "transparent",
        border: "1px solid var(--border-emphasis)",
      }}
      onMouseEnter={(e) => {
        if (!isDemo) e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)";
      }}
      onMouseLeave={(e) => {
        if (!isDemo) e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label={isDemo ? t("system.mode.demo") : t("system.mode.live")}
      title={isDemo ? t("system.mode.demo") : t("system.mode.live")}
    >
      <span
        className="text-xs font-semibold"
        style={{ color: isDemo ? "var(--lnb-active-text)" : "var(--text-secondary)" }}
      >
        {isDemo ? t("system.mode.demo") : t("system.mode.live")}
      </span>
    </button>
  );
}

