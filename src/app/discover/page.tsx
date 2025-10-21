'use client';

export default function DiscoverPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Discover Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <h1 className="text-3xl font-semibold tracking-tight">Discover</h1>
          <p className="mt-2 text-muted">
            Market news and insights
          </p>
          {/* TODO: Implement news feed (Phase 4) */}
        </div>
      </div>
    </div>
  );
}
