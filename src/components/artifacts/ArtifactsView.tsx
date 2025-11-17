"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useArtifactStore } from '@/store/artifactStore';
import ArtifactCard from '@/components/artifacts/ArtifactCard';

/**
 * ArtifactsView Component
 *
 * Displays saved artifacts in grid view
 * Design reference: Mockup - 아티팩트 목록 그리드 뷰.png
 *
 * Features:
 * - Grid layout (responsive: 1-3 columns)
 * - No ChatInput (per PRD - only on detail page)
 * - Backend API persistence (Phase 3)
 */
export default function ArtifactsView() {
  const { t } = useTranslation();
  const { artifacts, isLoading, error, loadArtifacts } = useArtifactStore();

  // Load artifacts on mount
  useEffect(() => {
    loadArtifacts();
  }, [loadArtifacts]);

  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      {/* Artifacts Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 py-8 w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight break-words" style={{ color: "var(--text-primary)" }}>
              {t("artifacts.listTitle")}
            </h1>
            <p className="mt-2 text-base break-words" style={{ color: "var(--text-secondary)" }}>
              {t("artifacts.listSubtitle")}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: "var(--error-background)", borderColor: "var(--error-border)" }}>
              <p className="text-sm" style={{ color: "var(--text-error)" }}>
                {error}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--primary-500)", borderTopColor: "transparent" }}
              />
            </div>
          ) : artifacts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                {t("artifacts.emptyState")}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("artifacts.emptySuggestion")}
              </p>
            </div>
          ) : (
            /* Artifacts Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((artifact) => (
                <ArtifactCard key={artifact.artifact_id} artifact={artifact} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Note: No PersistentChatInput on Artifacts list page per PRD */}
    </div>
  );
}
