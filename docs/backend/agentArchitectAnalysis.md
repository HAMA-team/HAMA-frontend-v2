# HAMA Backend — Agent Architecture 분석 보고서

본 문서는 `HAMA-backend`의 에이전트 아키텍처를 LangGraph/LangChain 관점에서 정밀 분석한 결과입니다. Supervisor 패턴, 서브그래프 구성, 상태/체크포인트 관리, HITL(승인) 삽입 지점, SSE 스트리밍 이벤트, 서비스 계층 연동을 중심으로 구조와 데이터 흐름을 설명합니다.

## 1) 최상위 오케스트레이션: LangGraph Supervisor

- 소스: `src/agents/graph_master.py:1`
- 요약: Supervisor 패턴으로 마스터 에이전트를 구성하여 “조율만” 담당합니다. 실제 비즈니스 로직은 각 서브그래프(Research/Strategy/Portfolio/Risk/Trading/Monitoring)가 수행합니다. 병렬/순차 실행, 라우팅 지침, 예시 시나리오까지 프롬프트에 포함되어 있어 라우팅 근거가 일관적으로 유지됩니다.
- 핵심 포인트:
  - `create_supervisor` 사용, `parallel_tool_calls=True`로 병렬 실행 허용.
  - 라우팅 LLM은 `ROUTER_MODEL` 설정을 사용해 별도로 초기화(종목명 추출/의도 분류 정밀도 확보 목적).
  - `GraphState`를 state_schema로 사용해 공통 상태/메시지 스택을 공유.
  - Checkpointer 선택(메모리/Redis) 및 컴파일 캐시(`@lru_cache`)로 런타임 오버헤드 최소화.

구성 함수 개요:
- `build_supervisor(automation_level, llm=None)`: 라우팅용 LLM 준비 및 프롬프트 생성 후 Supervisor 그래프 정의.
- `build_state_graph(automation_level)`: Supervisor 기반 LangGraph 정의 반환(부수효과 최소화 원칙).
- `_create_checkpointer(backend_key)`: memory/redis 분기. Redis 미설치 시 ImportError/폴백 처리 명시.
- `get_compiled_graph(...)`/`build_graph(...)`/`run_graph(...)`: 컴파일/실행 래퍼, thread_id/request_id 구성 및 recursion_limit 조정.

## 2) 공통 상태 모델과 메시지 스택

- 소스: `src/schemas/graph_state.py:1`
- 표준 LangGraph 패턴 준수:
  - `messages: Annotated[Sequence[BaseMessage], add_messages]`로 대화 스택 관리.
  - `remaining_steps: RemainingSteps`로 ReAct/슈퍼바이저 패턴에서 스텝 제어.
  - 사용자 컨텍스트(`user_id`, `conversation_id`, `hitl_config`), 라우팅 필드(`intent`, `agents_to_call`), 결과 집계(`agent_results`), HITL/거래 상태(`trade_*`)를 단일 State에 통합.

장점: 서브그래프 간 공유/병합(`operator.or_`/`operator.add`)이 일관적이며, 하위 호환 필드(`summary`, `final_response`)를 유지해 이전 API와의 접점을 보존합니다.

## 3) 서브그래프 구성

### 3.1 Research Agent (Deep Agent 루프)
- 소스: `src/agents/research/graph.py:1`, `state.py`, `nodes.py`
- 플로우: `query_intent_classifier → planner → task_router → (worker loop) → synthesis → END`
- 동적 워커 선택: intent/깊이에 따라 `data/technical/trading_flow/information/macro/bull/bear/insight`를 반복적으로 수행 후 `synthesis`에서 종합.
- 특징:
  - `ResearchState`에 원천 데이터/기술지표/거시/강·약세 시나리오/메모 등이 누적.
  - 라우팅 함수 `_route_task`가 현재 task에 맞는 워커로 분기(없으면 `insight`).

### 3.2 Strategy Agent
- 소스: `src/agents/strategy/graph.py:1`, `state.py`, `nodes.py`
- 플로우: `market_analysis → sector_rotation → asset_allocation → blueprint_creation → END`
- 역할: 시장 국면/섹터 로테이션/자산배분/전략 청사진 생성. Research 결과와 결합해 투자 판단의 상층 논리 제공.

### 3.3 Portfolio Agent (리밸런싱 + HITL)
- 소스: `src/agents/portfolio/graph.py:1`, `nodes.py`, `state.py`
- 플로우: `analyze_query → collect_portfolio → market_condition → summary` 이후 조건 분기
  - 조회 전용(`view_only=True`) → `END`
  - 리밸런싱 → `optimize_allocation → validate_constraints → rebalance_plan → approval_rebalance(HITL) → execute_rebalance → END`
- 특징:
  - `portfolio_optimizer.calculate_target_allocation`로 최적 비중/메트릭 산출.
  - `validate_constraints`에서 제약 검증, 경고/에러를 명시적으로 상태에 저장.
  - `approval_rebalance_node`에서 인터럽트 페이로드 생성(`rebalance_approval`), 자동화 레벨 1은 자동 승인.

### 3.4 Trading Agent (주문 + HITL)
- 소스: `src/agents/trading/graph.py:1`, `nodes.py`, `state.py`
- 플로우: `prepare_trade → [buy_specialist|sell_specialist] → risk_reward_calculator → approval_trade(HITL) → (execute_trade|END)`
- 특징:
  - `prepare_trade_node`가 LLM으로 주문 의도/수량/유형을 파싱하고 DB에 pending order 생성.
  - `approval_trade_node`에서 LangGraph `interrupt` 호출로 승인 대기. `automation_level==1` 또는 preset에 따른 조건부 자동 승인 지원.
  - 승인 결과에 따라 `execute_trade_node`가 `trading_service.execute_order` 호출.

### 3.5 Risk Agent, Monitoring Agent
- Risk: 단일 노드 평가(변동성/집중도/섹터 노출 등)로 Research/Portfolio와 보완적.
- Monitoring: 백그라운드 전용. 포트폴리오 보유 종목의 뉴스 수집→분석→알림 생성. 사용자 직접 호출 금지 원칙이 Supervisor 프롬프트에 명시.

## 4) 라우팅: Supervisor vs Router Agent

- Supervisor 프롬프트에 라우팅 원칙/시나리오가 상세히 내장되어 있음(`graph_master.py`).
- 별도의 Router Agent(`src/agents/router/router_agent.py`)도 존재하여 질의 복잡도, 대상 에이전트, 깊이, 개인화 설정을 Pydantic 스키마로 산출.
- SSE 멀티스트림 엔드포인트(`src/api/routes/multi_agent_stream.py`)에서는 Router를 먼저 호출해 `agents_to_call`을 도출하고, 필요 시 종목코드를 해석 후 각 서브그래프를 개별 실행/스트림 전송.
- 결론: “Supervisor 내장 라우팅”과 “외부 Router 선행”의 두 경로가 공존. 스트리밍 UI 친화성 측면에서는 후자(명시적인 이벤트 시퀀스)가 유리, 단일 호출 경로(레거시/동기)는 Supervisor 경로가 간결.

## 5) HITL(승인) 설계

- 설정 스키마: `src/schemas/hitl_config.py:1`
  - 프리셋: `pilot(조건부 거래 승인) / copilot(포트폴리오+거래 승인) / advisor(전략+포트폴리오+거래 승인)`
  - `level_to_config`/`config_to_level`로 레거시 `automation_level(1~3)`과 상호 변환 지원.
- Trading: `approval_trade_node`에서 인터럽트. payload에 주문 요약/금액/비중 변화 등을 포함.
- Portfolio: `approval_rebalance_node`에서 인터럽트. 리밸런싱 후보/제약 검증/리스크 경고를 포함한 payload 생성.
- 승인 이력 API: `src/api/routes/approvals.py` — 목록/상세 조회. 생성은 `chat.py` 내 `_save_approval_request_to_db` 경로에서 수행.

## 6) SSE 스트리밍 이벤트(멀티 에이전트)

- 소스: `src/api/routes/multi_agent_stream.py:1`
- 이벤트 시퀀스(예시):
  - `master_start` → `user_profile` → `master_routing` →
    반복(`agent_start` → `agent_node`/`agent_llm_start`/`agent_llm_stream`/`agent_llm_end` → `agent_complete`) →
    `master_aggregating` → `master_complete` (또는 `error`)
- 구현 포인트:
  - 각 서브그래프를 `astream_events(version="v2")`로 구독해 세분화된 진행 상태를 SSE로 전송.
  - Research/Strategy/Risk/Trading/Portfolio별 결과를 수집 후 `_format_agent_results`로 요약 텍스트 구성.
  - 종목코드 해석 실패 시 clarification 메시지로 일반 에이전트로 폴백.

## 7) LLM Provider/캐시/체크포인트

- 소스: `src/utils/llm_factory.py:1`
- Provider 선택: `settings.llm_provider`에 따라 OpenAI→Anthropic→Google 순 폴백. 키 미설정 시 안전한 예외/경고 처리.
- 루프 분리: 이벤트 루프/스레드 단위 토큰으로 LLM 인스턴스 캐시(`@lru_cache(maxsize=16)`) 충돌 방지.
- 시맨틱 캐시: 옵션으로 Redis Semantic Cache 초기화. RediSearch 미존재 시 key-value RedisCache→InMemoryCache 폴백.
- 체크포인터: Supervisor에서 memory/redis 선택. Redis 미설치·비동기 초기화 이슈 시 명시적 경고/폴백.

## 8) 서비스 계층과 외부 연동

- Trading Service: `src/services/trading_service.py`
  - `create_pending_order` → 승인 후 `execute_order`로 주문 확정(실거래는 KIS API 연동 분기/에뮬레이션 지원).
  - 주문/거래/포트폴리오 스냅샷 업데이트를 DB 트랜잭션으로 보장.
- Portfolio Optimizer: `src/services/portfolio_optimizer.py` — 목표 비중/메트릭 산출 후 검증/리밸런싱 계획과 연결.
- Stock/News/Macro: `stock_data_service`, `news_crawler_service`, `bok_service`, `kis_service` 등 데이터 수집·가공 모듈.
- Chat/History: `chat_history_service`로 세션 요약/최근 대화 등 관리(프론트 LNB 히스토리와 연동).

## 9) 에러 처리/복원력

- API 글로벌 핸들러: `src/api/error_handlers.py`로 표준 에러 응답 통일.
- SSE 내부 예외: 에이전트별 try/except로 `agent_complete`에 에러 결과를 담아 전송하여 스트림 끊김을 최소화.
- DB/외부 서비스 오류: 서비스 계층에서 예외 메시지 축약/로깅, 안전한 롤백 수행.

## 10) 보안/컴플라이언스 관점 시사점

- HITL 강제: 거래/리밸런싱에 승인 지점 명시. `pilot` 프리셋도 고위험 자동화 방지용 조건부 승인 설계.
- 설명가능성: Research/Strategy 단계별 산출물/근거를 상태에 명시해 감사 추적성 강화.
- 결정권 경계: Supervisor는 조율만, 도구 실행/데이터 변형은 서브그래프+서비스 계층으로 엄격 분리.

## 11) 프론트엔드와의 계약 정합성

- 프론트 기준(HAMA-frontend-v2):
  - SSE 엔드포인트: `POST /api/v1/chat/multi-stream` — `event:`/`data:` 규약, `[DONE]` 처리를 포함한 스트림 파서와 호환됨.
  - HITL 패널: `approval_trade`/`rebalance_approval` 인터럽트 페이로드를 수신하여 패널 오픈, 승인/거부/수정에 따라 후속 호출.
  - “Demo/Live” 토글: Demo에서는 백엔드 미연결 시에도 UI 동작, Live에서만 실제 API 연동(백엔드가 해당 엔드포인트 제공).

## 12) 개선 제안(우선순위 순)

1) 라우팅 일원화/역할 경계 명확화
- 현재 Supervisor 프롬프트 라우팅과 Router Agent가 공존. 운영 모드별 권장 경로를 문서화하거나 설정 플래그로 일원화하면 유지보수성 향상.

2) Checkpointer 운영 가이드
- RedisSaver 비동기 초기화 제약으로 인한 폴백 경고가 존재. 프로덕션 가이드(연결 풀, 만료, 메모리 사용량)를 `docs/`에 명시 권장.

3) 이벤트 스키마 스냅샷 문서화
- `multi_agent_stream`의 `event`/`data` 페이로드 스키마를 명세화하여 프론트/QA와 공유. (예: `agent_node`의 `node_name`, `agent_llm_stream`의 토큰/델타 규격)

4) 승인가능 옵션/리스크 기준 상수화
- Portfolio/Trading HITL에서 자동 승인 조건(예: 소액/저위험)을 설정파일로 외부화, 운영 중 조정 가능하게.

5) 도구/서비스 호출 타임아웃/리트라이 표준화
- 외부 연동(KIS/뉴스/증권 데이터)에 공통 백오프/타임아웃/서킷브레이커 유틸을 적용해 복원력 강화.

6) 모니터링 Agent 트리거 정의
- 현재 배경 전용으로 설계. 스케줄/이벤트 트리거/중복 실행 방지 정책을 Celery/큐 기준으로 문서화/구현 점검.

---

부록 A — 주요 파일 인덱스
- Supervisor: `src/agents/graph_master.py:1`
- Research: `src/agents/research/graph.py:1`, `state.py`, `nodes.py`
- Strategy: `src/agents/strategy/graph.py:1`, `state.py`, `nodes.py`
- Portfolio: `src/agents/portfolio/graph.py:1`, `state.py`, `nodes.py`
- Trading: `src/agents/trading/graph.py:1`, `state.py`, `nodes.py`
- Monitoring: `src/agents/monitoring/graph.py:1`, `state.py`, `nodes.py`
- Router: `src/agents/router/router_agent.py:1`
- SSE Endpoint: `src/api/routes/multi_agent_stream.py:1`
- Chat/Approval: `src/api/routes/chat.py:1`, `src/api/routes/approvals.py:1`
- State Schema: `src/schemas/graph_state.py:1`, `src/schemas/hitl_config.py:1`
- LLM Factory: `src/utils/llm_factory.py:1`

