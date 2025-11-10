# Research Agent 동적 라우팅 (Dynamic Worker Selection)

## 개요

Research Agent는 사용자의 질문을 분석하여 필요한 Worker만 동적으로 실행합니다. 이는 LangGraph의 Supervisor 패턴을 활용한 구조로, planner_node가 LLM을 사용해 실행할 Worker 조합을 결정합니다.

## Worker 역할

Research Agent는 5개의 Worker로 구성됩니다:

| Worker | 아이콘 | 역할 | 주요 데이터 |
|--------|-------|------|-----------|
| **data_worker** | 📊 | 기초 데이터 수집 | - 주가 (30일)<br>- 재무제표 (DART API)<br>- 기업정보<br>- 기술적 지표 (RSI, MACD 등)<br>- 펀더멘털 (PER, PBR)<br>- 시가총액<br>- 투자주체별 거래<br>- 시장지수 (KOSPI) |
| **bull_worker** | 🐂 | 낙관적 분석 | - 긍정적 요인 목록<br>- 목표가 (상승 시나리오)<br>- 신뢰도 (1-5) |
| **bear_worker** | 🐻 | 보수적 분석 | - 리스크 요인 목록<br>- 하락 목표가<br>- 신뢰도 (1-5) |
| **macro_worker** | 🌍 | 거시경제 분석 | - 기준금리 추세 (BOK API)<br>- CPI (소비자물가)<br>- 환율 (원/달러)<br>- 기업에 미치는 영향 평가 (금리/물가/환율) |
| **insight_worker** | 🧠 | 종합 인사이트 | - 핵심 포인트 3-5개<br>- 중요 리스크 정리<br>- 추가 조사 필요 사안 |

## 동적 라우팅 플로우

```
사용자 질문
    ↓
planner_node (LLM 분석)
    ↓
Worker 조합 결정 (예: {data, bull, bear, insight})
    ↓
task_router_node
    ↓
[선택된 Worker들 순차 실행]
    ↓
synthesis_node (결과 종합)
    ↓
사용자에게 답변
```

### 1. planner_node

**역할:** LLM을 사용하여 사용자 질문을 분석하고, 필요한 Worker 조합을 결정합니다.

**입력:**
- 사용자 질문 (`query`)
- 종목코드 (`stock_code`)

**출력 (JSON):**
```json
{
  "plan_summary": "한 문장 요약",
  "tasks": [
    {"id": "task_1", "worker": "data", "description": "재무제표 및 주가 데이터 수집"},
    {"id": "task_2", "worker": "bull", "description": "낙관적 시나리오 분석"},
    {"id": "task_3", "worker": "bear", "description": "리스크 시나리오 분석"},
    {"id": "task_4", "worker": "insight", "description": "종합 인사이트 도출"}
  ]
}
```

**코드 위치:** `src/agents/research/nodes.py:123-178`

**현재 제한사항:**
- Prompt에서 "worker 값은 반드시 data, bull, bear, insight 중 하나여야 합니다"라고 제한
- `ALLOWED_WORKERS = {"data", "bull", "bear", "insight", "macro"}` 정의되어 있으나 macro는 prompt에 포함 안 됨
- **향후 개선 필요:** Prompt 업데이트하여 macro_worker도 선택 가능하도록

### 2. task_router_node

**역할:** planner_node가 생성한 작업 목록을 순차적으로 Worker에 라우팅합니다.

**동작:**
1. `pending_tasks` 큐에서 다음 작업을 pop
2. `current_task`로 설정
3. LangGraph의 conditional edge를 통해 해당 Worker로 라우팅

**코드 위치:** `src/agents/research/nodes.py:181-191`

### 3. Worker 실행

각 Worker는 독립적으로 실행되며, 결과를 state에 저장합니다:

- **data_worker:** `price_data`, `financial_data`, `company_data`, `technical_indicators`, `fundamental_data`, `market_cap_data`, `investor_trading_data`, `market_index_data`
- **bull_worker:** `bull_analysis` (positive_factors, target_price, confidence)
- **bear_worker:** `bear_analysis` (risk_factors, downside_target, confidence)
- **macro_worker:** `macro_analysis` (raw_data, analysis)
- **insight_worker:** `insight` (key_takeaways, risks, follow_up_questions)

### 4. synthesis_node

**역할:** 모든 Worker 실행 완료 후, 수집된 데이터를 종합하여 최종 답변을 생성합니다.

## 사용자 질문 유형별 Worker 매핑 (예상)

planner_node가 LLM으로 동적 선택하므로 정확한 매핑은 런타임에 결정되지만, 예상되는 패턴:

| 사용자 질문 | 선택될 가능성 높은 Worker | 이유 |
|-----------|----------------------|------|
| "삼성전자 분석해줘" | data + bull + bear + insight | 기본 종목 분석 플로우 (가장 일반적) |
| "삼성전자 목표가는?" | data + bull | 낙관적 시나리오만 필요 |
| "삼성전자 리스크는?" | data + bear | 보수적 시나리오만 필요 |
| "시장 전망은?" | macro | 거시경제 환경 분석만 (종목 무관) |
| "금리 인상이 삼성전자에 미치는 영향은?" | data + macro | 거시경제 + 기업 데이터 필요 |
| "종합적으로 판단해줘" | data + bull + bear + macro + insight | 풀 분석 (모든 Worker 동원) |

**⚠️ 현재 제한:** macro_worker는 prompt에 포함되지 않아 선택 불가. 백엔드 업데이트 필요.

## HITL (Human-in-the-Loop) 적용 시점

### Agent 레벨 HITL ✅ (권장 - 현재 설계)

**위치:** Research Agent 전체 실행 전

**동작:**
1. 사용자가 "삼성전자 분석해줘" 질문
2. Supervisor가 Research Agent 호출 결정
3. **[HITL] 사용자 승인 요청** (Copilot/Advisor 레벨인 경우)
   - "Research Agent를 실행하여 삼성전자를 분석하시겠습니까?"
   - 사용자는 **어떤 Worker가 실행될지 몰라도 됨** (내부 구현 추상화)
4. 승인 후: planner_node → Worker 실행 → synthesis
5. 최종 답변 반환

**장점:**
- 사용자가 Worker 개념을 이해할 필요 없음
- 승인 횟수 최소화 (1회)
- UX 단순함

### Worker 레벨 HITL ❌ (비권장)

**예시 시나리오 (구현하지 말 것):**
1. 사용자가 "삼성전자 분석해줘" 질문
2. planner_node 실행 → {data, bull, bear, insight} 선택
3. **[HITL] data_worker 승인 요청** ← 사용자 혼란
4. 승인 → data_worker 실행
5. **[HITL] bull_worker 승인 요청** ← 또 물어봄
6. 승인 → bull_worker 실행
7. **[HITL] bear_worker 승인 요청** ← 짜증남
8. ... (이하 생략)

**문제점:**
- 승인 요청이 너무 많음 (Worker 개수만큼)
- 사용자가 Worker 개념을 이해해야 함 (data/bull/bear가 뭔지?)
- UX 복잡성 증가
- 분석 완료까지 시간 오래 걸림

**결론:** Worker 레벨 HITL은 구현하지 않음. Agent 레벨만 구현.

## 자동화 레벨별 HITL 동작

| 자동화 레벨 | Research Agent HITL | Worker HITL | 동작 |
|------------|---------------------|-------------|------|
| **Pilot** | ❌ 승인 불필요 | ❌ | 자동 실행 (저위험 데이터 수집/분석은 승인 불필요) |
| **Copilot** | ❌ 승인 불필요 | ❌ | 자동 실행 (분석 단계는 자동, 포트폴리오/매매만 승인) |
| **Advisor** | ✅ **승인 필요** | ❌ | Agent 전체 실행 전 승인 요청 |

**참고:** `docs/AutomationLevelIntegration.md`의 Phase 매핑 참조

## 기술 구현 상세

### LangGraph Subgraph 구조

Research Agent는 LangGraph의 **Subgraph**로 구현되어 있습니다:

**파일:** `src/agents/research/graph.py`

```python
def create_research_subgraph() -> CompiledStateGraph:
    workflow = StateGraph(ResearchState)

    # Nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("task_router", task_router_node)
    workflow.add_node("data_worker", data_worker_node)
    workflow.add_node("bull_worker", bull_worker_node)
    workflow.add_node("bear_worker", bear_worker_node)
    workflow.add_node("macro_worker", macro_worker_node)
    workflow.add_node("insight_worker", insight_worker_node)
    workflow.add_node("synthesis", synthesis_node)

    # Edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "task_router")

    # Conditional routing based on current_task.worker
    workflow.add_conditional_edges(
        "task_router",
        route_to_worker,
        {
            "data": "data_worker",
            "bull": "bull_worker",
            "bear": "bear_worker",
            "macro": "macro_worker",
            "insight": "insight_worker",
            "done": "synthesis"
        }
    )

    # All workers return to task_router
    for worker in ["data_worker", "macro_worker", "bull_worker", "bear_worker", "insight_worker"]:
        workflow.add_edge(worker, "task_router")

    workflow.add_edge("synthesis", END)

    return workflow.compile()
```

### Interrupt 추가 (HITL 구현 시)

LangGraph의 `interrupt()` 함수를 사용하여 Agent 레벨 HITL 구현:

**위치:** Supervisor에서 Research Agent 호출 전

```python
from langgraph.types import interrupt

# Supervisor의 Research Agent 호출 로직
async def call_research_agent(state: AgentState):
    user_config = state.get("user_config", {})
    hitl_config = user_config.get("hitl_config", {})

    # Phase: data_collection (Research Agent)
    if hitl_config.get("phases", {}).get("data_collection", {}).get("enabled", False):
        # HITL: 승인 요청
        approval = interrupt({
            "type": "approval_request",
            "agent": "Research",
            "action": "analyze_stock",
            "params": {
                "stock_code": state.get("stock_code"),
                "query": state.get("query")
            }
        })

        if approval["decision"] == "reject":
            return {"messages": [AIMessage(content="Research Agent 실행이 거부되었습니다.")]}

    # 승인되거나 HITL 비활성화 → Research Agent 실행
    research_result = await research_agent.ainvoke(state)
    return research_result
```

**참고 문서:**
- `references/interrupts.md`: LangGraph interrupt 공식 문서
- `references/subagents.md`: Subagent 패턴 공식 문서
- `docs/HITL_Panel_Specifications.md`: HITL UI 설계

## 프론트엔드 통합

### 사용자에게 표시되는 정보

1. **Agent 실행 시작 메시지**
   ```
   📋 조사 계획을 수립했습니다.
   삼성전자에 대한 종합 분석을 수행합니다.
   - (data) 재무제표 및 주가 데이터 수집
   - (bull) 낙관적 시나리오 분석
   - (bear) 리스크 시나리오 분석
   - (insight) 종합 인사이트 도출
   ```

2. **Worker 실행 중 메시지 (실시간 스트리밍)**
   ```
   📊 데이터 수집을 완료했습니다.
   🐂 강세 시나리오: 목표가 85,000원, 신뢰도 4/5
   🐻 약세 시나리오: 하락 목표가 68,000원, 신뢰도 3/5
   🧠 핵심 인사이트 요약:
   - 반도체 시장 회복 기대감 상승
   - 환율 하락 시 수출 이익 감소 리스크
   - ...
   ```

3. **최종 종합 답변**
   ```
   [synthesis_node가 생성한 최종 리포트]
   ```

### ChatView 컴포넌트 표시 방식

- **Agent Activity 통합 표시** (Claude의 Thinking 스타일)
- 각 Worker 실행은 별도 메시지가 아닌, Research Agent 활동 내에 시간 순서대로 표시
- 사용자는 "Research Agent가 작동 중"으로 인식, Worker는 내부 구현 세부사항

**참고:** `docs/ProductRequirements.md` Section 3.2.3 "Agent Activity Display"

## 향후 개선 사항

1. **macro_worker 활성화**
   - `planner_node` prompt에 macro 추가
   - 거시경제 분석이 필요한 질문 자동 감지

2. **Worker 병렬 실행**
   - 현재: 순차 실행 (data → bull → bear → insight)
   - 개선: bull/bear 병렬 실행 가능 (data 완료 후)

3. **캐싱**
   - data_worker 결과 캐싱 (동일 종목 재질문 시)
   - macro_worker 결과 캐싱 (시간 기반 TTL)

4. **동적 Worker 추가**
   - 뉴스 분석 Worker (news_worker)
   - 경쟁사 비교 Worker (competitor_worker)

## 관련 문서

- `docs/AutomationLevelIntegration.md`: Phase → Agent 매핑, 자동화 레벨 정의
- `docs/AutomationLevelAPIChanges.md`: API 스키마, hitl_config 구조
- `docs/HITL_Panel_Specifications.md`: HITL UI 설계 (5개 Agent별 패널)
- `docs/Settings_Approvals_API_Complete_Design.md`: Settings & Approvals API 설계
- `references/interrupts.md`: LangGraph interrupt 공식 문서
- `references/subgraphs.md`: LangGraph subgraph 공식 문서
- `references/subagents.md`: Deep Agents subagent 패턴

---

**Last Updated:** 2025-10-31
**Version:** 1.0
**Author:** Claude Code (based on backend code analysis)
