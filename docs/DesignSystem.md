# Design System

**Version:** 1.1

**Last Updated:** 2025-10-21

**Related:** PRD v3.0, TechnicalSpecification.md

---

## Overview

HAMA Frontend의 디자인 시스템은 **PilePeak.ai Light Mode**를 기본으로 하며, Claude (Shell/LNB), Gemini (Chat), PilePeak.ai (Portfolio)의 UX 패턴을 차용합니다.

### Design Principles

1. **Clean & Minimal**: 불필요한 장식 제거, 콘텐츠 중심
2. **Consistent Spacing**: 8px 기반 그리드 시스템
3. **Accessible Contrast**: WCAG AA 기준 4.5:1 이상
4. **Readable Typography**: 제목은 tight tracking, 본문은 편안한 line-height
5. **Perplexity-style Chat Input**: 지속적인 챗 프롬프트가 항상 화면 중앙 하단에 고정

---

## Color Palette

### Light Mode (Default)

| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| `--background` | `#ffffff` | 페이지 배경 | - |
| `--foreground` | `#171717` | 본문 텍스트 | 12.6:1 ✅ |
| `--muted` | `#6b7280` | 보조 텍스트 | 4.5:1 ✅ |
| `--border` | `#e5e7eb` | 구분선, 테두리 | - |
| `--card` | `#f9fafb` | 카드 배경 | - |
| `--primary` | `#3b82f6` | CTA 버튼, 링크 | 4.5:1 ✅ |
| `--primary-hover` | `#2563eb` | Primary hover state | - |
| `--secondary` | `#6b7280` | 보조 버튼 | - |
| `--secondary-hover` | `#4b5563` | Secondary hover state | - |
| `--destructive` | `#ef4444` | 삭제, 에러 | 4.5:1 ✅ |
| `--destructive-hover` | `#dc2626` | Destructive hover | - |
| `--success` | `#10b981` | 성공 메시지, 토스트 | 3.9:1 ⚠️ (배경 조정 필요) |
| `--warning` | `#f59e0b` | 경고 메시지 | 2.9:1 ⚠️ (배경 조정 필요) |

### Dark Mode

| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| `--background` | `#0a0a0a` | 페이지 배경 | - |
| `--foreground` | `#ededed` | 본문 텍스트 | 13.1:1 ✅ |
| `--muted` | `#9ca3af` | 보조 텍스트 | 5.8:1 ✅ |
| `--border` | `#27272a` | 구분선, 테두리 | - |
| `--card` | `#18181b` | 카드 배경 | - |
| `--primary` | `#3b82f6` | CTA 버튼, 링크 | 4.5:1 ✅ |
| `--primary-hover` | `#60a5fa` | Primary hover state | - |
| `--secondary` | `#71717a` | 보조 버튼 | - |
| `--secondary-hover` | `#a1a1aa` | Secondary hover state | - |
| `--destructive` | `#ef4444` | 삭제, 에러 | 4.5:1 ✅ |
| `--destructive-hover` | `#f87171` | Destructive hover | - |
| `--success` | `#34d399` | 성공 메시지 | 5.1:1 ✅ |
| `--warning` | `#fbbf24` | 경고 메시지 | 3.1:1 ⚠️ |

### Semantic Colors

| Purpose | Light | Dark |
|---------|-------|------|
| Chat User Message Bubble | `#f3f4f6` | `#27272a` |
| Chat AI Response Background | `transparent` | `transparent` |
| HITL Panel Background | `#ffffff` | `#18181b` |
| HITL Panel Overlay | `rgba(0, 0, 0, 0.3)` | `rgba(0, 0, 0, 0.6)` |
| LNB Background | `#f9fafb` | `#18181b` |
| LNB Active Item | `#e5e7eb` | `#27272a` |
| Toast Success Background | `#d1fae5` | `#064e3b` |
| Toast Error Background | `#fee2e2` | `#7f1d1d` |
| Toast Warning Background | `#fef3c7` | `#78350f` |
| Toast Info Background | `#dbeafe` | `#1e3a8a` |

---

## Typography

### Font Family

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `h1` | `36px` | 600 | `40px` | `-0.025em` | 페이지 제목 |
| `h2` | `30px` | 600 | `36px` | `-0.025em` | 섹션 제목 |
| `h3` | `24px` | 600 | `32px` | `-0.025em` | 서브섹션 제목 |
| `h4` | `20px` | 600 | `28px` | `-0.025em` | 카드 제목 |
| `body-lg` | `18px` | 400 | `28px` | `0` | 본문 (강조) |
| `body` | `16px` | 400 | `24px` | `0` | 본문 (기본) |
| `body-sm` | `14px` | 400 | `20px` | `0` | 보조 텍스트 |
| `caption` | `12px` | 400 | `16px` | `0` | 작은 텍스트 |
| `code` | `14px` | 400 | `20px` | `0` | 코드 블록 |

### Typography Rules

- **제목 (>20px)**: `letter-spacing: -0.025em` (tracking-tight)
- **Bold 대신 Semibold**: Font weight 600 사용 (한 단계 얇게)
- **Markdown 렌더링**: react-markdown 기본 스타일 적용

---

## Spacing System

8px 기반 그리드 시스템 사용 (Tailwind의 기본 spacing 사용)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | 아이콘과 텍스트 간격 |
| `sm` | `8px` | 밀집된 요소 간격 |
| `md` | `16px` | 기본 요소 간격 |
| `lg` | `24px` | 섹션 내부 간격 |
| `xl` | `32px` | 섹션 간 간격 |
| `2xl` | `48px` | 큰 섹션 간 간격 |
| `3xl` | `64px` | 페이지 상단/하단 여백 |

### Component-Specific Spacing

- **LNB Padding**: `16px` (좌우), `12px` (상하)
- **Chat Message Padding**: `16px` (사용자 메시지), `24px` (AI 답변)
- **HITL Panel Padding**: `24px` (내부 콘텐츠)
- **Card Padding**: `24px` (기본 카드), `16px` (작은 카드)
- **Button Padding**: `12px 24px` (Primary), `8px 16px` (Small)

---

## Layout Dimensions

### Global Shell

| Component | Width | Behavior |
|-----------|-------|----------|
| **LNB (Left Navigation Bar)** | `260px` | 고정 너비 (접기 시 `60px`) |
| **Main Content** | `calc(100vw - 260px)` | 유동 너비 (LNB 접기 시 `calc(100vw - 60px)`) |
| **HITL Panel** | `50vw` | 우측 오버레이 (최소 `400px`, 최대 `600px`) |

### Content Max Width

- **Chat 페이지**: `800px` (중앙 정렬)
- **Portfolio 페이지**: `1200px` (전체 너비)
- **Artifacts 목록**: `1200px` (그리드)
- **Artifact 상세**: `800px` (Markdown 가독성)

---

## Icons

### Icon Library

**Lucide React** 사용

### Icon Standards

- **Stroke Width**: `1.5` (기본)
- **Size**:
  - Small: `16px` (caption 텍스트 옆)
  - Medium: `20px` (body 텍스트 옆)
  - Large: `24px` (버튼, 제목 옆)
  - XL: `32px` (Empty State)

### Icon Usage

| Context | Icon | Size |
|---------|------|------|
| LNB 메뉴 | MessageSquare, BarChart3, Archive, User | `20px` |
| Chat Input | Send | `20px` |
| HITL Actions | Check, X | `20px` |
| Thinking Section | ChevronDown, ChevronUp | `16px` |
| Toast | CheckCircle, AlertCircle, Info, AlertTriangle | `20px` |
| Empty State | MessageSquareText, Archive, BarChart3 | `32px` |

---

## Animation & Transitions

### Timing Functions

```css
/* Ease Out Cubic (기본) */
cubic-bezier(0.215, 0.610, 0.355, 1.000)

/* Ease In Out Cubic (모달, 패널) */
cubic-bezier(0.645, 0.045, 0.355, 1.000)

/* Ease Out Expo (강조 애니메이션) */
cubic-bezier(0.190, 1.000, 0.220, 1.000)
```

### Duration Standards

| Action | Duration | Easing |
|--------|----------|--------|
| Button Hover | `150ms` | ease-out-cubic |
| Link Hover | `100ms` | ease-out-cubic |
| Modal Open/Close | `300ms` | ease-in-out-cubic |
| HITL Panel Slide In | `300ms` | ease-in-out-cubic |
| HITL Panel Slide Out | `200ms` | ease-in-out-cubic |
| Thinking Section Toggle | `200ms` | ease-out-cubic |
| Chart Type Change | `500ms` | ease-out-expo |
| Toast Fade In | `200ms` | ease-out-cubic |
| Toast Fade Out | `150ms` | ease-out-cubic |
| Loading Spinner | `1000ms` | linear (infinite) |

### Specific Animations

**HITL Panel Slide In:**
```css
@keyframes hitl-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
/* Duration: 300ms, Easing: ease-in-out-cubic */
```

**Thinking Section Accordion:**
```css
/* Default: 접힘 상태 */
max-height: 0;
overflow: hidden;

/* 펼침 시 */
max-height: 1000px; /* 충분히 큰 값 */
transition: max-height 200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);

/* 아이콘 회전 */
transform: rotate(180deg); /* 펼침 시 */
transition: transform 200ms ease-out;
```

**Toast Notification:**
```css
/* Slide up + Fade in (200ms) */
@keyframes toast-in {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## Shadows

### Elevation Levels

| Level | Box Shadow | Usage |
|-------|------------|-------|
| `sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | 카드 (기본) |
| `md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | 버튼 hover, Dropdown |
| `lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | 모달, HITL 패널 |
| `xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` | 강조된 오버레이 |

### Dark Mode Shadows

Dark 모드에서는 shadow 대신 border 사용:

```css
/* Light Mode */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Dark Mode */
border: 1px solid var(--border);
box-shadow: none;
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `4px` | 작은 버튼, Badge |
| `md` | `8px` | 기본 버튼, Input, 카드 |
| `lg` | `12px` | 모달, HITL 패널 |
| `xl` | `16px` | 큰 섹션, Chart 컨테이너 |
| `full` | `9999px` | 원형 아이콘 버튼 |

---

## Buttons

### Primary Button

```css
background: var(--primary);
color: #ffffff;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;
transition: background 150ms cubic-bezier(0.215, 0.610, 0.355, 1.000);

/* Hover */
background: var(--primary-hover);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

### Secondary Button

```css
background: transparent;
color: var(--foreground);
border: 1px solid var(--border);
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;
transition: all 150ms cubic-bezier(0.215, 0.610, 0.355, 1.000);

/* Hover */
background: var(--card);
border-color: var(--muted);
```

### Destructive Button

```css
background: var(--destructive);
color: #ffffff;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;

/* Hover */
background: var(--destructive-hover);
```

### Button Sizes

| Size | Padding | Font Size | Icon Size |
|------|---------|-----------|-----------|
| Small | `8px 16px` | `14px` | `16px` |
| Medium (기본) | `12px 24px` | `16px` | `20px` |
| Large | `16px 32px` | `18px` | `24px` |

---

## Forms

### Input Field

```css
background: var(--background);
border: 1px solid var(--border);
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
line-height: 24px;
transition: border-color 150ms ease-out;

/* Focus */
border-color: var(--primary);
outline: 2px solid rgba(59, 130, 246, 0.1);
outline-offset: 2px;

/* Error */
border-color: var(--destructive);
```

### Chat Input (Persistent - Perplexity Style)

```css
/* Container */
position: fixed;
bottom: 32px; /* 2rem */
left: 50%;
transform: translateX(-50%);
width: calc(100% - 260px - 8rem); /* LNB 너비 + 좌우 여백 */
max-width: 900px;
z-index: 20;

/* Input */
background: var(--background);
border: 1px solid var(--border);
border-radius: 16px; /* 더 둥글게 */
padding: 16px 48px 16px 16px; /* 우측 Send 버튼 공간 */
font-size: 16px;
line-height: 24px;
min-height: 56px;
max-height: 200px;
resize: none;
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Focus */
border-color: var(--primary);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
```

### Textarea Behavior

- **Shift+Enter**: 줄바꿈
- **Enter**: 전송
- **Auto-resize**: 콘텐츠에 따라 높이 자동 조정 (최대 200px)
- **Character Counter**: 4900자 이상 시 우측 하단에 `4900/5000` 표시
- **Disclaimer**: 입력창 하단에 "AI가 실수할 수 있습니다. 중요한 정보는 확인하세요." (12px, gray-500)

---

## Cards

### Default Card

```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px; /* HTML 레퍼런스 기준 */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
transition: box-shadow 150ms ease-out;

/* Hover (클릭 가능한 카드) */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
cursor: pointer;
```

### Suggestion Card (Empty State)

```css
/* 시작 제안 카드뷰의 4개 카드 */
padding: 24px;
background: white;
border: 1px solid var(--border);
border-radius: 12px;

/* Icon Container */
width: 40px;
height: 40px;
border-radius: 8px;
background: [color]-50; /* blue-50, green-50, etc. */

/* Hover */
border-color: var(--primary);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

### Chat Message Bubble (User)

```css
background: #f3f4f6; /* Light Mode */
border-radius: 16px 16px 4px 16px; /* 우측 하단만 각짐 */
padding: 12px 16px;
max-width: 80%;
align-self: flex-end;
```

### AI Response (Full Width)

```css
background: transparent;
padding: 24px 0;
width: 100%;
```

---

## Toast Notifications

### Toast Structure

```
[Toast Container]
├─ [Icon] (20px, left aligned)
├─ [Message] (body-sm, 14px)
└─ [Close Button] (optional)
```

### Toast Styles

| Type | Background (Light) | Background (Dark) | Icon | Duration |
|------|-------------------|-------------------|------|----------|
| Success | `#d1fae5` | `#064e3b` | CheckCircle | 3000ms |
| Error | `#fee2e2` | `#7f1d1d` | AlertCircle | 5000ms |
| Warning | `#fef3c7` | `#78350f` | AlertTriangle | 4000ms |
| Info | `#dbeafe` | `#1e3a8a` | Info | 3000ms |

### Toast Position

```css
position: fixed;
top: 24px;
right: 24px;
z-index: 9999;
```

---

## Loading States

### Loading Spinner

```css
/* Circular spinner */
border: 2px solid var(--border);
border-top-color: var(--primary);
border-radius: 50%;
width: 24px;
height: 24px;
animation: spin 1000ms linear infinite;

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Loading Skeleton

```css
background: linear-gradient(
  90deg,
  var(--card) 0%,
  var(--border) 50%,
  var(--card) 100%
);
background-size: 200% 100%;
animation: loading 1500ms ease-in-out infinite;

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Empty States

### Structure

```
[Empty State Container]
├─ [Icon] (32px, muted color)
├─ [Heading] (h4, 20px)
├─ [Description] (body-sm, muted)
└─ [CTA Button] (optional)
```

### Style

```css
text-align: center;
padding: 64px 24px;
color: var(--muted);

/* Icon */
color: var(--muted);
margin-bottom: 16px;

/* Heading */
color: var(--foreground);
margin-bottom: 8px;
```

---

## Accessibility

### Color Contrast Requirements

- **Normal Text (16px)**: 최소 4.5:1 (WCAG AA)
- **Large Text (20px+)**: 최소 3:1 (WCAG AA)
- **UI Components**: 최소 3:1

### Focus Indicators

```css
/* Keyboard focus */
outline: 2px solid var(--primary);
outline-offset: 2px;
border-radius: 8px;
```

### Screen Reader Support

- **aria-label**: 아이콘 버튼에 필수
- **role**: 커스텀 컴포넌트에 적절한 role 지정
- **aria-live**: Toast, 로딩 상태 등 동적 콘텐츠에 사용

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Enter` | 메시지 전송 | Chat Input (포커스 시) |
| `Shift + Enter` | 줄바꿈 | Chat Input |
| `Cmd/Ctrl + K` | Chat Input 포커스 | 전역 |
| `Cmd/Ctrl + B` | LNB 토글 | 전역 |
| `Escape` | HITL 패널 닫기 (불가) | HITL 패널 (차단됨) |
| `Cmd/Ctrl + /` | 키보드 단축키 도움말 | 전역 (Phase 2) |

**Note:** Phase 1에서는 Enter, Shift+Enter만 구현. 나머지는 Phase 2 이후.

---

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | `640px` | 모바일 → 태블릿 |
| `md` | `768px` | 태블릿 → 데스크탑 |
| `lg` | `1024px` | 데스크탑 (기본) |
| `xl` | `1280px` | 큰 데스크탑 |
| `2xl` | `1536px` | 초대형 화면 |

**Note:** Phase 1-4는 데스크탑 우선. 모바일 반응형은 Out of Scope.

---

## Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | `0` | 기본 콘텐츠 |
| LNB | `10` | 좌측 내비게이션 바 |
| Chat Input | `20` | 하단 고정 Chat Input |
| Dropdown | `50` | 드롭다운 메뉴 |
| HITL Overlay | `100` | HITL 패널 뒤 오버레이 |
| HITL Panel | `110` | HITL 승인 패널 |
| Modal | `200` | 모달 다이얼로그 |
| Toast | `9999` | 최상단 알림 |

---

## References

- **Design Inspiration**: PilePeak.ai Light Mode
- **Shell & LNB**: Claude
- **Chat Layout**: Gemini
- **Portfolio**: PilePeak.ai
- **참조 이미지**: `references/img_references/`, `references/mockup_references/`
- **HTML 프로토타입**: `references/html_references/`

---

## Data Storage (Phase 1-2)

### Artifacts Storage

- **방식**: 프론트엔드 캐시 (LocalStorage)
- **용량**: 최대 5MB (브라우저 제한)
- **목적**: 시연자가 시연할 때마다 생성된 것만 저장
- **Phase 3 변경**: Backend DB로 영구 저장 전환

### Chat History Storage

- **방식**: SessionStorage (임시) + Backend API (Phase 3)
- **Phase 1-2**: SessionStorage만 사용 (탭 닫으면 사라짐)
- **Phase 3**: Backend DB 연동으로 영구 저장

### User Preferences

- **LNB 토글 상태**: LocalStorage (`lnb_collapsed`)
- **차트 타입 선택**: LocalStorage (`portfolio_chart_type`)
- **언어 설정**: LocalStorage (`language`)
- **테마 설정**: LocalStorage (`theme`) (Phase 2)

---

## Implementation Notes

- **CSS Variables**: `globals.css`에서 정의 후 Tailwind `theme.extend`에서 참조
- **Dark Mode**: `class` 전략 사용 (Tailwind `dark:` prefix)
- **Component Library**: Headless UI 또는 Radix UI 고려 (Phase 2)
- **Chart Library**: Recharts (기본 스타일 커스터마이징 필요)
- **SSE (Server-Sent Events)**: LangGraph 에이전트 활동 실시간 표시용 (Phase 1)

---

**Version History:**
- v1.0 (2025-10-21): 초안 작성 (PRD v3.0 기반, v2.0 세부사항 통합)
- v1.1 (2025-10-21): design지시.md 및 HTML 레퍼런스 반영 (Card padding 수정, Keyboard shortcuts 추가, Thinking 기본 상태 명시, Artifacts 저장 방식 추가)
