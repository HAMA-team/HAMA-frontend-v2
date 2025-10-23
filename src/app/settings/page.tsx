"use client";

export default function SettingsPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-4 py-8 w-full">
          <h1 className="text-3xl font-semibold tracking-tight break-words" style={{ color: "var(--text-primary)" }}>
            My Page
          </h1>
          <p className="mt-2 text-base break-words" style={{ color: "var(--text-secondary)" }}>
            Account settings and preferences
          </p>
          {/* TODO: Implement user settings, automation level, investment profile */}
        </div>
      </div>
      {/* Note: No PersistentChatInput on My Page per PRD */}
    </div>
  );
}
