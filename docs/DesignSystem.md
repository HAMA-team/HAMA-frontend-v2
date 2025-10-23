# HAMA Frontend - Design System (Mockup-Based)

**Version:** 3.0 (Dark Mode Support + CSS Variables)

**Last Updated:** 2025-10-23

**Related:** PRD v3.0, TechnicalSpecification.md

**⚠️ IMPORTANT:** Read [DESIGN_RULES.md](../DESIGN_RULES.md) first - **NO HARDCODED COLORS ALLOWED**

---

## Overview

이 디자인 시스템은 **실제 mockup 이미지**를 정확히 분석하여 작성되었습니다.

**단위 사용 원칙:**
- **고정 요소** (LNB, HITL Panel, 아이콘): `px`
- **유연한 콘텐츠** (Chat, Portfolio): `max-width` + `%`
- **간격/폰트**: `rem` (사용자 설정 존중, 확장성)
- **레이아웃**: `flexbox` (반응형 준비)

**화면 크기 대응:**
- 최소: `1280px` (Desktop)
- 일반: `1440px` (여유 있는 간격)
- 큰 화면: `1920px+` (콘텐츠 max-width 증가)

### Design References (실제 사용)

- **LNB (Left Navigation Bar)**: Claude 사이드바 (라이트/다크 모드 지원)
- **Main Content Area**: 라이트 모드 배경 (`var(--main-background)`)
- **Chat Message Layout**: Gemini 스타일
- **Portfolio Charts**: PilePeak.ai 색상 팔레트 (`var(--chart-*)`)
- **HITL Panel**: Claude Artifacts 우측 패널

### Theme Support

- **Light Mode**: 기본 테마 (PilePeak.ai 스타일)
- **Dark Mode**: 완전 지원 (모든 CSS 변수가 자동 전환)
- **Toggle**: LNB 하단의 Sun/Moon 아이콘으로 전환
- **Persistence**: LocalStorage에 사용자 선택 저장

---

## 1. Color System

**⚠️ CRITICAL:** All colors MUST be used via CSS variables (`var(--variable-name)`). Never hardcode hex values in components.

### How to Use Colors

```tsx
// ✅ CORRECT
<div style={{ backgroundColor: "var(--container-background)", color: "var(--text-primary)" }}>

// ❌ WRONG - DO NOT DO THIS
<div style={{ backgroundColor: "#ffffff", color: "#171717" }}>
```

### 1.1 Global Background

**Usage:** `var(--app-background)`, `var(--main-background)`, `var(--container-background)`

| Variable | Light Mode | Dark Mode | Purpose |
|----------|------------|-----------|---------|
| `--app-background` | `#e5e5e5` | `#0a0a0a` | 전체 앱 배경 (LNB 외부) |
| `--main-background` | `#f5f5f5` | `#121212` | 메인 콘텐츠 영역 배경 |
| `--container-background` | `#ffffff` | `#1e1e1e` | 콘텐츠 컨테이너 배경 (카드, 패널) |

### 1.2 LNB (Left Navigation Bar)

**Usage:** `var(--lnb-background)`, `var(--lnb-text)`, etc.

| Variable | Light Mode | Dark Mode | Purpose |
|----------|------------|-----------|---------|
| `--lnb-background` | `#ffffff` | `#1a1a1a` | LNB 배경 |
| `--lnb-border` | `#e5e7eb` | `#27272a` | LNB 테두리 |
| `--lnb-text` | `#374151` | `#e5e5e5` | LNB 텍스트 (기본) |
| `--lnb-text-muted` | `#9ca3af` | `#71717a` | LNB 텍스트 (비활성) |
| `--lnb-active-bg` | `#3b82f6` | `#3b82f6` | LNB Active 버튼 배경 |
| `--lnb-active-text` | `#ffffff` | `#ffffff` | LNB Active 버튼 텍스트 |
| `--lnb-hover-bg` | `#f3f4f6` | `#27272a` | LNB Hover 배경 |
| `--lnb-divider` | `#e5e7eb` | `#27272a` | LNB 구분선 |
| `--lnb-recent-hover` | `#f9fafb` | `#27272a` | 최근 채팅 항목 hover 배경 |

### 1.3 Text Colors

**Usage:** `var(--text-primary)`, `var(--text-secondary)`, etc.

| Variable | Light Mode | Dark Mode | Purpose |
|----------|------------|-----------|---------|
| `--text-primary` | `#171717` | `#ededed` | 본문 텍스트 (기본) |
| `--text-secondary` | `#6b7280` | `#a1a1aa` | 보조 텍스트 |
| `--text-muted` | `#9ca3af` | `#71717a` | 비활성 텍스트 |
| `--text-link` | `#3b82f6` | `#60a5fa` | 링크 텍스트 |
| `--text-error` | `#ef4444` | `#f87171` | 에러 텍스트 |
| `--text-success` | `#10b981` | `#34d399` | 성공 텍스트 |

### 1.4 Border & Divider

**Usage:** `var(--border-default)`, `var(--border-input-focus)`, etc.

| Variable | Light Mode | Dark Mode | Purpose |
|----------|------------|-----------|---------|
| `--border-default` | `#e5e7eb` | `#27272a` | 기본 테두리 |
| `--border-emphasis` | `#d1d5db` | `#3f3f46` | 강조 테두리 |
| `--border-input` | `#d1d5db` | `#3f3f46` | Input 테두리 |
| `--border-input-focus` | `#3b82f6` | `#60a5fa` | Input 테두리 (focus) |
| `--border-card` | `#e5e7eb` | `#27272a` | 카드 테두리 |

/* 에러 텍스트 */
--text-error: #ef4444;

/* 성공 텍스트 */
--text-success: #10b981;
```

### 1.4 Border & Divider Colors

```css
/* 기본 테두리 */
--border-default: #e5e7eb;

/* 강조 테두리 */
--border-emphasis: #d1d5db;

/* Input 테두리 */
--border-input: #d1d5db;

/* Input 테두리 (focus) */
--border-input-focus: #3b82f6;

/* 카드 테두리 */
--border-card: #e5e7eb;
```

### 1.5 Primary Colors

```css
/* Primary (파란색) */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* 기본 */
--primary-600: #2563eb;  /* hover */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### 1.6 Semantic Colors

```css
/* Success (초록색) */
--success-50: #d1fae5;
--success-500: #10b981;
--success-600: #059669;

/* Error (빨간색) */
--error-50: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Warning (주황색) */
--warning-50: #fef3c7;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Info (파란색) */
--info-50: #dbeafe;
--info-500: #3b82f6;
--info-600: #2563eb;
```

### 1.7 Icon Background Colors (제안 카드)

```css
/* 아이콘 컨테이너 배경 색상 */
--icon-blue-bg: #dbeafe;
--icon-blue-fg: #3b82f6;

--icon-green-bg: #d1fae5;
--icon-green-fg: #10b981;

--icon-purple-bg: #ede9fe;
--icon-purple-fg: #8b5cf6;

--icon-orange-bg: #fed7aa;
--icon-orange-fg: #f59e0b;

--icon-pink-bg: #fce7f3;
--icon-pink-fg: #ec4899;

--icon-red-bg: #fee2e2;
--icon-red-fg: #ef4444;
```

### 1.8 Chart Colors (Portfolio)

```css
/* 트리맵/차트 색상 (PilePeak.ai 스타일) */
--chart-blue: #3b82f6;
--chart-green: #10b981;
--chart-purple: #8b5cf6;
--chart-orange: #f59e0b;
--chart-pink: #ec4899;
--chart-indigo: #6366f1;
--chart-cyan: #06b6d4;
--chart-yellow: #eab308;

/* 수익률 색상 */
--chart-profit: #10b981;   /* 양수 */
--chart-loss: #ef4444;     /* 음수 */
```

---

## 2. Typography

### 2.1 Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

### 2.2 Font Scale (rem 기반)

**Base Size:** `16px` (브라우저 기본값)

| Name | Size (rem) | Size (px) | Weight | Line Height | Letter Spacing | Usage |
|------|-----------|-----------|--------|-------------|----------------|-------|
| `display` | `2rem` | `32px` | `700` (Bold) | `1.25` | `-0.02em` | 페이지 대제목 "안녕하세요!" |
| `h1` | `1.75rem` | `28px` | `700` (Bold) | `1.29` | `-0.02em` | 섹션 제목 "포트폴리오" |
| `h2` | `1.5rem` | `24px` | `700` (Bold) | `1.33` | `-0.02em` | 서브섹션 제목 |
| `h3` | `1.25rem` | `20px` | `600` (Semibold) | `1.4` | `-0.01em` | 카드 제목 |
| `h4` | `1.125rem` | `18px` | `600` (Semibold) | `1.33` | `-0.01em` | 작은 제목 |
| `body-lg` | `1rem` | `16px` | `400` (Regular) | `1.5` | `0` | 본문 강조 |
| `body` | `0.9375rem` | `15px` | `400` (Regular) | `1.47` | `0` | 본문 기본 |
| `body-sm` | `0.875rem` | `14px` | `400` (Regular) | `1.43` | `0` | 보조 텍스트 |
| `caption` | `0.8125rem` | `13px` | `400` (Regular) | `1.38` | `0` | 캡션 (날짜 등) |
| `caption-xs` | `0.75rem` | `12px` | `400` (Regular) | `1.33` | `0` | 아주 작은 텍스트 |

### 2.3 Font Weight Usage

```css
/* 제목에만 Bold 사용 */
.page-title {
  font-size: 2rem; /* 32px */
  font-weight: 700; /* Bold */
  line-height: 1.25;
  letter-spacing: -0.02em;
}

/* 카드 제목, 버튼은 Semibold */
.card-title, .button {
  font-size: 1rem; /* 16px */
  font-weight: 600; /* Semibold */
  line-height: 1.5;
}

/* 본문, 설명은 Regular */
.body-text, .description {
  font-size: 0.9375rem; /* 15px */
  font-weight: 400; /* Regular */
  line-height: 1.47;
}

/* 보조 텍스트 */
.secondary-text {
  font-size: 0.875rem; /* 14px */
  color: #6b7280;
  font-weight: 400;
  line-height: 1.43;
}
```

---

## 3. Spacing System

**8px (0.5rem) 기반 그리드 시스템** 사용.

| Token | Value (rem) | Value (px) | Usage |
|-------|------------|-----------|-------|
| `spacing-1` | `0.25rem` | `4px` | 아이콘과 텍스트 간격 |
| `spacing-2` | `0.5rem` | `8px` | 밀집된 요소 간격 |
| `spacing-3` | `0.75rem` | `12px` | 작은 패딩 |
| `spacing-4` | `1rem` | `16px` | 기본 패딩 |
| `spacing-5` | `1.25rem` | `20px` | 중간 패딩 |
| `spacing-6` | `1.5rem` | `24px` | 큰 패딩 |
| `spacing-8` | `2rem` | `32px` | 섹션 간격 |
| `spacing-10` | `2.5rem` | `40px` | 큰 섹션 간격 |
| `spacing-12` | `3rem` | `48px` | 페이지 여백 |

### 3.1 Component-Specific Spacing

```css
/* LNB */
.lnb {
  padding: 1rem 0.75rem; /* 16px 12px */
}

.lnb-item {
  padding: 0.625rem 0.75rem; /* 10px 12px */
  margin-bottom: 0.25rem; /* 4px */
}

.lnb-recent-item {
  padding: 0.5rem 0.75rem; /* 8px 12px */
  margin-bottom: 0.125rem; /* 2px */
}

/* 카드 */
.suggestion-card {
  padding: 1.25rem; /* 20px */
}

.artifact-card {
  padding: 1.25rem; /* 20px */
}

/* Chat Input */
.chat-input {
  padding: 0.875rem 3.25rem 0.875rem 1.25rem; /* 14px 52px 14px 20px */
}

/* HITL Panel */
.hitl-panel {
  padding: 2rem 1.5rem; /* 32px 24px */
}

/* Portfolio Summary Cards */
.portfolio-summary-card {
  padding: 1.25rem; /* 20px */
}
```

---

## 4. Layout Dimensions

### 4.1 Global Shell (Flexbox Layout)

```css
/* ===== Shell (전체 레이아웃) ===== */

.shell {
  display: flex;
  height: 100vh;
  min-width: 1280px; /* 최소 화면 너비 */
  background: var(--app-background);
}

/* ===== LNB (고정 너비) ===== */

.lnb {
  width: 260px; /* 고정 - 내비게이션 일관성 */
  flex-shrink: 0;
  height: 100vh;
  background: var(--lnb-background);
  border-right: 1px solid var(--lnb-border);
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
}

.lnb.collapsed {
  width: 60px; /* Phase 2+ */
}

/* ===== Main Content (유연) ===== */

.main-content {
  flex: 1; /* 남은 공간 모두 사용 */
  margin-left: 260px; /* LNB 너비만큼 밀어냄 */
  padding: 2rem; /* 32px */
  background: var(--main-background);
  min-height: 100vh;
  overflow-y: auto;
}

.main-content.lnb-collapsed {
  margin-left: 60px;
}

/* HITL 열렸을 때 */
.main-content.hitl-open {
  margin-right: 420px; /* HITL Panel 너비 */
}
```

### 4.2 Content Max Width (화면 크기별)

```css
/* ===== Chat Container ===== */

.chat-container {
  max-width: 800px; /* 기본 (1280px~1919px) */
  width: 100%;
  margin: 0 auto;
  background: var(--container-background);
  border-radius: 1rem; /* 16px */
  padding: 2rem; /* 32px */
}

/* 큰 화면 (1920px+) */
@media (min-width: 1920px) {
  .chat-container {
    max-width: 1000px; /* 더 여유롭게 */
  }
}

/* ===== Portfolio Container ===== */

.portfolio-container {
  max-width: 1200px; /* 기본 */
  width: 100%;
  margin: 0 auto;
  padding: 2rem; /* 32px */
}

@media (min-width: 1920px) {
  .portfolio-container {
    max-width: 1400px; /* 차트 더 크게 */
  }
}

/* ===== Artifacts Grid ===== */

.artifacts-grid {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem; /* 20px */
  padding: 2rem;
}

@media (min-width: 1920px) {
  .artifacts-grid {
    max-width: 1400px;
    gap: 1.5rem; /* 24px */
  }
}

/* ===== Artifact Detail ===== */

.artifact-detail {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  background: var(--container-background);
  border-radius: 1rem;
  padding: 2rem;
}

@media (min-width: 1920px) {
  .artifact-detail {
    max-width: 1000px;
  }
}

/* ===== My Page ===== */

.mypage-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}
```

### 4.3 HITL Panel (고정 너비)

```css
.hitl-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px; /* 고정 - 읽기 편한 너비 유지 */
  height: 100vh;
  background: var(--container-background);
  border-left: 1px solid var(--border-default);
  overflow-y: auto;
  z-index: 50;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);

  /* 슬라이드 애니메이션 */
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(0.645, 0.045, 0.355, 1.000);
}

.hitl-panel.open {
  transform: translateX(0);
}
```

### 4.4 Persistent Chat Input (유연)

```css
.persistent-chat-input {
  position: fixed;
  bottom: 2rem; /* 32px */
  left: calc(260px + 2rem); /* LNB + 패딩 */
  right: 2rem;
  max-width: 800px; /* 기본 */
  width: auto;
  margin: 0 auto;
  z-index: 20;
}

/* 큰 화면에서 */
@media (min-width: 1920px) {
  .persistent-chat-input {
    max-width: 1000px; /* Chat 컨테이너와 동일 */
  }
}

/* LNB 접힌 상태 */
.persistent-chat-input.lnb-collapsed {
  left: calc(60px + 2rem);
}

/* HITL 열렸을 때 */
.persistent-chat-input.hitl-open {
  right: calc(420px + 2rem);
}
```

---

## 5. Border Radius

| Token | Value (rem) | Value (px) | Usage |
|-------|------------|-----------|-------|
| `radius-sm` | `0.375rem` | `6px` | 작은 버튼, Badge |
| `radius-md` | `0.5rem` | `8px` | 버튼, Input |
| `radius-lg` | `0.75rem` | `12px` | 카드 |
| `radius-xl` | `1rem` | `16px` | 큰 컨테이너, Chat 컨테이너 |
| `radius-2xl` | `1.5rem` | `24px` | Chat Input (둥근 입력창) |
| `radius-full` | `9999px` | `9999px` | 원형 아이콘 버튼, 아바타 |

### 5.1 Component-Specific Radius

```css
/* 제안 카드 */
.suggestion-card {
  border-radius: 0.75rem; /* 12px */
}

/* 아이콘 컨테이너 */
.icon-container {
  border-radius: 0.5rem; /* 8px */
  width: 40px; /* 고정 */
  height: 40px; /* 고정 */
}

/* Chat Input */
.chat-input {
  border-radius: 1.5rem; /* 24px - 둥글게 */
}

/* 버튼 */
.button-primary, .button-secondary {
  border-radius: 0.5rem; /* 8px */
}

/* 카드 */
.card {
  border-radius: 0.75rem; /* 12px */
}

/* Chat 컨테이너 */
.chat-container {
  border-radius: 1rem; /* 16px */
}
```

---

## 6. Shadows

### 6.1 Elevation Levels

```css
/* 없음 */
--shadow-none: none;

/* 아주 subtle */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

/* 카드 기본 */
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

/* 카드 hover */
--shadow-md: 0 2px 8px 0 rgba(0, 0, 0, 0.08);

/* Chat Input */
--shadow-lg: 0 4px 12px 0 rgba(0, 0, 0, 0.08);

/* HITL Panel */
--shadow-xl: -2px 0 8px 0 rgba(0, 0, 0, 0.08);

/* 모달 */
--shadow-2xl: 0 8px 24px 0 rgba(0, 0, 0, 0.12);
```

### 6.2 Component Shadows

```css
/* 제안 카드 */
.suggestion-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.suggestion-card:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}

/* Chat Input */
.chat-input {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
}

.chat-input:focus-within {
  box-shadow: 0 4px 16px 0 rgba(59, 130, 246, 0.15);
}

/* HITL Panel */
.hitl-panel {
  box-shadow: -2px 0 8px 0 rgba(0, 0, 0, 0.08);
}

/* Artifact 카드 */
.artifact-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.artifact-card:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}
```

---

## 7. Buttons

### 7.1 Primary Button

```css
.button-primary {
  background: #3b82f6;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}

.button-primary:hover {
  background: #2563eb;
}

.button-primary:active {
  background: #1d4ed8;
}

.button-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
```

### 7.2 Secondary Button

```css
.button-secondary {
  background: transparent;
  color: #171717;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 150ms ease;
}

.button-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.button-secondary:active {
  background: #f3f4f6;
}
```

### 7.3 Destructive Button

```css
.button-destructive {
  background: #ef4444;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}

.button-destructive:hover {
  background: #dc2626;
}
```

### 7.4 LNB Active Button (새 채팅)

```css
.button-lnb-active {
  background: #3b82f6;
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 150ms ease;
}

.button-lnb-active:hover {
  background: #2563eb;
}
```

### 7.5 Button Sizes

```css
/* Small */
.button-sm {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
}

/* Medium (기본) */
.button-md {
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 8px;
}

/* Large */
.button-lg {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
}
```

---

## 8. Forms & Inputs

### 8.1 Chat Input (Persistent)

```css
.chat-input-container {
  position: fixed;
  bottom: 32px;
  left: calc(260px + 32px);
  right: 32px;
  max-width: 800px;
  margin: 0 auto;
  z-index: 20;
}

.chat-input {
  width: 100%;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  padding: 14px 52px 14px 20px; /* 우측 전송버튼 공간 */
  font-size: 15px;
  line-height: 22px;
  font-family: inherit;
  resize: none;
  min-height: 50px;
  max-height: 200px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 150ms ease;
}

.chat-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 4px 16px 0 rgba(59, 130, 246, 0.15);
}

.chat-input::placeholder {
  color: #9ca3af;
}

/* 전송 버튼 */
.chat-input-send {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease;
}

.chat-input-send:hover {
  background: #2563eb;
}

.chat-input-send:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
```

### 8.2 Standard Input

```css
.input {
  width: 100%;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 15px;
  line-height: 22px;
  font-family: inherit;
  transition: border-color 150ms ease;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.input::placeholder {
  color: #9ca3af;
}

.input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* 에러 상태 */
.input.error {
  border-color: #ef4444;
}
```

### 8.3 Search Input

```css
.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 14px 10px 40px; /* 좌측 아이콘 공간 */
  font-size: 15px;
  line-height: 22px;
  transition: border-color 150ms ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 20px;
  height: 20px;
}
```

---

## 9. Cards

### 9.1 Suggestion Card (시작 제안 카드)

```css
.suggestion-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.suggestion-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}

.suggestion-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.suggestion-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 6px;
}

.suggestion-card-description {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  line-height: 20px;
}
```

### 9.2 Artifact Card

```css
.artifact-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.artifact-card:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}

.artifact-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.artifact-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 4px;
}

.artifact-card-preview {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  line-height: 20px;
  margin-bottom: 8px;
  /* 3줄 말줄임 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.artifact-card-date {
  font-size: 13px;
  font-weight: 400;
  color: #9ca3af;
}
```

### 9.3 Portfolio Summary Card

```css
.portfolio-summary-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.portfolio-summary-label {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 8px;
}

.portfolio-summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #171717;
  letter-spacing: -0.02em;
}

.portfolio-summary-change {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.portfolio-summary-change.positive {
  color: #10b981;
}

.portfolio-summary-change.negative {
  color: #ef4444;
}
```

---

## 10. LNB (Left Navigation Bar)

### 10.1 LNB Container

```css
.lnb {
  width: 260px;
  height: 100vh;
  background: #1f1f1f;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
}

.lnb.collapsed {
  width: 60px;
}
```

### 10.2 LNB Header

```css
.lnb-header {
  padding: 16px 12px;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lnb-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lnb-logo-icon {
  width: 28px;
  height: 28px;
  background: #3b82f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.lnb-logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #e5e5e5;
}

.lnb-toggle {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 150ms ease;
}

.lnb-toggle:hover {
  color: #e5e5e5;
}
```

### 10.3 LNB Navigation

```css
.lnb-nav {
  padding: 16px 12px;
  border-bottom: 1px solid #2a2a2a;
}

.lnb-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  color: #e5e5e5;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: background 150ms ease;
}

.lnb-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.lnb-nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-weight: 500;
}

.lnb-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
```

### 10.4 LNB Recent Chats

```css
.lnb-recent {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.lnb-recent-title {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 12px;
  padding: 0 12px;
}

.lnb-recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 2px;
  border-radius: 6px;
  color: #e5e5e5;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background 150ms ease;
}

.lnb-recent-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.lnb-recent-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.lnb-recent-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lnb-recent-time {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}
```

### 10.5 LNB Footer (User)

```css
.lnb-footer {
  padding: 16px 12px;
  border-top: 1px solid #2a2a2a;
}

.lnb-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms ease;
}

.lnb-user:hover {
  background: rgba(255, 255, 255, 0.05);
}

.lnb-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.lnb-user-info {
  flex: 1;
  overflow: hidden;
}

.lnb-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #e5e5e5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lnb-user-status {
  font-size: 12px;
  color: #9ca3af;
}
```

---

## 11. Chat Messages

### 11.1 User Message (우측 정렬)

```css
.chat-message-user {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.chat-message-user-content {
  max-width: 70%;
  background: transparent;
  color: #171717;
  font-size: 15px;
  line-height: 22px;
  padding: 0;
  text-align: right;
}
```

**중요:** Mockup에서 사용자 메시지는 **말풍선이 없고**, 그냥 우측 정렬된 텍스트입니다!

### 11.2 AI Message (전체 너비)

```css
.chat-message-ai {
  margin-bottom: 32px;
  width: 100%;
}

.chat-message-ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.chat-message-ai-avatar {
  width: 28px;
  height: 28px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.chat-message-ai-name {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
}

.chat-message-ai-content {
  padding: 0;
  font-size: 15px;
  line-height: 24px;
  color: #171717;
}

/* Markdown 스타일 */
.chat-message-ai-content h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.chat-message-ai-content h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.chat-message-ai-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.chat-message-ai-content p {
  margin-bottom: 16px;
}

.chat-message-ai-content ul, .chat-message-ai-content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.chat-message-ai-content li {
  margin-bottom: 8px;
}

.chat-message-ai-content code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.chat-message-ai-content pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.chat-message-ai-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}
```

### 11.3 Thinking Section (접기/펼치기)

```css
.thinking-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.thinking-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.thinking-header:hover {
  background: #f3f4f6;
}

.thinking-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.thinking-icon {
  width: 16px;
  height: 16px;
  transition: transform 200ms ease;
}

.thinking-icon.expanded {
  transform: rotate(180deg);
}

.thinking-content {
  padding: 0 16px 16px 16px;
  display: none;
}

.thinking-content.expanded {
  display: block;
}

.thinking-step {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.thinking-step:last-child {
  border-bottom: none;
}

.thinking-step-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.thinking-step-content {
  flex: 1;
}

.thinking-step-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 2px;
}

.thinking-step-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 18px;
}

.thinking-step-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
```

---

## 12. HITL Panel

### 12.1 Panel Container

```css
.hitl-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
  z-index: 50;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);

  /* 슬라이드 애니메이션 */
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(0.645, 0.045, 0.355, 1.000);
}

.hitl-panel.open {
  transform: translateX(0);
}
```

### 12.2 Panel Header

```css
.hitl-panel-header {
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.hitl-panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #171717;
  margin-bottom: 4px;
}

.hitl-panel-subtitle {
  font-size: 14px;
  color: #6b7280;
}
```

### 12.3 Panel Content

```css
.hitl-panel-content {
  padding: 24px;
}

.hitl-section {
  margin-bottom: 32px;
}

.hitl-section:last-child {
  margin-bottom: 0;
}

.hitl-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 12px;
}

.hitl-info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.hitl-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hitl-info-row:last-child {
  margin-bottom: 0;
}

.hitl-info-label {
  font-size: 14px;
  color: #6b7280;
}

.hitl-info-value {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
}

.hitl-info-value.highlight {
  color: #3b82f6;
}
```

### 12.4 Risk Warning

```css
.hitl-risk-warning {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.hitl-risk-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
}

.hitl-risk-icon {
  width: 16px;
  height: 16px;
}

.hitl-risk-text {
  font-size: 13px;
  color: #92400e;
  line-height: 18px;
}
```

### 12.5 Panel Actions

```css
.hitl-panel-actions {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: #ffffff;
}

.hitl-panel-actions .button-primary,
.hitl-panel-actions .button-secondary {
  flex: 1;
}
```

---

## 13. Icons

### 13.1 Icon Standards

```css
/* Lucide React 사용 */
/* strokeWidth: 1.5 */

/* 크기 */
--icon-xs: 14px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 28px;
--icon-2xl: 32px;
```

### 13.2 Icon Usage

| Context | Icon | Size | Color |
|---------|------|------|-------|
| LNB 메뉴 | MessageSquare, Archive, etc. | 20px | #e5e5e5 |
| LNB Active | Same | 20px | #ffffff |
| Chat Input 전송 | Send | 16px | #ffffff |
| HITL 경고 | AlertTriangle | 16px | #f59e0b |
| Thinking 아이콘 | ChevronDown/Up | 16px | #6b7280 |
| 제안 카드 아이콘 | Custom | 20px | 색상별 |
| Empty State 아이콘 | Custom | 32px | #3b82f6 |

---

## 14. Animations

### 14.1 Timing Functions

```css
/* 기본 easing */
--ease-out: cubic-bezier(0.215, 0.610, 0.355, 1.000);

/* 모달/패널 */
--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1.000);

/* 강조 애니메이션 */
--ease-out-expo: cubic-bezier(0.190, 1.000, 0.220, 1.000);
```

### 14.2 Duration Standards

| Action | Duration | Easing |
|--------|----------|--------|
| Button hover | `150ms` | ease-out |
| Link hover | `100ms` | ease-out |
| HITL Panel slide in | `300ms` | ease-in-out |
| HITL Panel slide out | `200ms` | ease-in-out |
| Thinking toggle | `200ms` | ease-out |
| Chart transition | `500ms` | ease-out-expo |
| Toast fade in | `200ms` | ease-out |
| Toast fade out | `150ms` | ease-out |

### 14.3 HITL Panel Animation

```css
@keyframes hitl-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.hitl-panel.open {
  animation: hitl-slide-in 300ms cubic-bezier(0.645, 0.045, 0.355, 1.000);
}
```

### 14.4 Thinking Accordion

```css
.thinking-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
}

.thinking-content.expanded {
  max-height: 1000px;
}

.thinking-icon {
  transition: transform 200ms ease-out;
}

.thinking-icon.expanded {
  transform: rotate(180deg);
}
```

---

## 15. Loading States

### 15.1 Loading Spinner

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1000ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 15.2 Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: loading 1500ms ease-in-out infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 16. Empty States

### 16.1 Empty State Container

```css
.empty-state {
  text-align: center;
  padding: 64px 24px;
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #9ca3af;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 24px;
}
```

---

## 17. Toast Notifications

### 17.1 Toast Container

```css
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

### 17.2 Toast Types

```css
.toast {
  min-width: 300px;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: toast-in 200ms ease-out;
}

@keyframes toast-in {
  from {
    transform: translateY(-16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast-success {
  border-left: 3px solid #10b981;
}

.toast-error {
  border-left: 3px solid #ef4444;
}

.toast-warning {
  border-left: 3px solid #f59e0b;
}

.toast-info {
  border-left: 3px solid #3b82f6;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 18px;
}
```

---

## 18. Z-Index Scale

```css
/* 레이어 순서 */
--z-base: 0;
--z-lnb: 10;
--z-chat-input: 20;
--z-dropdown: 30;
--z-hitl-panel: 50;
--z-modal: 100;
--z-toast: 9999;
```

---

## 19. Responsive (Phase 4+)

Phase 1-3은 데스크탑만 지원. 모바일 반응형은 Out of Scope.

최소 화면 너비: `1280px`

---

## 20. Implementation Notes

### 20.1 CSS Variables (globals.css)

```css
:root {
  /* Colors */
  --app-background: #e5e5e5;
  --main-background: #f5f5f5;
  --container-background: #ffffff;

  --lnb-background: #ffffff;
  --lnb-border: #e5e7eb;
  --lnb-text: #374151;
  --lnb-text-muted: #9ca3af;
  --lnb-active-bg: #e5e7eb;
  --lnb-active-text: #171717;
  --lnb-hover-bg: #f3f4f6;

  --text-primary: #171717;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;

  --border-default: #e5e7eb;
  --border-input: #d1d5db;

  --primary-500: #3b82f6;
  --primary-600: #2563eb;

  --success-500: #10b981;
  --error-500: #ef4444;
  --warning-500: #f59e0b;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;

  /* Layout */
  --lnb-width: 260px;
  --hitl-width: 420px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 12px 0 rgba(0, 0, 0, 0.08);

  /* Z-Index */
  --z-lnb: 10;
  --z-chat-input: 20;
  --z-hitl-panel: 50;
  --z-toast: 9999;
}
```

### 20.2 Tailwind CSS v4 주의사항

**⚠️ IMPORTANT: Tailwind CSS v4 Breaking Changes**

Tailwind CSS v4에서는 CSS 변수를 Tailwind 클래스로 직접 사용할 수 없습니다.

**문제:**
```tsx
// ❌ 작동하지 않음
<div className="bg-[var(--lnb-background)]">
```

**해결책:**
```tsx
// ✅ inline style 사용
<div style={{ backgroundColor: "#ffffff" }}>

// ✅ 또는 Tailwind 기본 클래스 사용
<div className="bg-white">
```

**적용 예시 (LNB.tsx):**
- 배경색: `style={{ backgroundColor: "#3b82f6" }}` 또는 `className="bg-white"`
- 텍스트 색상: `style={{ color: "#171717" }}` 또는 `className="text-neutral-900"`
- 테두리: `className="border-[#e5e7eb]"`

### 20.3 Tailwind Config Extension

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'lnb-bg': '#ffffff',        // Light theme
        'lnb-border': '#e5e7eb',
        'lnb-text': '#374151',
        'lnb-active': '#e5e7eb',
        'main-bg': '#f5f5f5',
        'container-bg': '#ffffff',
      },
      spacing: {
        'lnb': '260px',
        'hitl': '420px',
      },
    },
  },
};
```

---

## 21. Component Library

- **Headless UI**: Dropdown, Modal, Tabs 등
- **Radix UI**: 고급 컴포넌트 (Phase 2+)
- **Recharts**: 차트 라이브러리
- **react-markdown**: Markdown 렌더링

---

## 22. Mockup References

모든 디자인은 다음 mockup 이미지를 정확히 따릅니다:

1. `시작 제안 카드뷰.png` - Empty State, 제안 카드 디자인
2. `대화 기록 뷰.png` - Chat 메시지 레이아웃
3. `AI 생각 과정 뷰.png` - Thinking 섹션
4. `HITL 승인 패널.png` - HITL Panel 디자인
5. `Portfolio.png` - Portfolio 차트 색상
6. `아티팩트 목록 그리드 뷰.png` - Artifact 카드 그리드
7. `아티팩트 본문 뷰.png` - Artifact 상세 뷰
8. `My Page.png` - My Page 레이아웃
9. `Chat History.png` - Chat History 리스트

그리고 참조 이미지들:
- `Claude 챗 시작화면(LNB 열린상태).png` - LNB 다크 테마
- `Gemini 챗 도중..png` - Chat 메시지 레이아웃
- `PilePeak 포트폴리오페이지.png` - Portfolio 차트 색상
- `Claude chat화면에서 Canvas 열린상태.png` - HITL Panel 구조

---

**Version History:**
- v2.1 (2025-10-21): **Fluid Layout + rem 단위 적용**. 다양한 데스크탑 화면 크기 대응. Flexbox 레이아웃, 1920px+ 미디어 쿼리 추가.
- v2.0 (2025-10-21): Mockup 이미지 기반 완전 재작성. 모든 색상, 간격, 크기를 픽셀 단위로 정확히 분석.
- v1.1 (2025-10-21): 이전 버전 (부정확)
- v1.0 (2025-10-21): 초안 (부정확)
