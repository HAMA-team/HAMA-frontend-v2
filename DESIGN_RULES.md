# HAMA Frontend - Design Rules

**Version:** 1.0

**Last Updated:** 2025-10-23

---

## 🎨 Color Hardcoding is STRICTLY FORBIDDEN

### ❌ NEVER DO THIS:

```tsx
// ❌ BAD: Hardcoded colors
<div style={{ backgroundColor: "#ffffff", color: "#171717" }}>
<div className="bg-[#f5f5f5] text-[#6b7280]">
<div style={{ borderColor: "#e5e7eb" }}>
```

### ✅ ALWAYS DO THIS:

```tsx
// ✅ GOOD: CSS variables
<div style={{ backgroundColor: "var(--container-background)", color: "var(--text-primary)" }}>
<div style={{ backgroundColor: "var(--main-background)", color: "var(--text-secondary)" }}>
<div style={{ borderColor: "var(--border-default)" }}>
```

---

## Why This Rule Exists

1. **Dark Mode Support**: Hardcoded colors break dark mode
2. **Consistency**: CSS variables ensure consistent colors across the app
3. **Maintainability**: Change colors in one place (globals.css)
4. **Accessibility**: Theme variables can adapt to user preferences

---

## Available CSS Variables

### Global Background
- `var(--app-background)` - 전체 앱 배경
- `var(--main-background)` - 메인 콘텐츠 영역 배경
- `var(--container-background)` - 카드, 패널 등 컨테이너 배경

### LNB (Left Navigation Bar)
- `var(--lnb-background)` - LNB 배경
- `var(--lnb-border)` - LNB 테두리
- `var(--lnb-text)` - LNB 텍스트 (기본)
- `var(--lnb-text-muted)` - LNB 텍스트 (비활성)
- `var(--lnb-active-bg)` - LNB Active 버튼 배경
- `var(--lnb-active-text)` - LNB Active 버튼 텍스트
- `var(--lnb-hover-bg)` - LNB Hover 배경
- `var(--lnb-divider)` - LNB 구분선
- `var(--lnb-recent-hover)` - 최근 채팅 항목 hover 배경

### Text Colors
- `var(--text-primary)` - 본문 텍스트 (기본)
- `var(--text-secondary)` - 보조 텍스트
- `var(--text-muted)` - 비활성 텍스트
- `var(--text-link)` - 링크 텍스트
- `var(--text-error)` - 에러 텍스트
- `var(--text-success)` - 성공 텍스트

### Border & Divider
- `var(--border-default)` - 기본 테두리
- `var(--border-emphasis)` - 강조 테두리
- `var(--border-input)` - Input 테두리
- `var(--border-input-focus)` - Input 테두리 (focus)
- `var(--border-card)` - 카드 테두리

### Primary Colors
- `var(--primary-50)` ~ `var(--primary-900)` - 파란색 스케일
- `var(--primary-500)` - 기본 Primary
- `var(--primary-600)` - Hover Primary

### Semantic Colors
- `var(--success-500)`, `var(--success-600)` - 성공 (초록색)
- `var(--error-500)`, `var(--error-600)` - 에러 (빨간색)
- `var(--warning-500)`, `var(--warning-600)` - 경고 (주황색)
- `var(--info-500)`, `var(--info-600)` - 정보 (파란색)

### Icon Background (제안 카드)
- `var(--icon-blue-bg)`, `var(--icon-blue-fg)`
- `var(--icon-green-bg)`, `var(--icon-green-fg)`
- `var(--icon-purple-bg)`, `var(--icon-purple-fg)`
- `var(--icon-orange-bg)`, `var(--icon-orange-fg)`
- `var(--icon-pink-bg)`, `var(--icon-pink-fg)`
- `var(--icon-red-bg)`, `var(--icon-red-fg)`

### Chart Colors (Portfolio)
- `var(--chart-blue)`, `var(--chart-green)`, `var(--chart-purple)`, etc.
- `var(--chart-profit)` - 수익 (초록색)
- `var(--chart-loss)` - 손실 (빨간색)

### Shadows
- `var(--shadow-xs)` ~ `var(--shadow-2xl)` - 그림자 스케일

---

## Exceptions

### When Hardcoding is Acceptable:

1. **External Library Constraints**: If a third-party library requires hex colors
2. **Temporary Mockups**: During prototyping (must be replaced before commit)
3. **Chart Data**: Dynamic data-driven colors (but use CSS variables when possible)

### Example:

```tsx
// ✅ OK: Recharts requires color array
const COLORS = [
  "var(--chart-blue)",  // Still use CSS variables when possible
  "var(--chart-green)",
  "var(--chart-purple)"
];

// ❌ NOT OK: Even for charts, don't hardcode
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];  // BAD
```

---

## Enforcement

### Pre-commit Checklist:
- [ ] No hex colors (#RRGGBB) in component files
- [ ] All inline styles use CSS variables
- [ ] All Tailwind arbitrary values use CSS variables
- [ ] Dark mode tested

### Code Review:
- Any PR with hardcoded colors will be **REJECTED**
- Use `grep -r "#[0-9a-f]\{6\}" src/components` to check

---

## Migration Guide

### If You Find Hardcoded Colors:

1. Identify the color purpose (background, text, border, etc.)
2. Find the matching CSS variable in `src/styles/globals.css`
3. Replace hardcoded value with CSS variable
4. Test in both light and dark modes

### Example Migration:

```tsx
// Before (❌ BAD)
<button style={{ backgroundColor: "#3b82f6", color: "#ffffff" }}>
  Click me
</button>

// After (✅ GOOD)
<button style={{ backgroundColor: "var(--primary-500)", color: "var(--lnb-active-text)" }}>
  Click me
</button>
```

---

## Adding New Colors

### If you need a new color:

1. **DO NOT** hardcode it in your component
2. Add it to `src/styles/globals.css` under `:root` and `.dark`
3. Use descriptive semantic names (e.g., `--button-primary-bg`, not `--blue-500`)
4. Document it in `docs/DesignSystem.md`

```css
/* globals.css */
:root {
  --button-danger-bg: #ef4444;
  --button-danger-hover: #dc2626;
}

.dark {
  --button-danger-bg: #f87171;
  --button-danger-hover: #ef4444;
}
```

---

## Summary

**🚫 NO HARDCODED COLORS**

**✅ ALWAYS USE CSS VARIABLES**

**🎨 IF IT'S A COLOR, IT BELONGS IN `globals.css`**

---

Questions? Check `docs/DesignSystem.md` for the full color system documentation.
