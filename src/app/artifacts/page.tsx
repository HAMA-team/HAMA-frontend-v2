"use client";

import dynamic from "next/dynamic";

/**
 * Artifacts Page
 *
 * Displays saved artifacts in grid view
 * Design reference: Mockup - 아티팩트 목록 그리드 뷰.png
 *
 * Features:
 * - Grid layout (responsive: 1-3 columns)
 * - No ChatInput (per PRD - only on detail page)
 * - LocalStorage persistence (Phase 1-2)
 */

// Dynamic import로 ArtifactsView 불러와 i18n hydration 에러 방지
const ArtifactsView = dynamic(() => import("@/components/artifacts/ArtifactsView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
           style={{ borderColor: "var(--primary-500)", borderTopColor: "transparent" }} />
    </div>
  ),
});

export default function ArtifactsPage() {
  return <ArtifactsView />;
}
