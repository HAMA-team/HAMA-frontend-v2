# Userflow

## User Flow Diagrams

### Flow 1: 기본 대화 플로우

```
[시작: Chat 페이지]
      ↓
[Empty State]
 - 4개 제안 카드 표시
      ↓
[사용자 액션]
 - 제안 카드 클릭 또는
 - 직접 입력 → Enter
      ↓
[메시지 전송]
 - 로딩 스피너 표시
 - Chat Input 비활성화
      ↓
[AI 응답 수신]
 - Thinking 섹션 표시 (접힘)
 - Markdown 답변 렌더링
      ↓
[사용자 선택]
 ├─ "Save as Artifact" → Artifacts 목록에 저장
 ├─ 추가 질문 입력 → 대화 계속
 └─ 다른 페이지 이동 → LNB 사용

```

---

### Flow 2: HITL 승인 플로우

```
[대화 중: Chat 페이지]
      ↓
[사용자 질문]
 "삼성전자 1000만원 매수해줘"
      ↓
[AI 분석]
 - Thinking: Planner → Researcher → Strategy
      ↓
[Backend 신호]
 requires_approval: true
      ↓
[HITL 패널 오픈]
 - 우측 50% 슬라이드 인
 - 좌측 오버레이 어둡게
      ↓
[사용자 검토]
 1. 주문 내역 확인
 2. 리스크 경고 확인
    - 현재 비중: 25%
    - 예상 비중: 43% (⚠️ 과도함)
 3. 예상 포트폴리오 차트 확인
      ↓
[사용자 결정]
 ├─ [승인 클릭]
 │   ↓
 │  API 호출: POST /api/v1/chat/approve
 │   ↓
 │  토스트: "매수 주문이 실행되었습니다"
 │   ↓
 │  패널 자동 닫힘
 │   ↓
 │  Chat 계속
 │
 └─ [거부 클릭]
     ↓
    API 호출: POST /api/v1/chat/reject
     ↓
    토스트: "매수 주문이 거부되었습니다"
     ↓
    패널 자동 닫힘
     ↓
    AI: "다른 제안을 원하시나요?"

```

---

### Flow 3: 포트폴리오 조회 + 추가 질문 플로우

```
[Chat 페이지]
      ↓
[사용자: "내 포트폴리오 보여줘"]
      ↓
[AI 답변]
 - 포트폴리오 개요 텍스트
 - "Portfolio 페이지에서 자세히 보기" 링크
      ↓
[사용자: 링크 클릭]
      ↓
[Portfolio 페이지 이동]
 - 총 자산, 수익률 확인
 - 트리맵 차트 확인
      ↓
[사용자: 차트 타입 변경]
 "원 그래프" 선택
      ↓
[원 그래프 표시]
 - 종목별 비중 색상으로 구분
      ↓
[사용자: 하단 Chat Input 사용]
 "삼성전자 비중 늘려줘"
      ↓
[AI 분석 후 제안]
 → HITL 승인 플로우 진입

```

---

### Flow 4: Artifact 저장 및 재사용 플로우

```
[Chat 페이지]
      ↓
[AI 답변: 복잡한 종목 분석]
 - 5000자 분량의 상세 분석
      ↓
[사용자: "Save as Artifact" 클릭]
      ↓
[로딩]
 버튼: "저장 중..." + 스피너
      ↓
[저장 완료]
 - 토스트: "Artifact가 저장되었습니다"
 - "Artifacts 페이지에서 보기" 링크
      ↓
[나중에...]
      ↓
[LNB: Artifacts 클릭]
      ↓
[Artifacts 목록 페이지]
 - 저장된 Artifact 카드 그리드
      ↓
[사용자: Artifact 카드 클릭]
      ↓
[Artifact 상세 페이지]
 - 전체 Markdown 내용 표시
      ↓
[사용자: "채팅 시작" 클릭 또는 우측 Chat Input 사용]
 "이 분석 기반으로 포트폴리오 조정해줘"
      ↓
[새 Chat 생성]
 - Context: 해당 Artifact 내용 포함
      ↓
[대화 계속...]

```

---

### Flow 5: 자동화 레벨 변경 효과 플로우

```
[My Page]
      ↓
[현재 레벨: 코파일럿 모드]
 - 모든 매매에 HITL 승인 필요
      ↓
[사용자: 파일럿 모드로 변경]
      ↓
[변경 확인 모달]
 "파일럿 모드로 변경하면 일부 매매가 자동 실행됩니다.
  계속하시겠습니까?"
      ↓
[확인 클릭]
      ↓
[API: POST /api/v1/user/automation-level]
      ↓
[토스트: "자동화 레벨이 변경되었습니다"]
      ↓
[Chat 페이지로 이동]
      ↓
[사용자: "SK하이닉스 매수 추천해줘"]
      ↓
[AI 분석]
 - 저위험 매매로 판단
      ↓
[자동 실행]
 - HITL 패널 없이 바로 주문
      ↓
[토스트: "매수 주문이 실행되었습니다 (자동)"]
      ↓
[Chat에 결과 표시]
 "SK하이닉스 매수 주문이 완료되었습니다. (자동 실행)"

```

---

## Page Hierarchy Summary

```
Level 1: Flow (플로우)
  ├─ 온보딩 플로우
  ├─ 메인 플로우
  └─ 설정 플로우

Level 2: Page (페이지)
  ├─ Chat 페이지 (/)
  ├─ Portfolio 페이지 (/portfolio)
  ├─ Artifacts 페이지 (/artifacts)
  ├─ Discover 페이지 (/discover)
  └─ My Page (/settings)

Level 3: Panel (패널) - 페이지 오버레이
  └─ HITL 승인 패널 (우측)

Level 4: View (뷰) - 페이지 내 상태별 화면
  ├─ Empty State (초기 화면)
  ├─ 메시지 뷰 (대화 중)
  ├─ Thinking 뷰 (접기/펼치기)
  └─ 목록 그리드 / 상세 뷰

Level 5: Component (컴포넌트) - 재사용 가능한 UI 요소
  ├─ ChatMessage
  ├─ ChatInput
  ├─ PortfolioChart
  └─ Persistent Chat Input

```

---

## Navigation Paths

|출발|목적지|경로|우선순위|
|---|---|---|---|
|Chat|Portfolio|LNB → Portfolio|P1|
|Chat|Artifacts|"Save as Artifact" → Artifacts 링크|P3|
|Portfolio|Chat|하단 Chat Input 사용 → Chat 자동 전환|P1|
|Artifacts 목록|Artifact 상세|카드 클릭|P3|
|Artifact 상세|Chat|"채팅 시작" 또는 우측 Chat Input|P3|
|My Page|Chat|설정 변경 후 → LNB → Chat|P2|
|Discover|Chat|뉴스 클릭 → "이 뉴스 기반 분석해줘"|P4|

---

## Empty States

|페이지|Empty State|CTA|
|---|---|---|
|Chat|"안녕하세요! 무엇을 도와드릴까요?" + 4개 제안 카드|카드 클릭|
|Artifacts|"저장된 Artifact가 없습니다"|"Chat으로 돌아가기"|
|Recent Chats (LNB)|"채팅 기록이 없습니다"|"새 채팅 시작"|
|Portfolio|"포트폴리오 데이터가 없습니다"|"증권사 연결하기" (Phase 3)|

---

## Interaction Patterns

### 1. 메시지 전송

- **Trigger:** Chat Input에서 Enter
- **Loading:** 로딩 스피너 + Chat Input 비활성화
- **Success:** AI 답변 표시 + Chat Input 재활성화
- **Error:** 재전송 버튼 + 삭제 옵션

### 2. HITL 승인

- **Trigger:** Backend `requires_approval: true`
- **Open:** 우측 슬라이드 인 (300ms 애니메이션)
- **Block:** 오버레이 클릭, ESC 키 무시
- **Close:** 승인/거부 후 자동 (200ms 애니메이션)

### 3. Thinking 섹션

- **Default:** 접힘
- **Click:** 펼쳐짐 (Accordion 애니메이션)
- **Re-click:** 다시 접힘

### 4. 차트 타입 변경

- **Trigger:** 차트 타입 버튼 클릭
- **Transition:** Fade out → Fade in (500ms)
- **Persist:** 선택 상태 LocalStorage 저장