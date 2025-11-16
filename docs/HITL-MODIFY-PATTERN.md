# HITL Modify 패턴 - Frontend 구현 가이드

> **버전**: 2025-02-XX (backend master 기준)
> **대상**: HAMA Web FE
> **출처**: FastAPI `/chat`, `/chat/approve` 구현 + LangGraph 최신 노드

---

## 1. 시스템 개요

### 1.1 핵심 흐름

```
사용자 입력 → POST /chat → LangGraph 실행
               ↳ HITL interrupt 발생 시 approval_request 반환
사용자 결정 → POST /chat/approve → LangGraph resume → 최종 응답
```

### 1.2 인터럽트 타입

| type | 발생 위치 | 수정 가능한 필드 | 비고 |
|------|-----------|------------------|------|
| `research_plan_approval` | `research_subgraph.planner_node` | `depth`, `scope`, `perspectives` + 자유 텍스트 | plan only, 실행 없음 |
| `trade_approval` | `graph_master.trade_hitl_node` | `quantity`, `price`, `action` | Portfolio Simulator 기반, 전/후 비교 필수 |
| `rebalance_approval` | `graph_master.rebalance_hitl_node` | `target_holdings` (실험적) + 자유 텍스트 | 전/후 비교 제공, 수정 시 재시뮬레이션 |

### 1.3 HITLConfig (참고)
프론트가 `/chat` 호출 시 `hitl_config`를 보내려면 아래 구조를 따라야 합니다.
```json
{
  "phases": {
    "data_collection": false,
    "analysis": false,
    "portfolio": false,
    "risk": false,
    "trade": true
  }
}
```
미지정 시 서버 기본값이 사용됩니다.

---

## 2. API 스펙

### 2.1 POST `/chat`
```http
POST /chat
Content-Type: application/json
```
```json
{
  "message": "삼성전자 10주 매수",
  "conversation_id": "uuid-optional",
  "hitl_config": { "phases": { "trade": true } },
  "intervention_required": false
}
```
응답 예시 (Trade interrupt):
```json
{
  "message": "🔔 사용자 승인이 필요합니다.",
  "conversation_id": "...",
  "requires_approval": true,
  "metadata": {
    "interrupted": true,
    "intervention_required": false
  },
  "approval_request": {
    "type": "trade_approval",
    "request_id": "c1c5...",
    "thread_id": "...",
    "action": "buy",
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "quantity": 10,
    "price": 75000,
    "total_amount": 750000,
    "current_weight": 0.12,
    "expected_weight": 0.18,
    "risk_warning": "⚠️ 단일 종목 18%",
    "portfolio_before": { "total_value": 12000000, "cash_balance": 4000000, "holdings": [...] },
    "portfolio_after": { "total_value": 12000000, "cash_balance": 3250000, "holdings": [...] },
    "risk_before": { "portfolio_volatility": 0.11, "var_95": -0.021, "sharpe_ratio": 0.82 },
    "risk_after": { "portfolio_volatility": 0.12, "var_95": -0.024, "sharpe_ratio": 0.79 },
    "modifiable_fields": ["quantity", "price", "action"],
    "supports_user_input": true,
    "pending_node": "trade_hitl",
    "message": "삼성전자 10주를 75,000원에 매수할까요?"
  }
}
```

### 2.2 POST `/chat/approve`
```http
POST /chat/approve
Content-Type: application/json
```
요청 공통 필드:
```json
{
  "thread_id": "conversation uuid",
  "request_id": "이전 approval_request.request_id",
  "decision": "approved | rejected | modified",
  "modifications": { ... },
  "user_input": "선택 사항",
  "user_notes": "선택 사항"
}
```

- `Approved`: `decision="approved"`, `modifications` 생략
- `Rejected`: `decision="rejected"`, `user_notes` 작성 추천
- `Modified`
  - Research: `modifications`에 `depth/scope/perspectives`
  - Trade: `modifications`에 `quantity/price/action`
  - Rebalance: `modifications.target_holdings` 배열 또는 생략 후 `user_input`만 전달 가능

성공 응답:
```json
{
  "status": "approved",
  "message": "승인 완료 - 매매가 실행되었습니다.",
  "conversation_id": "...",
  "result": { "summary": "...", "trade_order_id": "ORD-xxxx" }
}
```

> 현재 백엔드에서는 `decision="modified"`도 최종 실행까지 이어집니다. 재시뮬레이션 후 다시 interrupt가 오는 UX는 차기 리팩터링 과제입니다.

---

## 3. 시나리오별 가이드

### 3.1 Research Plan Modify

**1) Interrupt payload**
```json
{
  "type": "research_plan_approval",
  "plan": {
    "depth": "detailed",
    "scope": "balanced",
    "perspectives": ["technical", "fundamental"],
    "estimated_time": "30-45초"
  },
  "options": {
    "depths": ["brief", "detailed", "comprehensive"],
    "scopes": ["key_points", "balanced", "wide_coverage"],
    "perspectives": ["macro", "fundamental", "technical", "flow", "strategy", "bull_case", "bear_case"],
    "methods": ["qualitative", "quantitative", "both"]
  },
  "modifiable_fields": ["depth", "scope", "perspectives"],
  "supports_user_input": true,
  "message": "다음과 같이 분석할 예정입니다. 진행하시겠습니까?"
}
```

**2) UI 제안**
- 요약 카드: 종목, 예상 소요 시간, 현재 옵션
- 수정 패널: 라디오/체크박스 + 자유 텍스트(placeholder: "예: 반도체 CAPEX 관점 포함")
- 버튼: `수정 후 진행`, `그대로 진행`, `거절`

**3) Modify 요청 예**
```json
{
  "decision": "modified",
  "modifications": {
    "depth": "comprehensive",
    "scope": "wide_coverage",
    "perspectives": ["macro", "fundamental", "technical"]
  },
  "user_input": "2000년대 메모리 사이클 자료도 참고해주세요"
}
```

### 3.2 Trading Modify (Portfolio Simulator)

**1) Interrupt payload 추가 필드**
- `portfolio_before/after`: `total_value`, `cash_balance`, `holdings[{stock_code, stock_name, quantity, weight, market_value}]`
- `risk_before/after`: `{portfolio_volatility, var_95, sharpe_ratio, max_drawdown_estimate}`
- `modifiable_fields`: `quantity`, `price`, `action`

**2) UI 가이드**
- 헤더: 주문 요약 (종목, 방향, 수량, 금액)
- 섹션 A: 포트폴리오 변화 (바 차트 or diff table)
- 섹션 B: 리스크 변화 (표 + 상승/하락 아이콘)
- 섹션 C: 경고 (위험 집중도 메시지)
- 액션 버튼: `수정`, `승인`, `거부`
- 수정 패널: 수량/가격 입력, 방향 토글, "수정 후 승인" 버튼

**3) Modify 요청**
```json
{
  "decision": "modified",
  "modifications": {
    "quantity": 5,
    "price": 70000,
    "action": "buy"
  },
  "user_input": "현금 30%는 유지하고 싶어요"
}
```
> 주의: 현재 서버는 수정 요청 직후 거래를 실행합니다. 재시뮬레이션 화면은 V2 목표입니다.

### 3.3 Rebalancing Modify

**1) Interrupt payload**
```json
{
  "type": "rebalance_approval",
  "proposal": {
    "target_holdings": [...],
    "metrics": {
      "expected_return": 0.11,
      "expected_volatility": 0.17,
      "sharpe_ratio": 0.68
    }
  },
  "portfolio_before": {...},
  "portfolio_after": {...},
  "risk_before": {...},
  "risk_after": {...},
  "modifiable_fields": ["target_holdings"],
  "supports_user_input": true,
  "message": "포트폴리오 리밸런싱을 승인하시겠습니까?"
}
```

**2) UI 제안**
- 테이블: 종목/현재비중/제안비중/증감
- 리스크 카드: 수익률/변동성/샤프
- 수정 UX: (a) 자유 텍스트 "의견 제시" (권장) (b) 실험적 – 종목별 슬라이더 후 합계 100% 확인

**3) Modify 요청**
```json
{
  "decision": "modified",
  "user_input": "IT 비중 5%p 더 늘려주세요",
  "modifications": {
    "target_holdings": [
      {"stock_code": "005930", "weight": 0.32},
      {"stock_code": "000660", "weight": 0.27},
      ...
    ]
  }
}
```

---

## 4. 상태 & 재시작 전략

| 그래프 필드 | 설명 | 주입 위치 |
|-------------|------|-----------|
| `trade_approved` | True = 승인 처리됨, False = 재시뮬 필요 | `/chat/approve` resume payload에서 `approved: True`만 넣어도 내부적으로 True로 매핑됨 |
| `user_modifications` | trade/rebalance 노드가 읽는 사용자 수정사항 | 현재 REST API에서는 `modifications` dict 전체가 LangGraph로 전달되지만, 상태 필드(`trade_quantity` 등)에 자동 반영되지는 않습니다. 추후 개선 예정 |
| `portfolio_before/after`, `risk_before/after` | interrupt 화면 데이터 | LangGraph가 계산, approval_request에 그대로 포함 |

프론트에서 재요청 없이 화면을 다시 띄우려면 `approval_request.pending_node`를 memo해두었다가, 복구 시 server 상태 조회 API가 준비되면 사용할 수 있도록 대비하세요 (현재는 미구현).

---

## 5. 예시 코드 (React)

```tsx
interface ApprovalRequestBase {
  type: 'research_plan_approval' | 'trade_approval' | 'rebalance_approval';
  request_id: string;
  message: string;
  modifiable_fields?: string[];
  supports_user_input?: boolean;
  [key: string]: any;
}

export function HITLPanel({ approvalRequest, onResolve }: {
  approvalRequest: ApprovalRequestBase | null;
  onResolve: () => void;
}) {
  const [mode, setMode] = useState<'view' | 'modify'>('view');
  const [modifications, setModifications] = useState<any>({});
  const [userInput, setUserInput] = useState('');

  if (!approvalRequest) return null;

  const submit = async (decision: 'approved' | 'rejected' | 'modified', notes?: string) => {
    await fetch('/chat/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: currentConversationId,
        request_id: approvalRequest.request_id,
        decision,
        modifications: decision === 'modified' ? modifications : undefined,
        user_input: userInput || undefined,
        user_notes: notes,
      }),
    });
    onResolve();
  };

  return (
    <div className="hitl-panel">
      {mode === 'view' ? (
        <ApprovalView data={approvalRequest} onApprove={() => submit('approved')} onReject={(notes) => submit('rejected', notes)} onModify={() => setMode('modify')} />
      ) : (
        <ModifyForm type={approvalRequest.type} data={approvalRequest} value={modifications} onChange={setModifications} userInput={userInput} onUserInputChange={setUserInput} onCancel={() => setMode('view')} onSubmit={() => submit('modified')} />
      )}
    </div>
  );
}
```

컴포넌트 세부 구현 예시는 기존 문서를 참고하거나 Storybook에서 유지합니다.

---

## 6. FAQ & 한계

1. **수정 후 즉시 새 interrupt가 오나요?**  
   현재 백엔드는 수정 요청 직후 매매/리밸런스를 실행합니다. 재시뮬레이션 후 재확인 기능은 LangGraph 내부에 준비되어 있으나 REST API가 아직 연동되지 않았습니다.

2. **`supports_user_input`이 true인데 `modifications` 없이 user_input만 보내도 되나요?**  
   가능합니다. 서버는 `modifications.user_input`으로 전달해 LangGraph state에 적재합니다.

3. **동일 세션에서 interrupt가 여러 번 올 수 있나요?**  
   예. Research 승인을 마치고 동일 세션에서 Trade interrupt가 이어질 수 있습니다. 프론트는 마지막 interrupt만 렌더링하면 됩니다.

4. **`request_id`를 저장해야 하나요?**  
   반드시 저장하세요. `/chat/approve`에 다시 전달하지 않으면 DB 기록과 매칭되지 않습니다.

---

## 7. 추후 개선 TODO (백엔드 로드맵)
- `/chat/approve` → LangGraph 상태 매핑을 정리해 `user_modifications`가 실제 `trade_quantity` 등에 반영되도록 업데이트 예정 (ETA 2025 Q2).
- Rebalance 수정 UX를 단순 의견 모드로 바꾸거나, 합계를 자동 보정하는 helper API 제공.
- `/chat` SSE 버전(`multi_agent_stream`) 문서화.

프론트는 상기 현행 동작을 기준으로 화면을 구성하고, 개선 배포 시 본 문서를 업데이트합니다.
