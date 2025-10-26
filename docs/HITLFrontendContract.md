# HITL Frontend Contract

본 문서는 HITL(승인 패널) UI가 정상 렌더링되기 위해 백엔드가 프론트에 제공해야 하는 데이터 계약을 정리합니다. 서버/클라이언트가 동일한 스키마를 공유하는 것을 목표로 합니다.

## 1) 트리거 구조 (assistant 메시지)

- requires_approval: boolean (필수)
  - true일 때 승인 패널을 오픈
- approval_request: object (필수, 상세 스키마 아래 참조)
- conversation_id: string (필수)
  - 이후 approve/reject 시 thread_id로 재사용

예시
{
  "message": "🔔 사용자 승인이 필요합니다.",
  "requires_approval": true,
  "approval_request": { ... },
  "conversation_id": "3dd9b2fb-6bbc-42cb-8b3e-a7e5a1f9bfe5"
}

## 2) approval_request 스키마

필수(Required)
- action: "buy" | "sell"
- thread_id: string (= conversation_id)

권장(Strongly Recommended)
- stock_code: string (예: "005930")
- stock_name: string (예: "삼성전자")
- quantity: number (예: 5)
- price: number (단가, 예: 70000)
- total_amount: number (예: 350000)

선택(Optional)
- risk_warning: string
- current_weight: number (예: 25.0)
- expected_weight: number (예: 26.1)
- alternatives: Array<{
    suggestion: string,
    adjusted_quantity: number,
    adjusted_amount: number
  }>
- pending_node: string (예: "execute")
- message: string (추가 안내 문구)

타입 요건(Validation)
- 모든 수치 필드는 number 타입으로 전달 (문자열 금지)
- 누락 가능성이 있는 필드는 키 자체를 생략하거나 null 허용
- 통화/숫자 포맷은 프론트가 로컬라이즈하므로 원시 number 제공

## 3) 프론트 표시 항목 매핑

- 제목: i18n("hitl.title")
- 상태 뱃지: i18n("hitl.pending")
- 주문 내역
  - 종목명: stock_name
  - 종목코드: stock_code
  - 거래 유형: action → i18n("hitl.buy"/"hitl.sell")
  - 주문 수량: quantity (+ "주" 라벨 i18n("hitl.shares"))
  - 현재 시세가: price (통화 포맷)
  - 예상 매수/매도 금액: total_amount (통화 포맷)
- 포트폴리오 비중 변화(있을 때만)
  - current_weight, expected_weight (%로 표시)
- 리스크 경고(있을 때만)
  - risk_warning
- 대안 제안(있을 때만)
  - alternatives[].suggestion
  - alternatives[].adjusted_quantity, adjusted_amount

표시 규칙(Fallback)
- 값이 없거나 타입이 맞지 않을 경우 해당 행을 숨기거나 "-"로 대체
- current_weight / expected_weight 둘 중 하나라도 없으면 비중 섹션 생략
- alternatives가 비어 있거나 없으면 대안 섹션 생략

## 4) 승인/거부 API 입력

- thread_id: string (conversation_id 재사용)
- decision: "approved" | "rejected" | "modified"
- automation_level: 1 | 2 | 3 (프론트 현재 모드 동기화)
- modifications: object | null (사용자 수정사항이 있는 경우)
- user_notes: string | null

예시
{
  "thread_id": "3dd9b2fb-6bbc-42cb-8b3e-a7e5a1f9bfe5",
  "decision": "approved",
  "automation_level": 2,
  "modifications": null,
  "user_notes": null
}

## 5) 에러/불완전 데이터 처리 가이드

- 승인 요청에 최소한 action, thread_id는 항상 포함
- 주문 세부(코드/이름/수량/가격/금액)가 없더라도 requires_approval가 true라면 패널은 열 수 있음
- 다만 UX 품질을 위해 권장 필드(코드/이름/수량/가격/금액)는 최대한 채워서 전달
- 서버 오류(식별자 매핑 실패 등)는 500이 아닌 텍스트 degrade 또는 4xx로 처리 권장

## 6) 예시 페이로드 (권장형)

{
  "message": "🔔 사용자 승인이 필요합니다.",
  "requires_approval": true,
  "conversation_id": "3dd9b2fb-6bbc-42cb-8b3e-a7e5a1f9bfe5",
  "approval_request": {
    "type": "trade_approval",
    "thread_id": "3dd9b2fb-6bbc-42cb-8b3e-a7e5a1f9bfe5",
    "action": "buy",
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "quantity": 5,
    "price": 70000,
    "total_amount": 350000,
    "current_weight": 25.0,
    "expected_weight": 26.1,
    "risk_warning": "비중이 일시적으로 26%를 초과할 수 있습니다.",
    "alternatives": [
      { "suggestion": "수량 3주로 축소", "adjusted_quantity": 3, "adjusted_amount": 210000 },
      { "suggestion": "단가 69,500 기준 재산정", "adjusted_quantity": 5, "adjusted_amount": 347500 }
    ]
  }
}

## 7) 프론트 처리 참고 (현재 구현)

- 패널 컴포넌트: src/components/hitl/HITLPanel.tsx
- 안전 가드: 숫자/문자열 누락 시 "-" 표시 및 섹션 스킵
- 승인/거부 호출: src/app/page.tsx → approveAction()
- i18n 키: src/locales/*/translation.json 의 hitl.*

