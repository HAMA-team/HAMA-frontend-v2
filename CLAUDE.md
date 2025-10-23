# HAMA Frontend - Claude Code Guide

## Project Overview

**HAMA Frontend**는 Human-in-the-Loop AI 투자 시스템을 위한 웹 클라이언트입니다.
Chat 중심의 직관적인 UX를 통해 사용자가 AI와 협업하며 투자 의사결정을 수행합니다.

## Tech Stack

- **Framework**: Next.js 15.5.6 (React 19)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React (1.5 strokewidth)
- **상태관리**: Zustand
- **HTTP Client**: Axios
- **Markdown**: react-markdown
- **Charts**: Recharts
- **i18n**: react-i18next

## Design Principles

1. **Chat First**: 모든 주요 기능이 Chat 인터페이스를 통해 접근 가능
2. **Persistent Chat Input**: Chat, Artifact 상세, Portfolio 화면에서 Chat 입력창이 하단 중앙에 고정
3. **HITL 필수 표시**: 승인이 필요한 경우 반드시 화면에 표시
4. **Agent Activity Integration**: LangGraph 에이전트 활동은 Chat 화면 내에 Claude처럼 시간 순서대로 자연스럽게 표시

## Design References

- **Shell & LNB**: Claude 구조 (좌측 사이드바)
- **Chat UI**: Gemini 레이아웃 (사용자 질문: 말풍선, AI 답변: 전체 너비)
- **Agent Activity**: Claude의 Thinking 표시 방식
- **Portfolio**: PilePeak.ai 레이아웃 및 톤
- **전체 테마**: PilePeak.ai의 Light Mode
- **참조 이미지**: `references/img_references/` 및 `references/mockup_references/`

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Shell.tsx              # 전체 레이아웃
│   │   ├── LNB.tsx                # 좌측 내비게이션 바 (i18n 적용)
│   │   └── ChatInput.tsx          # 하단 고정 채팅 입력창 (자동 높이, 글자 수 제한)
│   ├── Chat/
│   │   ├── ChatView.tsx           # 채팅 메인 뷰
│   │   ├── MessageBubble.tsx      # 사용자 메시지 말풍선
│   │   ├── AIResponse.tsx         # AI 답변 (전체 너비)
│   │   ├── AgentActivity.tsx      # 에이전트 활동 표시 (Claude 스타일)
│   │   └── SaveArtifactButton.tsx # Artifact 저장 버튼 (저장 상태 표시)
│   ├── common/
│   │   ├── Toast.tsx              # 토스트 메시지 컴포넌트
│   │   ├── ToastContainer.tsx     # 토스트 컨테이너
│   │   └── LanguageSelector.tsx   # 언어 선택 드롭다운
│   ├── providers/
│   │   └── I18nProvider.tsx       # i18n 초기화 Provider
│   ├── HITL/
│   │   ├── HITLPanel.tsx          # HITL 승인 패널
│   │   └── ApprovalActions.tsx    # 승인/거부 액션
│   ├── Artifacts/
│   │   ├── ArtifactsList.tsx      # Artifact 목록
│   │   ├── ArtifactCard.tsx       # Artifact 카드
│   │   └── ArtifactDetail.tsx     # Artifact 상세
│   ├── Portfolio/
│   │   ├── PortfolioView.tsx      # 포트폴리오 메인
│   │   ├── Treemap.tsx            # 트리맵 차트
│   │   ├── PieChart.tsx           # 원 차트
│   │   └── StackedBar.tsx         # 누적 막대 차트
│   ├── MyPage/
│   │   ├── MyPageView.tsx         # 마이페이지
│   │   └── AutomationLevelSelector.tsx # 자동화 레벨 선택
│   ├── Onboarding/
│   │   ├── OnboardingFlow.tsx     # 온보딩 플로우
│   │   └── QuestionStep.tsx       # 온보딩 질문 단계
│   └── Discover/
│       ├── DiscoverView.tsx       # 디스커버 메인
│       ├── NewsFeed.tsx           # 뉴스 피드
│       └── MarketSidebar.tsx      # 시장 정보 사이드바
├── pages/
│   ├── index.tsx                  # Chat 페이지
│   ├── artifacts.tsx              # Artifacts 페이지
│   ├── portfolio.tsx              # Portfolio 페이지
│   ├── mypage.tsx                 # My Page
│   ├── discover.tsx               # Discover 페이지
│   └── onboarding.tsx             # Onboarding 페이지
├── store/
│   ├── chatStore.ts               # 채팅 전역 상태 관리 (Zustand)
│   └── toastStore.ts              # 토스트 전역 상태 관리 (Zustand)
├── lib/
│   ├── api.ts                     # API 클라이언트
│   ├── utils.ts                   # 유틸리티 함수
│   └── i18n.ts                    # i18n 설정 (react-i18next)
└── locales/
    ├── ko/
    │   └── translation.json       # 한국어 번역
    └── en/
        └── translation.json       # 영어 번역
```

## Key Features (Phase 1: 시연 필수 코어)

### 1. Core Layout
- Shell & LNB 구조 (Claude 스타일)
- 하단 고정 Chat Input (Chat, Artifact 상세, Portfolio에만)
- LNB 토글 기능
- 다크 모드 지원 (Tailwind dark mode class 방식)

### 2. Chat Interface
- Markdown 렌더링 지원
- Agent Activity 통합 표시 (Claude의 Thinking처럼)
- Save as Artifact 기능 (저장 상태 표시, LocalStorage)
- 빈 채팅 상태 UI (시작 제안 카드)
- 자동 높이 조절 ChatInput (1~5줄)
- 글자 수 제한 (5000자, 4900자부터 표시)
- Toast 알림 시스템 (성공/실패, 링크 지원)

### 3. HITL (Human-in-the-Loop)
- 우측 사이드 패널 표시 (Claude Artifacts 스타일)
- 승인/거부/수정 액션
- Backend API 연동

### 4. Artifacts
- 목록 페이지 (그리드 형태)
- 상세 뷰 (Markdown 렌더링)
- Context-Aware Chat (Artifact 내용을 컨텍스트로 포함)

### 5. Portfolio
- PilePeak.ai 스타일 레이아웃
- 다중 차트 시각화 (트리맵/원형/누적막대)
- 포트폴리오 요약 정보

### 6. My Page
- 사용자 정보
- 자동화 레벨 설정 (프로그레스 바 형태 UI)
- 초개인화된 투자 성향 프로필 (LLM 생성 서술형)
- 온보딩 체험하기 버튼 (선택적)

### 7. i18n 구조
- react-i18next 기반 다국어 지원 구조
- 한국어/영어 지원 (구조 완료, 전체 번역은 Phase 3)
- LanguageDetector를 통한 자동 언어 감지
- LocalStorage에 언어 설정 저장
- LNB 하단에 언어 선택 드롭다운 (Globe 아이콘)

## API Integration

### Main Endpoints

| Endpoint | Method | 설명 |
|----------|--------|------|
| `/api/v1/chat` | POST | 채팅 메시지 전송 |
| `/api/v1/chat/approve` | POST | HITL 승인/거부 |
| `/api/v1/portfolio/{id}` | GET | 포트폴리오 조회 |
| `/api/v1/stocks/search` | GET | 종목 검색 |
| `/api/v1/stocks/{code}` | GET | 종목 정보 |
| `/api/v1/stocks/{code}/analysis` | GET | 종목 분석 |

## Style Guidelines

### Typography
- 제목(>20px): `tracking-tight` 사용
- 본문: 읽기 편한 line-height
- Bold 대신 Semibold 사용 (한 단계 얇게)

### Colors
- 기본: 흰색 배경, 검은색/회색 텍스트
- PilePeak.ai Light Mode 색상 팔레트 참조

### Icons
- Lucide React 사용
- strokeWidth: 1.5

## Development Guidelines

### Component Naming
- PascalCase for components: `ChatView.tsx`
- kebab-case for pages: `index.tsx`

### State Management
- Zustand 사용 (전역 상태 관리)
- Phase 1-2: LocalStorage 사용 (Artifacts, Chat History 임시 저장)
- Phase 3부터: Backend DB 연동 (영구 저장)

### Code Style
- TypeScript 사용 권장
- ESLint + Prettier 설정 필요

## Important Documents

### Core Documents
- `docs/ProductRequirements.md`: PRD v3.0 (User Stories, Acceptance Criteria)
- `docs/TechnicalSpecification.md`: 컴포넌트 구조, API 연동, 성능 최적화
- `docs/DesignSystem.md`: 디자인 토큰, 타이포그래피, 색상, 애니메이션
- `docs/ErrorHandling.md`: 에러 시나리오 및 복구 전략
- `docs/InformationArchitecture.md`: IA 다이어그램 및 페이지 구조
- `docs/Userflow.md`: 사용자 플로우 다이어그램

### Reference Documents
- `references/BackendPRD.md`: 백엔드 기능 요구사항
- `references/backendAPI.md`: 백엔드 API 명세
- `references/design지시.md`: UI/UX 디자인 지시사항
- `references/초기스크리닝.md`: 온보딩 질문 시나리오
- `references/HAMA Front IA.png`: IA 다이어그램 (이미지)
- `references/html_references/`: HTML 프로토타입
- `references/mockup_references/`: Figma 목업 (PNG)
- `references/img_references/`: UI/UX 참조 이미지 (Claude, Gemini, PilePeak)

### Conventions
- `docs/conventions/`: 컨벤션 문서 (commit, branch, code)

## Development Phases

### Phase 1: 시연 필수 코어
- Core Layout, Chat, HITL, Artifacts, Portfolio, Dark Mode, i18n 구조

### Phase 2: 시각화 & 설정
- Portfolio 차트 옵션, My Page, 자동화 레벨 설정

### Phase 3: 콘텐츠 관리 & 온보딩
- Artifact 영구 저장, Chat History, Onboarding, i18n 번역

### Phase 4: UX 강화
- Discover, 검색, 필터링, 정렬

### Phase 5: 부가 기능
- 내보내기, 알림 센터

## Out of Scope

- 모바일 앱
- 실시간 Push 알림
- 소셜 기능
- 음성 인터페이스

## Current Status

- **Phase**: Phase 1 완료 ✅
- **Completed**:
  - ✅ 프로젝트 셋업 (Next.js 15, TypeScript, Tailwind CSS v4)
  - ✅ Shell & LNB 구현 (접기/펼치기, 라이트/다크 테마, fade-in 애니메이션, 전역 상태 관리)
  - ✅ 반응형 레이아웃 (LNB 연동 가운데 정렬, 가로 스크롤 방지, 동적 width 계산)
  - ✅ Chat Empty State (제안 카드 4개, 반응형 그리드)
  - ✅ ChatInput 컴포넌트 (하단 고정, 자동 높이 1~5줄, 글자 수 제한 5000자)
  - ✅ Chat Interface (Markdown 렌더링, Thinking 섹션, Save Artifact 버튼, Copy 버튼)
  - ✅ ChatMessage 컴포넌트 (사용자 말풍선, AI 전체 너비, 코드 블록 지원)
  - ✅ Toast 알림 시스템 (성공/실패, 링크 지원, 전역 상태 관리)
  - ✅ Save Artifact 상태 관리 (저장됨 표시, LocalStorage)
  - ✅ Zustand 상태 관리 (chatStore, toastStore, themeStore, useLNBWidth)
  - ✅ 기본 채팅 플로우 (메시지 전송, AI 답변 생성, Thinking 표시)
  - ✅ HITL 승인 패널 (50vw 우측 패널, 오버레이, 승인/거부 핸들러, 리스크 경고, 대안 제시)
  - ✅ Portfolio 시각화 (요약 카드 4개, 3가지 차트: 트리맵/원형/막대, Recharts)
  - ✅ i18n 구조 설정 (react-i18next, 한국어/영어, 토글 버튼)
  - ✅ Dark Mode 완전 구현 (CSS 변수, 모든 컴포넌트 색상 전환, ThemeToggle, 차트 색상 adaptive)
  - ✅ useChartColors 훅 (CSS 변수 기반 차트 색상, 다크 모드 자동 전환)
  - ✅ Dynamic import로 i18n hydration 에러 해결
- **Version**: 5.0 (Phase 1 완료 - Dark Mode & i18n 완성)
- **Last Updated**: 2025-01-24
- **Target**: 캡스톤 프로젝트 발표회 시연용

## Notes for Claude

- 이 프로젝트는 **캡스톤 프로젝트 발표회 부스 시연용**입니다
- 프로젝트 셋업 완료 (Next.js, TypeScript, Tailwind CSS, Zustand 등 설치됨)
- 디자인은 PilePeak.ai, Claude, Gemini 등의 레퍼런스를 참고합니다
- HITL(Human-in-the-Loop)은 이 프로젝트의 핵심 기능입니다
- Chat First 원칙을 항상 염두에 두세요
- 모든 문서는 `docs/` 폴더에서 확인할 수 있습니다
- IA 다이어그램과 목업을 반드시 참조하세요
- **다크 모드 & 다국어**: Phase 1부터 기본 세팅을 염두에 두고 개발 (CSS Variables, i18n 구조)
  - 완전한 구현은 Phase 2-3이지만, 처음부터 구조를 고려해서 설계
- **⚠️ Portfolio 페이지 디자인 업그레이드 필요**: 현재 기능은 구현되었으나 UI/UX가 PilePeak.ai 레퍼런스 수준에 미달. 향후 개선 필요

## Development Best Practices (교훈)

### 1. Tailwind CSS v4 사용 시 주의사항

**⚠️ CSS 변수를 Tailwind 클래스로 직접 사용 불가**

```tsx
// ❌ 작동하지 않음
<div className="bg-[var(--lnb-background)]">

// ✅ inline style 또는 hex 값 사용
<div style={{ backgroundColor: "#ffffff" }}>
<div className="bg-white border-[#e5e7eb]">
```

**이유:** LNB 구현 중 CSS 변수가 Tailwind v4에서 제대로 인식되지 않아 투명하게 표시되는 문제 발생. 해결책으로 inline styles with hex values 사용.

### 2. 상태 간 일관성 유지 (Collapse/Expand)

**원칙:** 컴포넌트의 서로 다른 상태(collapsed/expanded) 간에 시각적 일관성을 유지해야 함.

**LNB 구현 사례:**
- ✅ **패딩 통일**: collapsed/expanded 모두 `px-3` (12px)
- ✅ **버튼 높이 일정**: `h-12` (48px) 유지
- ✅ **아이콘 크기 일정**: `w-4 h-4` 통일
- ✅ **간격 일관성**: 버튼 간 `gap-0.5` 동일

**반복적으로 수정된 문제들:**
1. collapsed 시 패딩이 달라져 아이콘 위치가 이동
2. 버튼 크기 변경으로 높이가 달라짐
3. 아이콘 크기 불일치로 시각적 불균형

**교훈:** 처음부터 모든 상태에서 동일한 spacing/sizing 값을 사용하도록 설계

### 3. 애니메이션 처리

**문제:** LNB collapse/expand 시 텍스트가 애니메이션 완료 전에 나타나 깨진 것처럼 보임

**시도한 방법들:**
1. ❌ `opacity` 애니메이션 → 글씨가 아예 안 나타남
2. ❌ delay 증가 → 여전히 중간에 깨진 글씨 보임
3. ✅ **`overflow: hidden`** + fade-in 애니메이션 (0.15s delay)

**최종 해결책:**
```css
@keyframes fadeInText {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-fadeInText {
  animation: fadeInText 0.2s ease-in 0.15s both;
}
```

```tsx
<aside className="overflow-hidden transition-all duration-300">
  <span className="animate-fadeInText">텍스트</span>
</aside>
```

### 4. 점진적 개선 (Incremental Refinement)

**원칙:** 큰 변경을 한 번에 하지 말고, 작은 단위로 변경하며 테스트

**LNB 개발 과정:**
1. 기본 구조 구현 → 테스트
2. 색상 적용 → 문제 발견 (투명) → inline styles로 수정
3. collapse/expand 기능 → 테스트
4. 패딩/간격 조정 → 여러 번 반복하며 픽셀 단위 조정
5. 애니메이션 추가 → 문제 발견 → 수정
6. 최종 미세 조정

**교훈:** 처음부터 완벽하게 하려 하지 말고, 작동하는 최소 기능부터 만들고 점진적으로 개선

### 5. 문서와 실제 구현의 동기화

**문제:** DesignSystem.md에는 LNB가 다크 테마로 정의되어 있었으나, 실제 구현은 라이트 테마

**해결:** 구현 후 즉시 DesignSystem.md 업데이트하여 문서와 코드 일치시킴

**교훈:**
- 구현 중 디자인 변경이 있으면 즉시 문서 업데이트
- 커밋 전 README.md, CLAUDE.md, ProductRequirements.md 체크박스 확인

### 6. 반응형 레이아웃 구현 (LNB 연동)

**문제:** Fixed positioning된 LNB와 페이지 콘텐츠의 가운데 정렬이 제대로 작동하지 않음

**시도한 방법들:**
1. ❌ `flex-1`만 사용 → main이 전체 viewport 너비를 차지해서 콘텐츠가 잘못된 위치에 정렬됨
2. ❌ ChatInput만 `left: ${lnbWidth}px` 적용 → 페이지 콘텐츠는 여전히 전체 화면 기준으로 정렬
3. ❌ Shell에 `width: 100vw` 추가 → 가로 스크롤 여전히 발생
4. ✅ **종합 해결책**

**최종 해결책:**

```tsx
// 1. Shell.tsx - main의 너비를 명시적으로 제한
<main
  className="overflow-x-hidden transition-all duration-300 ease-in-out"
  style={{
    marginLeft: `${lnbWidth}px`,
    width: `calc(100vw - ${lnbWidth}px)`
  }}
>

// 2. layout.tsx - 최상위 overflow 방지
<html lang="en" style={{ overflowX: "hidden" }}>
  <body style={{ overflowX: "hidden", margin: 0, padding: 0 }}>

// 3. ChatInput.tsx - LNB 너비 반응
<div
  className="fixed bottom-0 right-0 z-[var(--z-chat-input)] pointer-events-none transition-[left] duration-300 ease-in-out"
  style={{ left: `${lnbWidth}px` }}
>

// 4. 모든 페이지 - 반응형 콘텐츠
<div className="max-w-[800px] mx-auto px-4 w-full min-w-0">
```

**핵심 교훈:**
1. Fixed positioning 사용 시 형제 요소의 너비를 명시적으로 계산해야 함
2. 최상위(html, body)부터 하위까지 모든 레벨에서 overflow-x-hidden 적용 필요
3. `w-full min-w-0`로 콘텐츠가 부모 너비를 초과하지 않도록 제한
4. `break-words`로 텍스트가 컨테이너를 넘지 않도록 처리
5. LNB 상태 변경 시 전역 상태(Zustand) 사용 필수 - 로컬 state로는 다른 컴포넌트가 반응하지 않음

**반복적으로 발견된 문제들:**
1. ChatInput은 반응하는데 페이지는 반응하지 않음 → Shell의 main에 동적 width 필요
2. 페이지 콘텐츠가 전체 화면 기준으로 정렬됨 → main의 marginLeft + width 조합 필요
3. 가로 스크롤 발생 → html, body 레벨에서 overflowX 제어 필요
4. 화면 축소 시 콘텐츠가 고집부림 → w-full, min-w-0, break-words 조합 필요
