"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

/**
 * SaveArtifactButton Component
 *
 * AI 답변을 Artifact로 저장하는 버튼
 * - 버튼 클릭 시 LocalStorage에 저장 (Phase 1-2)
 * - 저장 상태를 영구 보관 및 표시
 * - Phase 3부터 Backend API 연동
 *
 * @see ProductRequirements.md - US-1.3
 */

interface SaveArtifactButtonProps {
  messageId: string;
  onClick: () => void;
}

export default function SaveArtifactButton({ messageId, onClick }: SaveArtifactButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { showToast } = useToastStore();

  // 컴포넌트 마운트 시 저장 상태 확인
  useEffect(() => {
    const savedArtifacts = JSON.parse(localStorage.getItem("savedArtifacts") || "[]");
    setIsSaved(savedArtifacts.includes(messageId));
  }, [messageId]);

  const handleClick = async () => {
    if (isSaved) return; // 이미 저장된 경우 아무것도 하지 않음

    setIsSaving(true);
    try {
      await onClick();

      // LocalStorage에 저장
      const savedArtifacts = JSON.parse(localStorage.getItem("savedArtifacts") || "[]");
      if (!savedArtifacts.includes(messageId)) {
        savedArtifacts.push(messageId);
        localStorage.setItem("savedArtifacts", JSON.stringify(savedArtifacts));
      }

      setIsSaved(true);

      // 성공 토스트 표시
      showToast(
        "Artifact가 저장되었습니다",
        "success",
        "Artifacts 페이지에서 보기",
        "/artifacts"
      );
    } catch (error) {
      console.error("Failed to save artifact:", error);
      // 실패 토스트 표시
      showToast("Artifact 저장에 실패했습니다", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSaving || isSaved}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-150"
      style={{
        backgroundColor: isSaved ? "#f0fdf4" : "transparent",
        borderColor: isSaved ? "#10b981" : "#e5e7eb",
        color: isSaved ? "#10b981" : "#171717",
        cursor: isSaved ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isSaving && !isSaved) {
          e.currentTarget.style.backgroundColor = "#f9fafb";
          e.currentTarget.style.borderColor = "#d1d5db";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSaving && !isSaved) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }
      }}
      aria-label={isSaved ? "저장됨" : "Artifact로 저장"}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          <span>저장 중...</span>
        </>
      ) : isSaved ? (
        <>
          <BookmarkCheck className="w-4 h-4" strokeWidth={1.5} />
          <span>저장됨</span>
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
