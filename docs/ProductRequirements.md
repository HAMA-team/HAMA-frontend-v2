# HAMA Frontend - Product Requirements Document (PRD)

**Version:** 3.0 (Improved)

**Last Updated:** 2025-10-20

**Status:** MVP Development

**Purpose:** 캡스톤 프로젝트 시연용 Human-in-the-Loop AI 투자 시스템

---

## 📋 Document Structure

|문서|내용|위치|
|---|---|---|
|**ProductRequirements.md** (본 문서)|무엇을, 왜 만드는가|`docs/`|
|**TechnicalSpecification.md**|어떻게 구현하는가 (컴포넌트, API 연동)|`docs/`|
|**InformationArchitecture.md**|정보구조|`docs/`|
|**Userflow.md**|유저 플로우|`docs/`|
|**DesignSystem.md**|디자인 시스템 (색상, 타이포, 아이콘)|`docs/`|
|**ErrorHandling.md**|에러 처리 시나리오 및 복구 전략|`docs/`|

---

## 1. Executive Summary

### 1.1 제품 비전

**HAMA는 AI가 투자 제안을 하되, 사용자가 최종 결정권을 갖는 Human-in-the-Loop 투자 시스템입니다.**

**핵심 가치:**

- AI와 대화하며 투자 정보를 얻습니다
- 중요한 매매 시점에 반드시 사용자가 승인합니다
- 복잡한 분석 결과를 직관적으로 시각화합니다

### 1.2 시연 컨텍스트 (Demo Context)

**목표:** 캡스톤 발표회 부스에서 5-7분 내 HITL 시스템의 핵심 가치 전달

**핵심 시연 플로우:**

1. AI와 대화하며 종목 분석 (3분)
2. AI의 매매 제안을 검토하고 승인 (1-2분)
3. 포트폴리오 시각화 확인 (1분)

### 1.3 핵심 설계 원칙

1. **Chat First** - 모든 기능이 대화로 시작됩니다
2. **HITL Mandatory** - 매매 승인은 필수이며, 건너뛸 수 없습니다
3. **Transparency** - AI의 사고 과정을 실시간으로 보여줍니다
4. **Visual Priority** - 포트폴리오는 즉시 시각화되어야 합니다

---

## 2. Information Architecture (IA)

### 2.1 전체 구조

```
HAMA Application
│
├─ 온보딩 플로우 (Phase 3)
│   └─ 투자 성향 분석 (4단계 질문)
│
├─ 메인 플로우
│   ├─ Chat 페이지 (Phase 1) ⭐
│   │   ├─ Empty State (제안 카드)
│   │   ├─ 메시지 뷰
│   │   ├─ Thinking 뷰 (접기/펼치기)
│   │   └─ Artifact 저장 액션
│   │
│   ├─ HITL 승인 패널 (Phase 1) ⭐
│   │   ├─ 주문 정보
│   │   ├─ 리스크 경고
│   │   └─ 승인/거부 버튼
│   │
│   ├─ Portfolio 페이지 (Phase 1-2)
│   │   ├─ 포트폴리오 개요 (Phase 1)
│   │   └─ 차트 시각화 (Phase 1 → 우선순위 상향) ⭐
│   │       ├─ 트리맵
│   │       ├─ 원 그래프
│   │       └─ 막대 그래프
│   │
│   ├─ Artifacts 페이지 (Phase 3)
│   │   ├─ 목록 그리드
│   │   └─ 상세 뷰
│   │
│   └─ Discover 페이지 (Phase 4)
│       └─ 뉴스 피드
│
└─ 설정 플로우
    └─ My Page (Phase 2)
        ├─ 자동화 레벨 설정
        ├─ 투자 성향 프로필 (Phase 3)
        └─ 다크모드/언어 설정

```

### 2.2 용어 정의

- **플로우 (Flow)**: 사용자의 목표 달성을 위한 일련의 페이지 흐름
- **페이지 (Page)**: 독립적인 URL을 가진 화면
- **패널 (Panel)**: 페이지 위에 오버레이되는 사이드/모달 컴포넌트
- **뷰 (View)**: 페이지 내부의 상태별 화면

---

## 3. User Stories & Requirements

### 우선순위 정의

|우선순위|의미|시기|
|---|---|---|
|**P0 (Critical)**|없으면 시연 불가|Phase 1|
|**P1 (High)**|시연 품질에 직접 영향|Phase 1-2|
|**P2 (Medium)**|완성도 향상|Phase 3|
|**P3 (Low)**|부가 기능|Phase 4+|

---

## US-1. Chat Interface (대화 인터페이스)

**Priority: P0 (Critical)**

### US-1.1 기본 대화

**As a** 투자자,

**I want to** AI와 자연스럽게 대화하며 투자 정보를 얻고 싶습니다,

**So that** 복잡한 메뉴 탐색 없이 원하는 정보에 빠르게 접근할 수 있습니다.

**Acceptance Criteria:**

- [x] 사용자 메시지와 AI 답변이 구분되어 표시됩니다
- [x] AI 답변은 Markdown 형식(헤딩, 리스트, 테이블, 코드블록)을 지원합니다
- [x] 메시지 전송 중 로딩 상태가 표시됩니다
- [x] AI 응답 대기 중 "생각하는 중..." 애니메이션이 표시됩니다

**User Flow:**

```
[Empty State: 제안 카드 4개 표시]
  ↓
[사용자: 제안 카드 클릭 또는 직접 입력]
  ↓
[메시지 전송 → 로딩 스피너]
  ↓
[AI 답변 표시 (Markdown 렌더링)]

```

**References:**

- UI 참조: Gemini (사용자 말풍선, AI 전체너비)
- Mockup: `references/mockup_references/대화 기록 뷰.png`

---

### US-1.2 AI 사고 과정 표시

**As a** 사용자,

**I want to** AI가 어떤 과정을 거쳐 답변했는지 보고 싶습니다,

**So that** AI의 추론 과정을 신뢰하고 이해할 수 있습니다.

**Acceptance Criteria:**

- [x] AI 답변 내부에 Thinking 섹션이 포함됩니다 (Claude 스타일)
- [x] Thinking은 기본적으로 접혀 있으며, 클릭하면 펼쳐집니다
- [x] 에이전트 단계별로 아이콘과 설명이 표시됩니다:
    - `planner` → 📋 "계획 수립 중..."
    - `researcher` → 🔍 "데이터 수집 중..."
    - `strategy` → 💡 "전략 분석 중..."
- [ ] 실시간 스트리밍으로 진행 상황이 업데이트됩니다 (Phase 1에서 API 연동 후)

**Why Critical:**

- 발표회 시연의 핵심: AI가 블랙박스가 아님을 보여줍니다
- HITL 시스템의 신뢰성을 입증하는 핵심 요소입니다

**References:**

- Mockup: `references/mockup_references/AI 생각 과정 뷰.png`

---

### US-1.3 Artifact 저장

**As a** 사용자,

**I want to** 중요한 AI 답변을 저장하고 싶습니다,

**So that** 나중에 다시 확인하거나 추가 질문을 할 수 있습니다.

**Acceptance Criteria:**

- [x] 모든 AI 답변 하단에 "Save as Artifact" 버튼이 표시됩니다
- [x] 버튼 옆에 "Copy" 버튼도 표시됩니다
- [x] 버튼 클릭 시 저장 성공 토스트가 표시됩니다 (3초)
- [x] 토스트에 "Artifacts 페이지에서 보기" 링크가 포함됩니다
- [x] 저장 후 버튼 상태가 "저장됨"으로 변경됩니다 (초록색, 체크 아이콘)
- [x] 저장 상태가 LocalStorage에 영구 보관됩니다

**Storage (Phase 1):**

- LocalStorage 또는 IndexedDB 사용
- Phase 3에서 Backend 연동 고려

---

### US-1.4 Persistent Chat Input

**Priority: P1 (High)**

**As a** 사용자,

**I want to** 어느 화면에서든 즉시 질문할 수 있어야 합니다,

**So that** Chat 페이지로 돌아가지 않고도 대화를 이어갈 수 있습니다.

**Acceptance Criteria:**

- [x] Chat, Portfolio 페이지에서 하단에 입력창이 고정됩니다
- [x] 최소 1자 이상 입력 시 전송 버튼 활성화됩니다
- [x] Enter: 전송, Shift+Enter: 줄바꿈
- [x] 4900자 이상일 때 글자 수 표시 (예: "4952 / 5000")
- [x] 5000자 초과 시 글자 수 빨간색 표시 및 전송 버튼 비활성화
- [x] 자동 높이 조절 (1~5줄, 5줄 초과 시 스크롤)
- [x] 1줄일 때 세로 가운데 정렬, 여러 줄일 때 버튼 하단 고정

**적용 범위:**

- ✅ Chat 페이지
- ✅ Portfolio 페이지 (포트폴리오 기반 질문 유도)
- ❌ Artifacts 목록 (의미 없음)
- ❌ My Page (설정 화면)

**References:**

- UI 참조: Perplexity 하단 입력창

---

## US-2. HITL Approval (승인 인터페이스)

**Priority: P0 (Critical)**

### US-2.1 매매 승인 필수

**As a** 투자자,

**I want to** AI가 제안한 매매를 반드시 검토하고 승인/거부하고 싶습니다,

**So that** 내 자산에 대한 최종 결정권을 유지할 수 있습니다.

**Acceptance Criteria:**

- [x] Backend에서 `requires_approval: true` 신호를 보내면 우측에 승인 패널이 표시됩니다 (UI 완료, API 연동은 진행중)
- [x] 패널은 사용자가 결정을 내릴 때까지 닫을 수 없습니다
- [x] 패널에 다음 정보가 표시됩니다:
    - 주문 내역 (종목명, 종목코드, 금액, 수량)
    - 리스크 경고 (현재 비중, 예상 비중, 경고 문구)
    - 권장 대안 (선택 사항)
- [x] 승인/거부 버튼이 명확하게 구분됩니다

**Why Critical:**

- HITL 시스템의 핵심 기능입니다
- 발표회 시연의 하이라이트입니다

**User Flow:**

```
[AI: "삼성전자 1000만원 매수를 제안합니다"]
  ↓
[승인 패널 우측에 오픈 (Claude Artifacts 스타일)]
  ↓
[사용자: 주문 내역 + 리스크 경고 확인]
  ↓
[승인 클릭 → "매수 주문이 실행되었습니다" 토스트]
  ↓
[패널 자동 닫힘 → Chat 계속]

```

**References:**

- UI 참조: Claude Artifacts (우측 패널)
- Mockup: `references/mockup_references/HITL 승인 패널.png`

---

### US-2.2 승인 이력 추적

**Priority: P2 (Medium)**

**As a** 사용자,

**I want to** 과거 승인/거부 내역을 보고 싶습니다,

**So that** 내 의사결정 패턴을 돌아볼 수 있습니다.

**Scope:** Phase 3에서 구현

---

## US-3. Portfolio Visualization (포트폴리오 시각화)

**Priority: P1 (High) → P0 (Critical)** ⚠️ **우선순위 상향**

### US-3.1 포트폴리오 즉시 시각화

**As a** 투자자,

**I want to** 내 포트폴리오 구성을 한눈에 보고 싶습니다,

**So that** AI가 제안한 매매 후 변화를 직관적으로 이해할 수 있습니다.

**Acceptance Criteria:**

- [x] 포트폴리오 데이터를 시각화된 차트로 표시합니다
- [x] 3가지 차트 타입을 지원합니다:
    - **트리맵** (기본): 종목별 비중을 면적으로 표시
    - **원 그래프**: 섹터별 비중
    - **막대 그래프**: 수익률 순위
- [x] 차트 타입 전환 버튼이 제공됩니다
- [x] 각 종목을 클릭하면 상세 정보가 표시됩니다 (툴팁으로 구현)

**Why Priority Raised:**

- AI 투자 시스템의 핵심 결과물을 보여주는 기능입니다
- 시연 시 방문객이 가장 관심을 가질 부분입니다
- Claude의 Artifacts처럼 즉시 시각화되어야 합니다

**New Feature: AI 제안 시 사이드 패널 미리보기**

- AI가 매매를 제안할 때, 승인 패널 하단에 "예상 포트폴리오" 원 그래프를 표시합니다
- 승인 전/후 비중을 색상으로 구분합니다 (예: 삼성전자 25% → 43% 빨간색 강조)

**References:**

- UI 참조: [PilePeak.ai](http://PilePeak.ai) (차트 톤앤매너)
- Mockup: `references/mockup_references/Portfolio.png`

---

### US-3.2 포트폴리오 기본 정보

**Priority: P1 (High)**

**As a** 투자자,

**I want to** 총 자산, 수익률, 보유 종목 수를 확인하고 싶습니다,

**So that** 현재 투자 현황을 파악할 수 있습니다.

**Acceptance Criteria:**

- [x] 총 평가금액
- [x] 총 수익률 (%, 금액)
- [x] 보유 종목 수
- [x] 현금 보유액

---

## US-4. Automation Level (자동화 레벨)

**Priority: P2 (Medium)**

### US-4.1 자동화 수준 설정

**As a** 사용자,

**I want to** AI의 자율성 수준을 조절하고 싶습니다,

**So that** 내 투자 스타일에 맞게 개입 빈도를 결정할 수 있습니다.

**Acceptance Criteria:**

- [ ] 3가지 자동화 레벨 선택 가능:
    1. **어드바이저 모드**: AI가 정보만 제공 (매매 제안 없음)
    2. **코파일럿 모드**: 모든 매매에 승인 필요 (HITL 필수)
    3. **파일럿 모드**: 일부 매매 자동 실행 (고위험만 승인)
- [ ] 현재 레벨이 프로그레스 바로 표시됩니다
- [ ] 각 레벨의 특징이 설명됩니다

**UI Enhancement (피드백 반영):**

- 프로그레스 바에 HITL 개입 지점을 시각적으로 표시합니다

```
[Advisor] ────── [Copilot] ────── [Pilot]
           No Auto  👤 HITL    Some Auto

```

**References:**

- Backend: `references/BackendPRD.md` 자동화 레벨 시스템
- Mockup: `references/mockup_references/My Page.png`

---

## US-5. Personalized Investment Profile (초개인화 투자 성향)

**Priority: P2 (Medium) → P1 (High)** ⚠️ **우선순위 상향**

### US-5.1 AI 생성 투자 성향 프로필

**As a** 사용자,

**I want to** AI가 나를 어떻게 이해하고 있는지 보고 싶습니다,

**So that** 맞춤형 제안이 왜 나오는지 이해할 수 있습니다.

**Acceptance Criteria:**

- [ ] 기존 4단계 분류(안정형, 공격투자형 등) 표시
- [ ] LLM이 생성한 서술형 프로필 표시:
    - 매매 패턴 (평균 매매 횟수, 단타/장투 성향)
    - 선호 섹터 (최근 2주 투자 집중 분야)
    - 리스크 성향 (급등주 회피 여부 등)
    - 포트폴리오 전략 (분산/집중 투자 성향)
- [ ] 프로필은 주기적으로 업데이트됩니다

**Example Output:**

```
투자 성향: 공격투자형

AI가 파악한 당신의 투자 스타일:
- 하루 평균 3번 매매를 하며, 단타 성향이 강합니다
- 최근 2주간 반도체/배터리 섹터에 집중 투자했습니다
- 급등주는 피하고, 펀더멘털 기반 종목을 선호합니다
- 포트폴리오 비중은 상위 3종목에 70% 집중하는 패턴입니다

마지막 업데이트: 2025-10-20

```

**Why Priority Raised:**

- 발표회에서 "개인화 AI"의 차별점을 보여줄 수 있는 핵심 기능입니다
- 단순 설문 기반이 아닌, 행동 데이터 기반 분석임을 강조할 수 있습니다

**API Requirement:**

- Backend: `GET /api/v1/user/investment-profile`
- LLM이 주기적으로 생성한 프로필 텍스트 반환 필요

**References:**

- 참조: ChatGPT Memory (행동 기반 프로필 생성)

---

## US-6. Onboarding Flow (온보딩)

**Priority: P3 (Low)**

### US-6.1 투자 성향 분석

**As a** 신규 사용자,

**I want to** 간단한 질문을 통해 내 투자 성향을 파악하고 싶습니다,

**So that** AI가 나에게 맞는 제안을 할 수 있습니다.

**Acceptance Criteria:**

- [ ] 4단계 질문 완료 (참조: `references/초기스크리닝.md`)
- [ ] 선택지는 카드 형태로 제공
- [ ] 최종 결과: 투자 성향 + 자동화 레벨 추천

**Scope:** Phase 3 구현

---

## US-7. Internationalization (다국어)

**Priority: P1 (High)** ⚠️ **우선순위 상향**

### US-7.1 한국어/영어 지원

**As a** 해외 방문객,

**I want to** 영어로 인터페이스를 사용하고 싶습니다,

**So that** 언어 장벽 없이 시스템을 이해할 수 있습니다.

**Acceptance Criteria:**

- [ ] 언어 선택 드롭다운 (Header 또는 My Page)
- [ ] 모든 UI 텍스트 번역 (한국어/영어)
- [ ] 선택 상태 LocalStorage 저장

**Phase 1 Scope:**

- i18n 구조 설정 (react-i18next)
- 핵심 화면 번역 (Chat, HITL, Portfolio)

**Phase 3 Scope:**

- 전체 화면 번역 완성

**Why Critical:**

- 발표회에 외국인 방문객이 있을 경우 필수입니다
- 글로벌 확장 가능성을 보여줄 수 있습니다

---

## 4. Phase Roadmap

### Phase 1: Core Demo (시연 필수 기능)

**목표:** 발표회에서 5분 시연 가능한 MVP

**Must Have:**

- [x] US-1.1: 기본 대화
- [x] US-1.2: AI 사고 과정 표시 (스트리밍 제외)
- [x] US-1.3: Artifact 저장 (버튼만, 토스트는 진행중)
- [x] US-2.1: 매매 승인 필수 (UI 완료, API 연동 진행중)
- [x] US-3.1: 포트폴리오 즉시 시각화 (Recharts, 3가지 차트, LocalStorage)
- [x] US-3.2: 포트폴리오 기본 정보

**Should Have:**

- [x] US-1.4: Persistent Chat Input
- [ ] US-7.1: 다국어 (구조 설정) ⚠️ **우선순위 상향**

**Technical Setup:**

- Dark mode CSS 변수 설정 (토글은 Phase 2)
- i18n 구조 설정
- Responsive 고려 설계 (완성은 Phase 4)

---

### Phase 2: Enhanced UX

**목표:** 사용자 경험 강화

**Must Have:**

- [ ] US-4.1: 자동화 레벨 설정
- [ ] US-5.1: 초개인화 투자 성향 ⚠️ **우선순위 상향**

**Should Have:**

- [ ] Dark mode 토글 완성
- [ ] Artifacts 페이지 (목록)

---

### Phase 3: Completeness

**목표:** 제품 완성도 향상

**Must Have:**

- [ ] Artifacts 상세 뷰
- [ ] US-6.1: 온보딩 플로우
- [ ] US-7.1: 다국어 완성

**Should Have:**

- [ ] US-2.2: 승인 이력 추적

---

### Phase 4: Polish & Optional

**목표:** 부가 기능 추가

**Optional:**

- [ ] Discover 페이지 (뉴스 피드)
- [ ] Push 알림
- [ ] 고급 Portfolio 기능 (비교, 시뮬레이션)
- [ ] Responsive 완성 (Tablet, Mobile)

---

## 5. Technical Constraints

### 5.1 Technology Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS (dark mode 지원)
- **Icons**: Lucide React (strokeWidth: 1.5)
- **차트**: Chart.js 또는 Recharts
- **i18n**: react-i18next

### 5.2 Performance Targets

|항목|목표|
|---|---|
|Initial Load|< 2초|
|Chat Response|< 3초|
|Chart Rendering|< 1초|

### 5.3 Browser Support

- Chrome 최신 버전 (발표회 데모 환경)
- Safari, Firefox 최신 버전 (참고)

---

## 6. Out of Scope (명시적 제외)

다음 기능은 **명시적으로 제외**됩니다:

- ❌ 소셜 기능 (공유, 팔로우, 커뮤니티)
- ❌ 네이티브 앱 (iOS/Android)
- ❌ 실시간 스트리밍 차트 (정적 차트만)
- ❌ 스크린 리더 풀 지원 (최소 키보드 네비게이션만)
- ❌ 회원가입/로그인 (Phase 1-3에서 제외)

---

## 7. Success Metrics (시연 관점)

발표회 시연 성공 기준:

|지표|목표|
|---|---|
|**시연 완료율**|5분 내 핵심 플로우 완료|
|**HITL 이해도**|방문객이 "AI를 감독할 수 있다"고 이해|
|**포트폴리오 시각화**|차트를 보고 즉시 이해|
|**에이전트 투명성**|Thinking 과정을 보고 신뢰|

---

## 8. 시연 시나리오 (Demo Script)

### 시나리오 1: 핵심 플로우 (5분)

```
[시작: Chat 페이지 Empty State]

1. 제안 카드 클릭: "삼성전자 분석해줘" (30초)
   → AI 답변 + Thinking 펼쳐서 과정 보여주기

2. 추가 질문: "삼성전자 1000만원 매수해줘" (1분)
   → HITL 패널 등장
   → 주문 내역 확인
   → 리스크 경고 확인 (예상 비중 43% 과도)
   → "예상 포트폴리오" 원 그래프 확인
   → 승인 클릭

3. Portfolio 페이지 이동 (1분)
   → 트리맵 확인
   → 원 그래프로 전환
   → 삼성전자 클릭 → 상세 정보

4. Chat으로 돌아와 질문: "내 포트폴리오 리스크는?" (1분)
   → AI 답변 확인
   → "Save as Artifact" 클릭

5. Artifacts 페이지 이동 (30초)
   → 저장된 Artifact 확인
   → "채팅 시작" 클릭하여 추가 질문

[끝: 총 5분]

```

---

## 9. Appendix: Reference Documents

### 필수 참조 문서

|문서|내용|위치|
|---|---|---|
|**[BackendPRD.md](http://BackendPRD.md)**|Backend 기능, HITL 플로우, 자동화 레벨|`references/`|
|**[backendAPI.md](http://backendAPI.md)**|API 엔드포인트 명세|`references/`|
|**[초기스크리닝.md](http://xn--ok0bs2gn3gn2j75m42e.md)**|온보딩 질문 시나리오|`references/`|
|**[design지시.md](http://xn--design-nl8zg71b.md)**|UI/UX 디자인 시스템|`references/`|
|**HAMA Front IA.png**|IA 다이어그램|`references/`|

### 참조 이미지

- **Shell & LNB**: Claude (좌측 사이드바)
- **Chat Interface**: Gemini (메시지 스타일)
- **Portfolio**: [PilePeak.ai](http://PilePeak.ai) (차트 톤앤매너)
- **HITL Panel**: Claude Artifacts (우측 패널)
- **Persistent Input**: Perplexity (하단 입력창)

### Mockups

위치: `references/mockup_references/`

1. 시작 제안 카드뷰.png
2. 대화 기록 뷰.png
3. AI 생각 과정 뷰.png
4. Chat History.png
5. HITL 승인 패널.png
6. 아티팩트 목록 그리드 뷰.png
7. 아티팩트 본문 뷰.png
8. Portfolio.png
9. My Page.png
10. Discover.png

---

## 10. 변경 이력

|버전|날짜|변경 내용|작성자|
|---|---|---|---|
|3.0|2025-10-20|PRD 구조 개선: 요구사항 중심 재작성, IA 추가, 우선순위 재조정|Claude|
|2.0|2025-10-20|피드백 반영 (초안)|팀원|
|1.0|2025-10-19|초기 버전|팀원|

