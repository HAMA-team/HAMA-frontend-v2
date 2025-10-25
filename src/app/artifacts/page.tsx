"use client";

import { useTranslation } from 'react-i18next';
import { useArtifactStore } from '@/store/artifactStore';
import ArtifactCard from '@/components/artifacts/ArtifactCard';

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
export default function ArtifactsPage() {
  const { t } = useTranslation();
  const { artifacts } = useArtifactStore();

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

          {/* Artifacts Grid */}
          {artifacts.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((artifact) => (
                <ArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Note: No PersistentChatInput on Artifacts list page per PRD */}
    </div>
  );
}
