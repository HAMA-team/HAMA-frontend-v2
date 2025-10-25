"use client";

import dynamic from "next/dynamic";

/**
 * Settings Page (My Page)
 *
 * /settings 경로
 *
 * Sections:
 * - 사용자 정보
 * - 자동화 레벨 설정 (Phase 2) ⭐
 * - 투자 성향 프로필 (Phase 3 구조만)
 * - 테마 & 언어 설정
 * - 온보딩 체험하기
 *
 * Note: PersistentChatInput은 My Page에 표시되지 않음 (PRD 명시)
 *
 * ⚠️ MyPageView는 dynamic import로 불러와야 함 (i18n hydration 에러 방지)
 *
 * @see PRD - US-4, US-5
 * @see IA - MyPage Section
 */

// Dynamic import로 i18n hydration 에러 방지
const MyPageView = dynamic(() => import("@/components/mypage/MyPageView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--primary-500)", borderTopColor: "transparent" }}
      />
    </div>
  ),
});

export default function SettingsPage() {
  return (
    <div
      className="flex h-full w-full flex-col overflow-x-hidden"
      style={{ backgroundColor: "var(--main-background)" }}
    >
      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-4 py-8 w-full min-w-0">
          <MyPageView />
        </div>
      </div>
      {/* Note: No PersistentChatInput on My Page per PRD */}
    </div>
  );
}
