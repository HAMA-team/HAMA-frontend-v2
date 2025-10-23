"use client";

export default function ArtifactsPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      {/* Artifacts Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 py-8 w-full">
          <h1 className="text-3xl font-semibold tracking-tight break-words" style={{ color: "var(--text-primary)" }}>
            Artifacts
          </h1>
          <p className="mt-2 text-base break-words" style={{ color: "var(--text-secondary)" }}>
            Saved reports and analysis results
          </p>
          {/* TODO: Implement artifacts grid view */}
        </div>
      </div>
      {/* Note: No PersistentChatInput on Artifacts list page per PRD */}
    </div>
  );
}
