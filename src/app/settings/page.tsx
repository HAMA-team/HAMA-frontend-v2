'use client';

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[800px] px-4 py-8">
          <h1 className="text-3xl font-semibold tracking-tight">My Page</h1>
          <p className="mt-2 text-muted">
            Account settings and preferences
          </p>
          {/* TODO: Implement user settings, automation level, investment profile */}
        </div>
      </div>
      {/* Note: No PersistentChatInput on My Page per PRD */}
    </div>
  );
}
