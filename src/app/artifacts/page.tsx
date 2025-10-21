'use client';

export default function ArtifactsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Artifacts Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <h1 className="text-3xl font-semibold tracking-tight">Artifacts</h1>
          <p className="mt-2 text-muted">
            Saved reports and analysis results
          </p>
          {/* TODO: Implement artifacts grid view */}
        </div>
      </div>
      {/* Note: No PersistentChatInput on Artifacts list page per PRD */}
    </div>
  );
}
