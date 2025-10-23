"use client";

export default function DiscoverPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      {/* Discover Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 py-8 w-full">
          <h1 className="text-3xl font-semibold tracking-tight break-words" style={{ color: "var(--text-primary)" }}>
            Discover
          </h1>
          <p className="mt-2 text-base break-words" style={{ color: "var(--text-secondary)" }}>
            Market news and insights
          </p>
          {/* TODO: Implement news feed (Phase 4) */}
        </div>
      </div>
    </div>
  );
}
