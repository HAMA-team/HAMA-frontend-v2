# 🧪 Trade Approval HITL 디버깅 메모

## 현상
- 엔드포인트: `POST /api/v1/chat/approve`
- 프론트 요청 예시:
  - `thread_id: "6401f988-14ed-480d-ba5c-b6e480c04bc4"`
  - `decision: "approved"`
  - `request_id: "59ca3600-9aac-4f4d-9a33-f9cd91747841"`
  - `modifications: { stock_code, stock_name, quantity, price, action, total_amount }`
- 서버 에러 로그:
  - `Approval processing error: 'NoneType' object has no attribute 'get'`

## 1차 원인 (hitl_config 누락)
- 위치: `src/api/routes/chat.py` 의 `approve_action`
- 문제:
  - `handle_hitl_interrupt(..., hitl_config=hitl_config)` 를 호출하면서
  - `hitl_config` 변수를 함수 내부에서 초기화하지 않아서, 내부 로직에서 `None.get(...)` 형태로 크래시.
- 패치 방향:
  - `ChatSession.session_metadata` 에 저장된 `hitl_config` 를 복원하거나, 없으면 `HITLConfig()` 기본값 사용.
  - 예시:
    ```python
    session_row = (
        db.query(ChatSession)
        .filter(ChatSession.conversation_id == conversation_uuid)
        .first()
    )
    intervention_required = False
    hitl_config = HITLConfig()  # 기본값

    if session_row and session_row.session_metadata:
        intervention_required = session_row.session_metadata.get("intervention_required", False)
        if "hitl_config" in session_row.session_metadata:
            hitl_config = HITLConfig(**session_row.session_metadata["hitl_config"])
    ```

## 2차 원인 후보 (final_response None 방어 부족)
- 위치: `src/api/routes/chat.py` 의 `approve_action` 하단부
  ```python
  result = await configured_app.ainvoke(resume_command)
  state_after_resume = await configured_app.aget_state()
  ...
  final_response = result.get("final_response", {})
  message_text = _trade_summary(final_response)
  ```
- 문제 가능성:
  1. `result` 자체가 `None` 인 경우 → `result.get(...)` 에서 `'NoneType'.get` 발생
  2. `result["final_response"]` 가 `None` 인 경우 → `_trade_summary(None)` 호출 → `payload.get(...)` 에서 `'NoneType'.get` 발생
- 참고:
  - 스트리밍 엔드포인트(`multi_agent_stream`)에서는 이미 아래처럼 방어적으로 처리:
    ```python
    final_response = state_values.get("final_response") or {}
    if isinstance(final_response, dict):
        message = final_response.get("message")
    ```
- 방어 패턴 제안:
  ```python
  result_dict = result or {}
  final_response = result_dict.get("final_response") or {}
  if not isinstance(final_response, dict):
      final_response = {}

  message_text = _trade_summary(final_response)
  ```

  ```python
  def _trade_summary(payload: Dict[str, Any]) -> str:
      if not isinstance(payload, dict):
          payload = {}
      summary_text = payload.get("summary")
      trade = payload.get("trade_result") or {}
      ...
  ```

## 정리
- 프론트에서 보내는 Trading HITL 승인 payload는 `ApprovalRequest` 스키마와 호환됨:
  - `thread_id`, `decision`, `request_id`, `modifications` 구조 정상.
- 백엔드에서 재발하는 `'NoneType'.get` 은
  1) `hitl_config` 미초기화,
  2) `result` / `final_response` 가 `None` 인 경우를 방어하지 않은 부분
  두 군데에서 발생할 수 있음.
- 위 두 지점을 모두 방어하면, 동일 payload로 승인 호출 시 500 에러 없이 처리되도록 안정화 가능.

