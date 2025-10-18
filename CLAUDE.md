# HAMA Frontend - Claude Code Guide

## Project Overview

**HAMA Frontend**는 Human-in-the-Loop AI 투자 시스템을 위한 웹 클라이언트입니다.
Chat 중심의 직관적인 UX를 통해 사용자가 AI와 협업하며 투자 의사결정을 수행합니다.

## Tech Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React (1.5 strokewidth)
- **상태관리**: React Context / Zustand (TBD)
- **HTTP Client**: Axios / Fetch
- **Markdown**: react-markdown

## Design Principles

1. **Chat First**: 모든 주요 기능이 Chat 인터페이스를 통해 접근 가능
2. **Persistent Chat Input**: 모든 페이지에서 Chat 입력창이 하단 중앙에 고정 (Perplexity 스타일)
3. **HITL 필수 표시**: 승인이 필요한 경우 반드시 화면에 표시
4. **선택적 가시성**: LangGraph 에이전트 활동은 토글 가능한 뷰로 제공

## Design References

- **Shell & LNB**: Claude 구조 (좌측 사이드바)
- **Chat UI**: Gemini 레이아웃 (사용자 질문: 말풍선, AI 답변: 전체 너비)
- **Portfolio**: PilePeak.ai 레이아웃 및 톤
- **전체 테마**: PilePeak.ai의 Light Mode

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
│   │   ├── ThinkingToggle.tsx     # 추론 과정 토글
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

## Key Features (MVP Phase 1)

### 1. Core Layout
- Shell & LNB 구조 (Claude 스타일)
- 하단 고정 Chat Input (모든 페이지)
- LNB 토글 기능

### 2. Chat Interface
- Markdown 렌더링 지원
- Thinking 표시 (접었다 펼쳤다 가능)
- Save as Artifact 기능

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
- 트리맵 시각화 (기본)
- 포트폴리오 요약 정보

### 6. My Page
- 사용자 정보
- 자동화 레벨 설정 (파일럿/코파일럿/어드바이저)
- 온보딩 체험하기 버튼

### 7. Onboarding Flow
- Mock 데이터 기반 체험형 데모
- 4단계 질문 플로우
- 투자 성향 및 자동화 레벨 추천

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
- React Context 또는 Zustand 사용 (TBD)
- MVP에서는 LocalStorage 사용 (Artifacts 저장)

### Code Style
- TypeScript 사용 권장
- ESLint + Prettier 설정 필요

## Important Documents

- `FrontEndPRD.md`: 전체 프로젝트 요구사항 문서
- `references/`: 디자인 참조 자료

## Out of Scope (MVP)

- 모바일 앱
- 다크 모드
- 실시간 Push 알림
- 소셜 기능
- 음성 인터페이스
- 다국어 지원

## Current Status

- **Phase**: MVP Development
- **Version**: 1.0
- **Last Updated**: 2025-10-17

## Notes for Claude

- 이 프로젝트는 초기 단계이며 아직 package.json이 없습니다
- 디자인은 PilePeak.ai, Claude, Gemini 등의 레퍼런스를 참고합니다
- HITL(Human-in-the-Loop)은 이 프로젝트의 핵심 기능입니다
- Chat First 원칙을 항상 염두에 두세요
