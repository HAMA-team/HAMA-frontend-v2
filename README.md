# HAMA Frontend v2

Human-in-the-Loop AI Investment System - Web Client

## Overview

HAMA Frontend는 AI와 협업하여 투자 의사결정을 수행하는 Chat 중심의 웹 애플리케이션입니다. Human‑in‑the‑Loop(HITL) 원칙을 기반으로, 멀티 에이전트 스트리밍과 승인 패널을 통해 안전하고 투명한 상호작용을 제공합니다.

## Tech Stack

- **Framework**: Next.js 15.5.6 (React 19)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React (strokeWidth: 1.5)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Markdown**: react-markdown
- **Charts**: Recharts
- **i18n**: react-i18next
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── layout/          # Shell, LNB, ChatInput
│   ├── chat/            # Chat interface (messages, thinking, save)
│   ├── hitl/            # HITL approval panels (5 types)
│   ├── artifacts/       # Artifact grid/detail
│   ├── portfolio/       # Portfolio views and charts
│   ├── mypage/          # Settings (automation/HITL, API checks)
│   └── common/          # Toast, Dialog, Language/Theme toggles
├── hooks/               # UI/behavior hooks (e.g., useLNBWidth)
├── lib/                 # Utilities and API clients
│   ├── api/             # REST + SSE clients (chat, approvals, settings…)
│   ├── i18n/            # i18n runtime config
│   └── types/           # Shared types (chat, portfolio)
├── store/               # Zustand stores (chat/artifact/user/appMode)
└── styles/              # Global styles (Tailwind v4)
├── lib/                 # Utilities and API client
│   └── i18n/            # Internationalization config
└── styles/              # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/HAMA-team/HAMA-frontend-v2.git
cd HAMA-frontend-v2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Demo/Live toggle:
- The app supports Demo/Live modes. Use the DevDemoToggle in the LNB header or set initial mode via `useAppModeStore`.
- Demo: no backend calls; includes HITL test buttons on the empty chat view.
- Live: uses the configured backend (`NEXT_PUBLIC_API_BASE_URL`).

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

### Code Quality

Run ESLint:
```bash
npm run lint
```

Format code with Prettier:
```bash
npx prettier --write .
```

## Design Principles

1. **Chat First**: All major features accessible through chat interface
2. **Persistent Input**: Bottom‑fixed input (Chat/Artifact/Portfolio) with LNB‑aware centering
3. **HITL Mandatory**: Approval panels open whenever required; buttons disabled during API in‑flight
4. **Streaming Transparency**: Multi‑agent thinking/steps surface progressively in the chat
5. **No Horizontal Scroll**: `html, body, main { overflow-x: hidden }`; main width responds to LNB
6. **Layering**: Use Tailwind z‑tokens (`z-lnb`, `z-chat-input`, `z-hitl-panel`, `z-modal`, `z-toast`)
7. **Tailwind v4 constraint**: Avoid CSS variables inside utility brackets (use inline styles or hex)

## Design References

- **Shell & LNB**: Claude structure (left sidebar)
- **Chat UI**: Gemini layout (user: bubble, AI: full width)
- **Agent Activity**: Claude's Thinking display style
- **Portfolio**: PilePeak.ai layout and tone
- **Overall Theme**: PilePeak.ai Light Mode

See `references/` folder for detailed design references.

## Features (Current)

- Chat UI with Markdown rendering, copy, and artifact saving
- Multi‑agent SSE streaming client (`POST /api/v1/chat/multi-stream`)
  - Parses `text/event-stream`, normalizes events, surfaces thinking/steps
  - Sends `hitl_config` (object) and, for legacy servers, derived `automation_level` (1/2/3)
- HITL approval panels (Research/Strategy/Portfolio/Risk/Trading)
  - Trading and others support missing‑field safe rendering; values absent → hidden or “-”
  - Type normalization: `trade_approval` → `trading`
  - Buttons disabled while approve/reject API is in flight
  - Drawer and Floating variants (bottom‑right popup). Width = ~1.5× LNB (clamped 360–720px)
- Approvals API integration (`POST /api/v1/chat/approve`)
  - Payload: `thread_id`, `decision: 'approved'|'rejected'|'modified'`, optional `modifications`, `user_notes`, `request_id`
  - On click: app adds only the decision message (assistant request summary is saved by backend)
- Settings (Automation/HITL)
  - Uses `hitl_config` with presets (`pilot`, `copilot`, `advisor`, `custom`) and phase toggles
  - Client calls new endpoints first and falls back to legacy during migration
- i18n (ko/en) with runtime hydration; dynamic imports for i18n’d components as needed
- LNB with recent chats area, sticky headers, hover‑scrollbar
- Portfolio charts (treemap/pie/bar) and lists; dark/light theme aware

## API Integration

Environment
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` (ngrok: header `ngrok-skip-browser-warning: true` auto‑attached by stream client)

Endpoints used
- Chat (fallback): `POST /api/v1/chat/` with `{ message, conversation_id?, hitl_config }`
- Multi‑stream (SSE): `POST /api/v1/chat/multi-stream`
  - Request: `{ message, conversation_id?, hitl_config, automation_level (legacy), stream_thinking: true }`
  - Events handled: `master_*`, `agent_*`, `message/delta`, `hitl_interrupt` (current), `hitl.request` (target), `done`
- Approve: `POST /api/v1/chat/approve`
  - Request: `{ thread_id, decision, modifications?, user_notes?, request_id? }`
- Settings (new first, legacy fallback)
  - Get: `GET /api/v1/settings/hitl-config` → fallback `GET /api/v1/settings/settings/automation-level`
  - Put: `PUT /api/v1/settings/hitl-config` (with `{ hitl_config, confirm: true }`) → fallback legacy path
  - Presets: `GET /api/v1/settings/hitl-config/presets` → fallback legacy presets path

Migration notes
- Frontend sends both `hitl_config` and derived `automation_level` during the backend migration window.
- Once backend fully supports `hitl_config` input and emits `hitl.request`, we can remove the legacy code paths.

## Development Phases

### Phase 1: Core Demo (✅ Completed)
**Completed:**
- ✅ Core Layout (Shell.tsx, LNB.tsx with collapse/expand)
- ✅ Responsive Layout (LNB-aware centering, no horizontal scroll)
- ✅ Chat Empty State (suggestion cards with responsive grid)
- ✅ Persistent Chat Input (ChatInput.tsx with LNB integration)
- ✅ Chat Interface (Markdown, Thinking section, Save Artifact)
- ✅ ChatMessage component (user bubble, AI full-width, copy button)
- ✅ Tailwind CSS v4 setup with design system
- ✅ Zustand state management (chatStore, artifactStore, useLNBWidth)
- ✅ HITL approval panel (50vw right panel, overlay, approve/reject handlers)
- ✅ Portfolio visualization (4 summary cards, 3 chart types: treemap/pie/bar, Recharts)
- ✅ **Artifacts** (목록 그리드 뷰, 상세 페이지, LocalStorage 저장, Markdown 제목 추출)
- ✅ Dark mode support (CSS variables, theme toggle, all components)
- ✅ i18n structure (Korean/English, language toggle)
- ✅ Dynamic chart colors (useChartColors hook, dark mode adaptive)

### Phase 2: Visualization & Settings (✅ Completed)
**Completed:**
- ✅ My Page (마이페이지) - User settings interface
- ✅ **Automation Level Settings - 4-mode system (Advisor/Copilot/Pilot/Custom)**
  - ✅ 5-step workflow visualization (데이터 수집 → 분석 → 포트폴리오 → 리스크 → 매매)
  - ✅ **Interactive Workflow Bar** - Clickable dots to toggle HITL per phase
  - ✅ **Custom Mode Support** - Granular control over each phase
  - ✅ HITL intervention points display (red dots for approval required)
  - ✅ Level cards with detailed features
  - ✅ **hitl_config Migration Complete** (automation_level → hitl_config)
    - ✅ LocalStorage version 2 migration with auto-conversion
    - ✅ Custom mode settings persistence (customModePhases)
    - ✅ Preset auto-detection (matchPreset helper)
- ✅ User Store (userStore.ts) - Automation level state management (v2 migration)
- ✅ **i18n Full Translation Complete** (Korean/English, 160+ keys, 99% coverage)
  - ✅ All major components translated (Chat, HITL, Portfolio, Artifacts, LNB, My Page)
  - ✅ Translation key conflicts resolved
- ✅ **5 Agent-specific HITL Panels Implementation**
  - ✅ ResearchApprovalPanel.tsx
  - ✅ StrategyApprovalPanel.tsx
  - ✅ PortfolioApprovalPanel.tsx
  - ✅ RiskApprovalPanel.tsx
  - ✅ TradingApprovalPanel.tsx
- ✅ Investment Profile placeholder (Phase 3 구조 준비)

**Moved to Phase 3:**
- Portfolio chart options enhancement
- Backend HITL integration
- Chat History persistence

### Phase 3: Backend Integration & Content Management
- Backend HITL integration (LangGraph interrupt mechanism)
- Chat History persistence
- Onboarding flow
- Investment Profile API integration
- Portfolio chart enhancements

### Phase 4: UX Enhancement
- Discover, search, filtering, sorting

### Phase 5: Additional Features
- Export, notification center

## Documentation

### Core Documents
- `docs/ProductRequirements.md`: Functional requirements (User Stories)
- `docs/TechnicalSpecification.md`: Technical implementation details
- `docs/DesignSystem.md`: Design tokens, typography, colors, animations
- `docs/ErrorHandling.md`: Error scenarios and recovery strategies
- `docs/InformationArchitecture.md`: IA diagram and page structure
- `docs/Userflow.md`: User flow diagrams

### Reference Documents
- `references/BackendPRD.md`: Backend functional requirements
- `references/backendAPI.md`: Backend API specifications
- `references/design지시.md`: UI/UX design instructions
- `references/초기스크리닝.md`: Onboarding question scenarios
- `references/HAMA Front IA.png`: IA diagram (visual)

### Conventions
- `docs/conventions/`: Coding and git conventions
- `CLAUDE.md`: Claude Code development guide

## Known Caveats (Backend alignment)

- Approve flow: some backend paths may return `None` for LangGraph results; server needs a guard before calling `.get`. Frontend already disables buttons during in‑flight and shows user‑friendly errors.
- During migration, the server may accept only `automation_level` for streaming; frontend derives it from `hitl_config` and includes both.

## Runbook (Quick)

- Dev: `npm run dev` (Demo mode available via LNB toggle)
- Live: set `NEXT_PUBLIC_API_BASE_URL` and use the SSE multi‑stream endpoint; verify Settings GET/PUT paths in APICheckPanel
- Build: `npm run build` (Next config ignores ESLint warnings on build)

## Contributing

Please follow the conventions in `docs/conventions/`:
- Branch naming: `feature/[issue-number]-description`
- Commit messages: See `docs/conventions/commitMessageConvention.md`
- Code style: See `docs/conventions/codeConvention.md`

## License

ISC

## Contact

HAMA Team - [GitHub](https://github.com/HAMA-team)

## Screenshots

아래 경로의 예시 이미지를 참고하세요(향후 업데이트 예정).
- eferences/img_references/Claude chat history.png
- eferences/mockup_references/아티팩트 본문 뷰.png
- eferences/mockup_references/HITL 승인 패널.png
- eferences/mockup_references/Portfolio.png

## Shortcuts

- Enter: 메시지 전송
- Shift+Enter: 줄바꿈

## Troubleshooting

- Backend not running / Stream HTTP error
  - 서버 실행 여부 확인: NEXT_PUBLIC_API_BASE_URL 점검, API 문서 페이지 접속 확인
  - SSE는 POST /api/v1/chat/multi-stream 사용. ngrok 사용 시 헤더 
grok-skip-browser-warning: true 자동 첨부됨

- Approval processing error: 'NoneType' object has no attribute 'get'
  - 백엔드 승인 처리 경로에서 LangGraph 결과가 None일 때 .get() 호출로 발생. 서버에 None 가드 필요
  - 프론트는 승인/거절 버튼을 API 응답까지 비활성화하여 중복 클릭을 방지하고 친화적 오류를 표시함

- Settings API 404/405
  - 마이그레이션 중에는 새 경로(/settings/hitl-config)가 없을 수 있음. 클라이언트가 레거시(/settings/settings/automation-level(s))로 폴백함

- CORS/네트워크 오류
  - 베이스 URL, 프록시/브라우저 콘솔, 네트워크 탭에서 요청/응답을 확인
