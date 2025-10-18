## 1. [chat](https://www.google.com/search?q=http://localhost:8000/docs%23/chat)

대화 생성, 히스토리 조회, 승인 처리를 담당하는 엔드포인트 모음입니다.

### `POST /api/v1/chat/`

**Chat (메인 채팅 엔드포인트)**

설명:

메인 채팅 엔드포인트입니다.

처리 흐름:

1. 마스터 에이전트가 질의를 수신합니다.
    
2. 적절한 서브 에이전트를 선택해 작업을 분배합니다.
    
3. 서브 에이전트가 결과를 생성합니다.
    
4. 마스터 에이전트가 결과를 통합합니다.
    
5. HITL 조건을 확인하고 응답을 생성합니다.
    
6. 중단 지점이 있는 경우 승인 요청을 반환합니다.
    

Parameters:

No parameters

Request body:

(Based on "채팅 요청 스키마")

JSON

```
{
  "message": "string",
  "conversation_id": "string",
  "automation_level": 2
}
```

- `message` (string, **required**): 사용자 채팅 메시지.
    
- `conversation_id` (string | null): 기존 대화의 ID. (null이거나 제공되지 않으면 새 대화 시작)
    
- `automation_level` (integer, **required**): 자동화 레벨.
    
    - `1`: Pilot
        
    - `2`: Copilot (Default)
        
    - `3`: Advisor
        
    - _(Constraint: [1, 3])_
        

**Responses:**

- Code 200 (Successful Response):
    
    (Based on "채팅 응답 스키마")
    
    JSON
    
    ```
    {
      "message": "string",
      "conversation_id": "string",
      "requires_approval": false,
      "approval_request": {
        "additionalProp1": {}
      },
      "metadata": {
        "additionalProp1": {}
      }
    }
    ```
    
    - `message` (string): AI의 응답 메시지.
        
    - `conversation_id` (string): 현재 대화의 ID.
        
    - `requires_approval` (boolean): 사용자 승인 필요 여부 (Default: false).
        
    - `approval_request` (object | null): 승인이 필요한 경우 관련 정보 (Additional properties allowed).
        
    - `metadata` (object | null): 기타 메타데이터 (Additional properties allowed).
        
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `GET /api/v1/chat/history/{conversation_id}`

**Get Chat History**

설명:

특정 대화의 메시지 히스토리를 조회합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`conversation_id`|path|string|**Yes**|조회할 대화의 ID|
|`limit`|query|integer|No|가져올 메시지 수. _Default value_ : 100 _maximum_: 500, _minimum_: 1|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 이는 JSON 배열 형태의 문자열이거나 혹은 API 문서의 오류일 수 있으나, 명세상 타입은 `string`입니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `DELETE /api/v1/chat/history/{conversation_id}`

**Delete Chat History**

설명:

특정 대화 히스토리를 영구 삭제합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`conversation_id`|path|string|**Yes**|삭제할 대화의 ID|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 통상적으로 삭제 성공 시 상태 메시지나 ID를 반환할 수 있습니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `GET /api/v1/chat/sessions`

**List Chat Sessions**

설명:

최근 활동 순으로 정렬된 채팅 세션 목록을 반환합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`limit`|query|integer|No|가져올 세션 수. _Default value_ : 50 _maximum_: 100, _minimum_: 1|

Request body:

No request body

**Responses:**

- Code 200 (Successful Response):
    
    (Based on "채팅 세션 요약 스키마")
    
    JSON
    
    ```
    [
      {
        "conversation_id": "string",
        "title": "string",
        "last_message": "string",
        "last_message_at": "string",
        "automation_level": 0,
        "message_count": 0,
        "created_at": "string"
      }
    ]
    ```
    
    - `conversation_id` (string)
        
    - `title` (string)
        
    - `last_message` (string | null)
        
    - `last_message_at` (string | null, format: date-time)
        
    - `automation_level` (integer)
        
    - `message_count` (integer)
        
    - `created_at` (string | null, format: date-time)
        
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `POST /api/v1/chat/approve`

**Approve Action**

설명:

승인 혹은 거부 결정을 처리하는 엔드포인트입니다.

처리 흐름:

1. thread_id를 통해 중단된 그래프 상태를 조회합니다.
    
2. 결정 값에 따라 Command(resume=...)를 전달합니다.
    
3. 그래프를 재개하고 최종 결과를 반환합니다.
    

Parameters:

No parameters

Request body:

(Based on "승인 요청 스키마")

JSON

```
{
  "thread_id": "string",
  "decision": "string",
  "automation_level": 2,
  "modifications": {
    "additionalProp1": {}
  },
  "user_notes": "string"
}
```

- `thread_id` (string, **required**): 대화 스레드 ID.
    
- `decision` (string, **required**): 승인 결정: `approved`, `rejected`, `modified`.
    
- `automation_level` (integer, **required**): 자동화 레벨 (Default: 2, Constraint: [1, 3]).
    
- `modifications` (object | null): 사용자가 수정한 내용 (Additional properties allowed).
    
- `user_notes` (string | null): 사용자가 남긴 메모.
    

**Responses:**

- Code 200 (Successful Response):
    
    (Based on "승인 응답 스키마")
    
    JSON
    
    ```
    {
      "status": "string",
      "message": "string",
      "conversation_id": "string",
      "result": {
        "additionalProp1": {}
      }
    }
    ```
    
    - `status` (string): 처리 상태.
        
    - `message` (string): 처리 결과 메시지.
        
    - `conversation_id` (string): 관련 대화 ID.
        
    - `result` (object | null): 최종 실행 결과 (Additional properties allowed).
        
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

## 2. [portfolio](https://www.google.com/search?q=http://localhost:8000/docs%23/portfolio)

포트폴리오 요약과 리밸런싱 등 자산 관리 기능을 위한 엔드포인트입니다.

### `GET /api/v1/portfolio/{portfolio_id}`

**Get Portfolio**

설명:

Get portfolio details

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`portfolio_id`|path|string|**Yes**|조회할 포트폴리오 ID|

Request body:

No request body

**Responses:**

- Code 200 (Successful Response):
    
    (Based on "Portfolio summary" and "Portfolio position" schemas)
    
    JSON
    
    ```
    {
      "portfolio_id": "string",
      "total_value": "string",
      "cash_balance": "string",
      "invested_amount": "string",
      "total_return": "string",
      "positions": [
        {
          "stock_code": "string",
          "stock_name": "string",
          "quantity": 0,
          "average_price": "string",
          "current_price": "string",
          "market_value": "string",
          "unrealized_pnl": "string",
          "unrealized_pnl_rate": "string",
          "weight": "string",
          "sector": "string"
        }
      ],
      "risk_profile": "string",
      "last_updated": "string"
    }
    ```
    
    - `portfolio_id` (string)
        
    - `total_value` (string)
        
    - `cash_balance` (string)
        
    - `invested_amount` (string)
        
    - `total_return` (string)
        
    - `positions` (array of objects):
        
        - `stock_code` (string)
            
        - `stock_name` (string)
            
        - `quantity` (integer | null)
            
        - `average_price` (string | null)
            
        - `current_price` (string | null)
            
        - `market_value` (string | null)
            
        - `unrealized_pnl` (string | null)
            
        - `unrealized_pnl_rate` (string | null)
            
        - `weight` (string | null)
            
        - `sector` (string | null)
            
    - `risk_profile` (string | null)
        
    - `last_updated` (string | null, format: date-time)
        
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `GET /api/v1/portfolio/{portfolio_id}/performance`

**Get Portfolio Performance**

설명:

Get portfolio performance metrics

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`portfolio_id`|path|string|**Yes**|성과를 조회할 포트폴리오 ID|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 성과 지표가 포함된 JSON 객체를 문자열로 반환할 수 있습니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `POST /api/v1/portfolio/{portfolio_id}/rebalance`

**Rebalance Portfolio**

설명:

Request portfolio rebalancing

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`portfolio_id`|path|string|**Yes**|리밸런싱을 요청할 포트폴리오 ID|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 리밸런싱 요청 결과(예: 작업 ID 또는 상태 메시지)를 반환할 수 있습니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

## 3. [stocks](https://www.google.com/search?q=http://localhost:8000/docs%23/stocks)

종목 검색 및 시세 조회와 같은 주식 데이터 관련 API입니다.

### `GET /api/v1/stocks/search`

**Search Stocks**

설명:

종목명 또는 종목코드로 주식을 검색합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`q`|query|string|**Yes**|검색어 (종목명 또는 종목코드) _minLength_: 1|
|`market`|query|string|No|검색할 시장. _Default value_ : KOSPI|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 검색 결과(예: 종목 배열)가 포함된 JSON을 문자열로 반환할 수 있습니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `GET /api/v1/stocks/{stock_code}`

**Get Stock Info**

설명:

특정 종목의 기본 정보를 조회합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`stock_code`|path|string|**Yes**|조회할 종목의 코드|
|`market`|query|string|No|종목이 속한 시장. _Default value_ : KOSPI|

Request body:

No request body

**Responses:**

- Code 200 (Successful Response):
    
    (Based on "주식 기본 정보" schema)
    
    JSON
    
    ```
    {
      "stock_code": "string",
      "stock_name": "string",
      "market": "string",
      "sector": "string",
      "current_price": "string",
      "change_rate": "string",
      "volume": 0
    }
    ```
    
    - `stock_code` (string)
        
    - `stock_name` (string)
        
    - `market` (string)
        
    - `sector` (string | null)
        
    - `current_price` (string | null)
        
    - `change_rate` (string | null)
        
    - `volume` (integer | null)
        
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `GET /api/v1/stocks/{stock_code}/price-history`

**Get Price History**

설명:

특정 종목의 기간별 주가 히스토리를 반환합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`stock_code`|path|string|**Yes**|조회할 종목의 코드|
|`days`|query|integer|No|조회할 기간(일 수). _Default value_ : 30 _maximum_: 365, _minimum_: 1|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 주가 히스토리(예: 날짜별 시/고/저/종가 배열)가 포함된 JSON을 문자열로 반환할 수 있습니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

### `GET /api/v1/stocks/{stock_code}/analysis`

**Get Stock Analysis**

설명:

리서치 에이전트를 호출해 종합 종목 분석을 제공합니다.

**Parameters:**

|**Name**|**In**|**Type**|**Required**|**Description**|
|---|---|---|---|---|
|`stock_code`|path|string|**Yes**|분석할 종목의 코드|

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`으로 명시되어 있습니다. 종합 분석 리포트(텍스트 또는 구조화된 JSON)를 문자열로 반환할 수 있습니다.)_
    
- **Code 422 (Validation Error):**
    
    JSON
    
    ```
    {
      "detail": [
        {
          "loc": [ "string", 0 ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```
    

---

## 4. [default](https://www.google.com/search?q=http://localhost:8000/docs%23/default)

애플리케이션 상태 확인을 위한 기본 엔드포인트입니다.

### `GET /`

**Root**

설명:

애플리케이션 기본 상태를 확인하는 엔드포인트입니다.

Parameters:

No parameters

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`입니다. "HAMA API v1 Running"과 같은 상태 메시지를 반환할 수 있습니다.)_
    

---

### `GET /health`

**Health**

설명:

데이터베이스 연결 여부 등 상세 상태를 확인하는 엔드포인트입니다.

Parameters:

No parameters

Request body:

No request body

**Responses:**

- **Code 200 (Successful Response):**
    
    JSON
    
    ```
    "string"
    ```
    
    _(참고: 문서상 반환 타입이 `string`입니다. `{"status": "ok", "db": "connected"}`와 같은 상세 상태 JSON을 문자열로 반환할 수 있습니다.)_