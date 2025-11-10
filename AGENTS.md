# Agent Guidance (Codex Runbook)

- Source of truth: read and follow `CLAUDE.md` (repo‑wide scope).
- Precedence: direct system/developer/user instructions > `CLAUDE.md` > this file.

**Core Principles**
- Chat First UI, HITL Mandatory, transparent thinking — keep flows aligned.
- i18n required for user‑facing strings; no hardcoded copy.
- Tailwind v4 constraint: don’t use CSS variables inside utility brackets (e.g., `bg-[var(--x)]`). Use inline styles or hex.
- Layout: prevent horizontal scroll. Apply `overflow-x-hidden` on `html, body, main`. Compute main width with LNB width.
- Layering: use Tailwind z‑index tokens from `tailwind.config.ts` (`z-lnb`, `z-chat-input`, `z-hitl-panel`, `z-modal`, `z-toast`). Avoid custom variable z‑index in class brackets.

**Patterns In Use**
- Dialogs: use custom dialog, not `alert/confirm`.
  - Store: `src/store/dialogStore.ts`
  - UI: `src/components/common/Dialog.tsx`, `src/components/common/DialogContainer.tsx`
- Toasts: global container with optional link.
  - Files: `src/components/common/Toast.tsx`, `ToastContainer.tsx`, `src/store/toastStore.ts`
  - Ensure toast sits above chat input via `z-toast`.
- LNB: keep collapsed/expanded symmetry.
  - Collapsed nav and new‑chat buttons use `w-full` within `px-3` padding.
  - Use Zustand `useLNBWidth` for width + transitions.
- Relative time: format via utils with locale and threshold.
  - `formatRelativeTime`, `formatRelativeOrDate(… , thresholdDays=30)`, `formatAbsoluteDate`
  - Hover title shows absolute date.
- i18n hydration: dynamic import page‑level components using i18n.
  - Example: `ChatInput`, `ChatEmptyState`, `MyPageView` use `dynamic(..., { ssr:false })` when needed.

**Definition of Done (UI changes)**
- Strings localized (ko/en). No hardcoded Korean in English mode.
- LNB collapsed/expanded paddings, heights, icon sizes consistent.
- No horizontal scroll; main width reacts to LNB.
- Dialog/Toast/HITL panel/ChatInput layers clickable per z‑order.
- If showing relative times, switch to date beyond threshold; hover shows absolute date.

**Common Tasks**
- Portfolio polish: spacing/typography, legends/tooltips, loading/empty states, PilePeak reference alignment.
- i18n sweep: move residual labels into `src/locales/*/translation.json`.
- Add “Deleted” toast after artifact delete.
- Remove dead/debug code before commits.

**Known Rough Edges (current)**
- Portfolio page behind PilePeak reference in visual polish and interactions.
- Some leftover debug/unreachable code around approve alerts (clean when touching file).
- A few settings labels still hardcoded in Korean; centralize via i18n keys for full consistency.

**High‑Impact Tweaks Before Demo**
- Portfolio
  - Tighten spacing/typography hierarchy; balance card density.
  - Add chart legends/tooltips and graceful empty/loading states.
- Chat
  - Add subtle thinking skeletons and smooth content reveal.
  - Ensure consistent spacing between message groups.
- HITL
  - Soften overlay (optional blur) and add micro‑interactions on approve/reject.
- System
  - Add toast on artifact delete; verify all fixed layers’ z‑order and pointer events.

**Commit & Branch Conventions (summary)**
- Commit types (capitalized): `Feat`, `Fix`, `Docs`, `Style`, `Refactor`, `Test`, `Chore`, `Design`, `Comment`, `Rename`, `Remove`, `!BREAKING CHANGE`, `!HOTFIX`.
- Title ≤ 50 chars (no trailing period). Separate title/body with one blank line. Body explains what & why.
- Branches: `develop` (next release), `main` (release), `feature/<issue>-desc`, `hotfix/<issue>-desc`, `release/vX.Y.Z`.

**Quick Checks (before commit)**
- CLAUDE.md alignment: design principles, layering, i18n, LNB behavior.
- Run a brief grep for hardcoded Korean in changed files.
- Verify dialog instead of `alert/confirm` for new interactions.

**Handy Files**
- `CLAUDE.md` — overall product/tech guide
- `docs/conventions/commitMessageConvention.md` — commit rules
- `docs/conventions/branchConvention.md` — branch rules

This runbook is intentionally concise. When in doubt, defer to `CLAUDE.md` and ask for clarification.

## 커뮤니케이션 원칙
모든 사고 과정, 리뷰, 답변은 한국어로 작성합니다. 코드 주석 등 외부 시스템 제약이 있는 경우를 제외하고는 한국어 사용을 유지해 팀 간 컨텍스트를 일관되게 공유하세요.

---

## Codex 작업 로그 (세션 요약)

다음은 Claude Code 비활성화 기간 동안 Codex와 함께 수행한 변경·연결·폴리시 정리입니다. 프론트 기준으로 구현/수정, 백엔드 연동 지점, i18n/레이어링 정책 반영, 그리고 남은 TODO를 망라했습니다.

### 시스템/모드 운영
- Demo/Live 모드 토글 추가: Live는 백엔드 API 연결, Demo는 더미 동작 및 HITL 테스트 버튼 노출.
- 모드 상태: `useAppModeStore`로 전역 관리. Demo에서 네트워크 콜을 스킵하고 UI만 검증 가능.

### 채팅 UX 개선
- 전송 후 입력창 포커스 유지, 어시스턴트 “생성 중” 플레이스홀더/스켈레톤 추가.
- 전송 성공 시 플레이스홀더 교체, 실패 시 오류 토스트/재시도 UX.
- 아티팩트 문맥 주입: 상세/그리드에서 질문 시, LLM 입력 앞에 정돈된 컨텍스트 + 구분선(`---`)을 비가시적으로 첨부하고, 유저 말풍선에는 포함하지 않도록 처리.
- 컨텍스트 블록(````context ...````)이 히스토리 복원 시 유저 말풍선으로 저장된 문제를 정규식으로 분리·정리하고, 분리된 컨텍스트는 어시스턴트 거품으로 재구성.

### HITL 패널
- 승인 요청 트리거: assistant 메시지의 `requires_approval`과 `approval_request`를 감지하여 패널 오픈.
- 안전 렌더링: 숫자/문자열 누락 시 크래시 방지, Live에서 “값 있는 항목만 렌더” 정책 적용.
- 승인/거부 액션: Live에서는 `approveAction` API 사용, Demo에서는 로컬 처리.
- 프론트<->백엔드 계약서 추가: `docs/HITLFrontendContract.md`에 데이터 스키마/표시 규칙/예시 페이로드 명시.

### LNB 최근 채팅(히스토리)
- Live 모드에서 `/api/v1/chat/sessions`로 최근 목록 로드, 클릭 시 해당 세션 히스토리 조회/재구성.
- “로드 더보기” 버튼으로 페이지네이션 증가(기본 20 → 최대 100). i18n 키 `common.loadMore` 사용.
- Sticky 헤더 적용: 스크롤 시 “Recent Chats” 제목이 고정되어 컨텍스트 유지.
- 스크롤바 UX: `.hover-scrollbar` 유틸로 영역 호버 시에만 스크롤바 표시, 벗어나면 즉시 사라짐.

### LNB 최근 항목 케밥 메뉴(…) 개선
- 접근성·중첩 버튼 문제 해결: 리스트 항목은 `div role=button`으로, 내에 독립 메뉴 버튼 배치(중첩 `<button>` 제거).
- 오버레이 + 포인터 이벤트: 메뉴 오픈 시 전체 오버레이(`z-modal`)로 클릭 스루 방지. 메뉴는 `z-toast` 레이어 고정.
- 뷰포트 클램프: 케밥 메뉴 좌표를 뷰포트 안으로 클램핑해 화면 밖으로 넘치지 않도록 수정.
- 메뉴 항목: Rename(로컬 인라인 편집: Enter/Blur 저장, Esc 취소), Delete(백엔드 삭제 API 호출 후 목록 새로고침). 레이블 i18n 반영.

### 마크다운 및 스타일링
- 리스트 기호가 보이지 않던 문제 조정(채팅/아티팩트 상세 렌더러 쪽에서 `list-style`/`display:list-item` 보장).
- 전역 레이아웃 수평 스크롤 방지, LNB 폭 반영된 메인 너비 계산 유지.
- 레이어링: `z-lnb`, `z-chat-input`, `z-hitl-panel`, `z-modal`, `z-toast` 우선순위 준수. 커스텀 z 값 브라켓 사용 지양.

### 아티팩트
- 그리드 카드 높이 균일화: 카드에 `h-full flex flex-col min-h-[240px]` 적용, 제목/요약을 `flex-1`로 감싸 날짜가 항상 하단 정렬.
- 컨텍스트 주입 발송: 상세 페이지/그리드에서 질문 시 위 설명의 비가시 컨텍스트+구분선 주입을 통해 LLM 이해도를 향상.
- 우클릭 메뉴 다중 노출 문제 해결: 글로벌 이벤트로 다른 카드의 컨텍스트 메뉴 자동 닫힘.

### i18n/상대시간/문구
- 영어/한국어 현지화 키 보강: `common.loadMore`, `common.rename` 등 추가. UI 노출 문자열 하드코딩 제거.
- 상대시간은 `formatRelativeOrDate` 사용, 호버 시 절대시간 타이틀 표시.

### 백엔드 연동 및 주의점
- OpenAPI 기반 chat/portfolio/stocks/dashboard API 모듈 작성 및 연결.
- `approveAction` 누락으로 인한 ReferenceError 해결, HITL Demo/Live 분기 반영.
- 백엔드가 `automation_level`을 무시하고 도구를 실행하는 경우가 있어, 프론트에서는 마스킹/문맥 주입으로 완화(세부는 `docs/HITLFrontendContract.md`).

### 남은 TODO
- LNB 오버레이 중복 삽입 여부 최종 시각 검증(코드상 한 곳으로 통일됨).
- 케밥 메뉴 좌표 계산의 뷰포트 클램프는 기본형 구현 — 필요 시 뷰포트 경계/스크롤 오프셋 보강.
- 히스토리 복원 시 컨텍스트 정리 정규식 엣지 케이스(복수 블록, 국제화 구분자) 추가 검증.
- Live 세션 무한스크롤로 전환 고려.

### 주요 수정 파일 목록(발췌)
- `src/components/layout/LNB.tsx` — 최근 목록/오버레이/케밥 메뉴/i18n/sticky/hover-scrollbar 적용
- `src/components/artifacts/ArtifactCard.tsx` — 카드 높이 균일화, 컨텍스트 메뉴 개선
- `src/styles/globals.css` — `.hover-scrollbar` 유틸 추가
- `src/locales/en/translation.json`, `src/locales/ko/translation.json` — i18n 키 추가/정리
- `docs/HITLFrontendContract.md` — HITL 프론트 계약 문서 추가

작업 전반은 `CLAUDE.md`의 디자인 가이드, 레이어링 정책, i18n 원칙을 준수했습니다.

---

## AGENTS.md 이후 추가 반영 사항 (최근 작업 정리)

아래 항목은 위 세션 요약 이후 진행된 보강/도구/설정 변경입니다. Claude가 즉시 파악할 수 있도록 실행 포인트와 파일 경로를 함께 남깁니다.

### 테스트/운영 도구 추가
- LLM 테스트 프롬프트 가이드 추가: 카테고리별(General/Research/Strategy/Risk/Portfolio/Trading/HITL) 시나리오와 승인 유도 프롬프트 포함. 실제 백엔드와 연결해 응답 품질을 빠르게 점검 가능.
  - 파일: docs/llm_test_prompts.md
- OpenAPI 기반 Notion 커버리지 시트 생성 스크립트 추가: OpenAPI와 API 리포트 요약을 읽어 그룹/엔드포인트/메서드/사용현황/예상 동작/실제 동작/결과/블로커를 표로 생성.
  - 파일: scripts/build_notion_api_sheet.ps1
  - 실행(예): PowerShell에서 `./scripts/build_notion_api_sheet.ps1 -BaseUrl http://localhost:8000 -OpenApiPath docs/backend/openapi.json -ApiReportPath docs/backend/API_Test_Report.md -OutPath docs/qa/API_Full_Coverage_Filled.md`
  - 출력: docs/qa/API_Full_Coverage_Filled.md

### 스트리밍/SSE 연동
- 멀티에이전트 스트리밍 엔드포인트 연동: `POST /api/v1/chat/multi-stream`에 `text/event-stream`로 접속해 이벤트 파싱. `event:`/`data:` 라인 분리, `done` 및 `[DONE]` 처리 포함. ngrok 환경 경고 우회 헤더(`ngrok-skip-browser-warning`) 자동 첨부.
  - 파일: src/lib/api/chatStream.ts
  - 폴백: 스트림 실패 시 단발 `/api/v1/chat/` 경로 사용 로직 유지(src/lib/api/chat.ts)

### 빌드/환경 설정
- Next 빌드에서 ESLint 경고로 인한 실패 방지 설정 반영(`ignoreDuringBuilds: true`).
  - 파일: next.config.ts
- 전역 수평 스크롤 방지 재확인: `html/body`에 `overflow-x: hidden` 적용.
  - 파일: src/app/layout.tsx
- 환경 변수 예시/로컬 값 정리: 기본 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`로 안내, ngrok 샘플은 주석으로 보관.
  - 파일: .env.example, .env.local

### i18n/프로바이더
- i18n 초기화/감지/로컬스토리지 캐시 구성 고정: 브라우저 환경에서만 초기화하며 `useSuspense: false`로 SSR 의존 해제.
  - 파일: src/lib/i18n.ts, src/components/providers/I18nProvider.tsx
- 번역 리소스 경로: 런타임은 `src/locales/*/translation.json`을 사용. `src/lib/i18n/locales/*.json`는 중복으로 보이며 정리 후보.

### QA/헬스체크 연동
- 마이페이지 APICheckPanel에서 Healthcheck 전용 엔드포인트 사용(예: `settings/automation-level(s)`, `portfolio/chart-data`) — 프론트 라우팅 없이 연동 상태만 확인.
  - 파일: src/components/mypage/APICheckPanel.tsx, src/lib/api/*

### 운영 팁(모드/네트워크)
- Demo/Live 전환: LNB 상단 `DevDemoToggle`로 토글. Demo는 네트워크 콜 없이 UI만 검증, Live에서만 백엔드 호출.
  - 파일: src/components/common/DevDemoToggle.tsx, src/store/appModeStore.ts
- ngrok 사용 시: 스트리밍에서 브라우저 경고 배너 우회를 위해 `ngrok-skip-browser-warning` 헤더 자동 첨부(chatStream.ts 참고).

### 알려진 개선/정리 포인트(추가)
- 이중 번역 파일 정리: `src/locales`와 `src/lib/i18n/locales` 중 실제 사용은 전자 — 후자 폴더 정리 필요.
- I18nProvider의 초기화 콘솔 로그 제거 후보: 개발 중 디버깅 로그(`"i18n initialized"`) 정리 검토.

### 참고 파일(추가)
- 스트리밍: src/lib/api/chatStream.ts
- 테스트 프롬프트: docs/llm_test_prompts.md
- Notion 시트 생성: scripts/build_notion_api_sheet.ps1
- 환경 변수 예시: .env.example, .env.local
