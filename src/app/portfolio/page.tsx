'use client';

import PersistentChatInput from '@/components/layout/PersistentChatInput';

export default function PortfolioPage() {
  const handleSendMessage = (message: string) => {
    console.log('Portfolio chat message:', message);
    // TODO: Implement portfolio context-aware chat
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* Portfolio Content Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-2 text-muted">
            Your investment portfolio overview
          </p>
          {/* TODO: Implement portfolio charts and details */}
        </div>
      </div>

      {/* Persistent Chat Input */}
      <PersistentChatInput
        onSend={handleSendMessage}
        placeholder="Ask about your portfolio..."
      />
    </div>
  );
}
