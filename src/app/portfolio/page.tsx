"use client";

import ChatInput from "@/components/layout/ChatInput";

export default function PortfolioPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Portfolio Content Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[1200px] mx-auto px-4 py-8 w-full">
          <h1 className="text-3xl font-semibold tracking-tight break-words" style={{ color: "#171717" }}>
            Portfolio
          </h1>
          <p className="mt-2 text-base break-words" style={{ color: "#6b7280" }}>
            Your investment portfolio overview
          </p>
          {/* TODO: Implement portfolio charts and details */}
        </div>
      </div>

      {/* Chat Input - Fixed Bottom */}
      <ChatInput />
    </div>
  );
}
