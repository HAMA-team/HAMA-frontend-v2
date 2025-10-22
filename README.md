# HAMA Frontend v2

Human-in-the-Loop AI Investment System - Web Client

## Overview

HAMA Frontend는 AI와 협업하여 투자 의사결정을 수행하는 Chat 중심의 웹 애플리케이션입니다.

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
│   ├── Layout/          # Shell, LNB, ChatInput
│   ├── Chat/            # Chat interface
│   ├── HITL/            # Human-in-the-Loop components
│   ├── Artifacts/       # Artifact management
│   ├── Portfolio/       # Portfolio views
│   ├── MyPage/          # User settings
│   ├── Onboarding/      # Onboarding flow
│   └── Discover/        # Discovery features
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
2. **Persistent Chat Input**: Chat input fixed at bottom (Chat, Artifact detail, Portfolio)
3. **HITL Required**: Always display when approval is needed
4. **Agent Activity Integration**: LangGraph agent activities shown naturally in chat timeline

## Design References

- **Shell & LNB**: Claude structure (left sidebar)
- **Chat UI**: Gemini layout (user: bubble, AI: full width)
- **Agent Activity**: Claude's Thinking display style
- **Portfolio**: PilePeak.ai layout and tone
- **Overall Theme**: PilePeak.ai Light Mode

See `references/` folder for detailed design references.

## Development Phases

### Phase 1: Core Demo (In Progress)
**Completed:**
- ✅ Core Layout (Shell.tsx, LNB.tsx with collapse/expand)
- ✅ Responsive Layout (LNB-aware centering, no horizontal scroll)
- ✅ Chat Empty State (suggestion cards with responsive grid)
- ✅ Persistent Chat Input (ChatInput.tsx with LNB integration)
- ✅ Chat Interface (Markdown, Thinking section, Save Artifact)
- ✅ ChatMessage component (user bubble, AI full-width, copy button)
- ✅ Tailwind CSS v4 setup with design system
- ✅ Zustand state management (chatStore, useLNBWidth)
- ✅ HITL approval panel (50vw right panel, overlay, approve/reject handlers)
- ✅ Portfolio visualization (4 summary cards, 3 chart types: treemap/pie/bar, Recharts)

**Next:**
- i18n structure setup
- Dark mode support

### Phase 2: Visualization & Settings
- Portfolio chart options, My Page, automation level settings

### Phase 3: Content Management & Onboarding
- Artifact persistence, Chat History, Onboarding, i18n translations

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

## Contributing

Please follow the conventions in `docs/conventions/`:
- Branch naming: `feature/[issue-number]-description`
- Commit messages: See `docs/conventions/commitMessageConvention.md`
- Code style: See `docs/conventions/codeConvention.md`

## License

ISC

## Contact

HAMA Team - [GitHub](https://github.com/HAMA-team)
