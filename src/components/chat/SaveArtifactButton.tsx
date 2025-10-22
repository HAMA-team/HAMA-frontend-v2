"use client";

import React, { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";

/**
 * SaveArtifactButton Component
 *
 * AI 답변을 Artifact로 저장하는 버튼
 * - 버튼 클릭 시 LocalStorage에 저장 (Phase 1-2)
 * - Phase 3부터 Backend API 연동
 *
 * @see ProductRequirements.md - US-1.3
 */

interface SaveArtifactButtonProps {
  onClick: () => void;
}

export default function SaveArtifactButton({ onClick }: SaveArtifactButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = async () => {
    setIsSaving(true);
    try {
      await onClick();
    } catch (error) {
      console.error("Failed to save artifact:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSaving}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-150"
      style={{
        backgroundColor: "transparent",
        borderColor: "#e5e7eb",
        color: "#171717",
      }}
      onMouseEnter={(e) => {
        if (!isSaving) {
          e.currentTarget.style.backgroundColor = "#f9fafb";
          e.currentTarget.style.borderColor = "#d1d5db";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSaving) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }
      }}
      aria-label="Artifact로 저장"
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          <span>저장 중...</span>
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" strokeWidth={1.5} />
          <span>Save as Artifact</span>
        </>
      )}
    </button>
  );
}
