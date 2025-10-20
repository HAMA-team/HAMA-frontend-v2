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
│   │   ├── LNB.tsx                # 좌측 내비게이션 바
│   │   └── ChatInput.tsx          # 하단 고정 채팅 입력창
│   ├── Chat/
│   │   ├── ChatView.tsx           # 채팅 메인 뷰
│   │   ├── MessageBubble.tsx      # 사용자 메시지 말풍선
│   │   ├── AIResponse.tsx         # AI 답변 (전체 너비)
│   │   ├── AgentActivity.tsx      # 에이전트 활동 표시 (Claude 스타일)
│   │   └── SaveArtifactButton.tsx # Artifact 저장 버튼
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
└── lib/
    ├── api.ts                     # API 클라이언트
    └── utils.ts                   # 유틸리티 함수
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
- Save as Artifact 기능
- 빈 채팅 상태 UI (시작 제안 카드)

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
- 한국어/영어 지원 (번역은 Phase 3)

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

- **Phase**: Phase 1 개발 시작 가능 (프로젝트 셋업 완료)
- **Version**: 3.0 (PRD 개편 완료, 문서 체계화)
- **Last Updated**: 2025-10-21
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
