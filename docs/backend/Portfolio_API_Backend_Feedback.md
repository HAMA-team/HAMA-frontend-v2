# Portfolio API 백엔드 피드백

> **작성일**: 2025-10-30
> **목적**: Portfolio API 실제 테스트 결과를 바탕으로 백엔드 수정사항 정리
> **우선순위**: Critical > High > Medium > Low

---

## 📋 요약

5개의 Portfolio API를 실제 테스트한 결과, **3개 API에서 OpenAPI 스펙과 실제 응답 간 불일치 발견**.

### ✅ 정상 작동
- `GET /api/v1/portfolio/` - 완벽 일치
- `POST /api/v1/portfolio/{id}/rebalance` - 테스트 미완료 (POST)

### ⚠️ 수정 필요
- `GET /api/v1/portfolio/chart-data` - **Critical** (완전 불일치)
- `GET /api/v1/portfolio/{id}/performance` - **High** (부분 불일치 + null 필드)
- `GET /api/v1/portfolio/{id}` - **Low** (Decimal → string 변환만)

---

## 🔴 Critical Priority

### 1. `/chart-data` 중복 핸들러 제거

**파일**: `src/api/routes/portfolio.py`

**문제**:
- 같은 엔드포인트가 **2번 정의됨** (line 379, line 539)
- FastAPI는 **나중 정의 우선** → line 539 핸들러가 실행됨
- OpenAPI 스펙과 실제 응답 구조가 **완전히 다름**

**코드 위치**:
```python
# Line 379-487: 첫 번째 핸들러 (response_model=PortfolioChartData)
@router.get("/chart-data", response_model=PortfolioChartData)
async def get_portfolio_chart_data():
    ...
    return PortfolioChartData(
        stocks=stocks_data,  # List[StockChartData]
        total_value=total_value,  # float
        ...
    )

# Line 539-710: 두 번째 핸들러 (실제 실행됨, portfolio_id 파라미터 있음!)
@router.get("/chart-data")
async def get_portfolio_chart_data(portfolio_id: str):
    ...
    return {
        "stocks": stocks_data,  # 구조 다름
        "total_value": total_value,
        "sectors": sector_weights,  # 구조 완전 다름!
        ...
    }
```

**실제 응답 vs OpenAPI 스펙 차이**:

| 필드 | OpenAPI 스펙 | 실제 응답 (line 539) | 문제 |
|------|-------------|---------------------|------|
| `stocks` | `List[StockChartData]` | 구조 다름 (`positions`) | ❌ 필드명 자체가 다름 |
| `total_value` | `float` | `string` ("10000000.0") | ❌ 타입 불일치 |
| `sectors` | `Dict[str, float]` | `Dict[str, object]` | ❌ value가 object (weight/value/color) |
| `cash` | `float` | 없음 | ⚠️ 응답에 없음 |
| `total_return` | `float` | 있음 | ⚠️ 스펙에 없음 |
| `risk_profile` | 없음 | 있음 ("moderate") | ⚠️ 스펙에 없음 |

**수정 방법**:

**옵션 1 (권장)**: 첫 번째 핸들러 삭제 + 두 번째 핸들러를 스펙에 맞게 수정
```python
# Line 379-487 전체 삭제

# Line 539: response_model 추가 + 응답 구조 수정
@router.get("/chart-data", response_model=PortfolioChartData)
async def get_portfolio_chart_data():  # portfolio_id 파라미터 제거 (항상 default 사용)
    """
    포트폴리오 차트용 데이터 (Treemap, Pie Chart)
    """
    # ... (기존 로직 유지)

    # 섹터 구조 수정: object → float (비중만)
    sector_weights_simple = {k: v["weight"] for k, v in sector_weights.items()}

    return PortfolioChartData(
        stocks=stocks_data,  # List[StockChartData] 유지
        total_value=float(total_value),  # string → float
        total_return=float(total_return),
        total_return_percent=round(total_return_percent, 2),
        cash=float(cash_balance),
        sectors=sector_weights_simple  # Dict[str, float]
    )
```

**옵션 2**: 두 번째 핸들러 삭제 + OpenAPI 스펙 업데이트
- 만약 line 539 구조가 더 낫다면, `openapi.json` 수정
- 하지만 **프론트엔드가 이미 스펙 기준으로 구현됨** → 비추천

**예상 작업 시간**: 30분

---

### 2. `/chart-data` 섹터 정보 실제 조회

**파일**: `src/api/routes/portfolio.py` line 453-454, line 633

**문제**:
```python
# 현재: Mock 함수 사용
sector = get_sector(stock_code)  # line 28: return "기타"
```
- `get_sector()` 함수가 항상 `"기타"` 반환
- 실제 섹터 정보 무시됨

**해결 방법**:

**Step 1**: Stock 테이블에서 섹터 조회
```python
# Line 453-454 수정
# ❌ Before
sector = get_sector(stock_code)

# ✅ After
stock_record = stocks.get(stock_code)  # stocks는 line 218-224에서 이미 조회됨
sector = stock_record.sector if stock_record and stock_record.sector else "기타"
```

**Step 2**: 두 번째 핸들러(line 633)도 동일 수정
```python
# Line 633 수정
# ✅ After
stock_record = await stock_data_service.get_stock_info(stock_code)
sector = stock_record.get("sector", "기타") if stock_record else "기타"
```

**데이터 소스**:
- `src/models/stock.py`의 `Stock` 테이블에 `sector` 필드 있음
- KIS API 동기화 시 섹터 정보도 함께 저장 필요
- 또는 DART API (`src/services/dart_service.py`) 활용

**예상 작업 시간**: 1시간 (DART API 연동 포함)

---

## 🟠 High Priority

### 3. `/performance` null 필드 계산

**파일**: `src/api/routes/portfolio.py` line 339-376

**문제**:
```json
{
  "annual_return": null,
  "sharpe_ratio": null,
  "observations": null
}
```

**원인 분석**:

1. **`annual_return`** (line 352-355)
   ```python
   average_daily_return = market_data.get("average_daily_return")
   annual_return = (
       average_daily_return * 252 if isinstance(average_daily_return, (int, float)) else None
   )
   ```
   - `market_data`에 `average_daily_return`이 없으면 `None`
   - `_compute_market_metrics()`에서 계산됨 (line 392: `"average_daily_return": average_return`)
   - **이미 계산 로직 존재함!** → 문제 없음

2. **`sharpe_ratio`** (line 368)
   ```python
   "sharpe_ratio": market_data.get("sharpe_ratio")
   ```
   - `_compute_market_metrics()`에서 계산 안 함!
   - **수정 필요**

3. **`observations`** (line 373)
   ```python
   "observations": market_data.get("observations")
   ```
   - line 395에서 이미 계산됨: `"observations": len(weighted_returns)`
   - **문제 없음**

**수정 방법**:

**Line 333-398 `_compute_market_metrics()` 수정**:
```python
# Line 389-398: Sharpe Ratio 계산 추가
beta_map = await self._estimate_betas(returns_df, valid_codes)

# ✅ Sharpe Ratio 계산 추가
risk_free_rate = 0.035  # 연 3.5% (한국 국채 10년물 기준, 설정 파일로 분리 권장)
daily_risk_free = risk_free_rate / 252
excess_return = average_return - daily_risk_free
sharpe_ratio = (excess_return / portfolio_volatility) if portfolio_volatility > 0 else None

return {
    "portfolio_volatility": portfolio_volatility,
    "var_95": var_95,
    "average_daily_return": average_return,
    "sharpe_ratio": sharpe_ratio,  # ✅ 추가
    "max_drawdown_estimate": max_drawdown,
    "beta": beta_map,
    "observations": len(weighted_returns),
    "returns_window": weighted_returns.tolist(),
    "returns_dates": [idx.strftime("%Y-%m-%d") for idx in weighted_returns.index],
}
```

**예상 작업 시간**: 15분

---

### 4. Beta 필드 타입 명확화

**파일**: `docs/backend/openapi.json` + 프론트엔드 매핑

**문제**:
- OpenAPI 스펙: `beta: number` (단일 값)
- 실제 응답: `beta: object` (종목별 베타)
  ```json
  {
    "beta": {
      "005930": 1.1,
      "000660": 1.3,
      "005380": 0.9
    }
  }
  ```

**해결 방법**:

**옵션 1 (권장)**: OpenAPI 스펙 수정
```json
{
  "beta": {
    "type": "object",
    "description": "종목별 베타 계수 (KOSPI 대비)",
    "additionalProperties": {
      "type": "number"
    }
  }
}
```

**옵션 2**: 포트폴리오 전체 베타 계산하여 반환
```python
# Line 364-376 수정
beta_map = await self._estimate_betas(returns_df, valid_codes)

# 가중평균 베타 계산
portfolio_beta = sum(beta_map.get(code, 1.0) * weights[code] for code in valid_codes)

response = {
    ...
    "beta": portfolio_beta,  # 단일 값
    "beta_by_stock": beta_map,  # 종목별 (추가 필드)
    ...
}
```

**권장**: 옵션 1 (스펙 수정) + 프론트엔드에서 가중평균 계산

**예상 작업 시간**: 5분 (스펙 수정만)

---

## 🟡 Medium Priority

### 5. `/` 섹터 정보 실제 활용

**파일**: `src/api/routes/portfolio.py` line 245-256

**현황**:
- Backend: 섹터 정보 제공함 (`allocation.sectors`)
- Frontend: **무시함** (하드코딩: `sector: ""`)

**백엔드 개선사항**:
```python
# Line 245-256: 섹터 정보 계산
sector_map = portfolio_data.get("sectors") or {}
sectors: List[AllocationItem] = []
for name, ratio in sector_map.items():
    ratio_value = _float(ratio)
    value = total_value * ratio_value if total_value else 0.0
    sectors.append(
        AllocationItem(
            name=name,
            value=value,
            percentage=ratio_value * 100.0,
        )
    )
```

**문제**:
- `portfolio_data.get("sectors")`가 어디서 채워지는지?
- Line 270: `"sectors": sector_breakdown` (line 241-244에서 계산)
- Line 328-329: `sector_totals[sector] += market_value`
- Line 311: `sector = stock.sector if stock and stock.sector else "기타"`

**결론**: 백엔드는 정상 작동 중! **프론트엔드 수정 필요** (별도 이슈)

---

## 🟢 Low Priority

### 6. Decimal → String 변환 문서화

**파일**: 여러 파일

**현황**:
- 모든 숫자 필드가 Decimal로 계산됨
- JSON 직렬화 시 **자동으로 string 변환됨**
- 예: `"10000000.0"` (OpenAPI: `number`)

**원인**:
```python
# Pydantic 기본 직렬화 방식
total_value: Decimal  # → JSON: "10000000.0"
```

**해결 방법**:

**옵션 1**: Pydantic 설정 변경
```python
# src/api/routes/portfolio.py 또는 전역 설정
from pydantic import BaseModel, ConfigDict

class PortfolioSummary(BaseModel):
    model_config = ConfigDict(
        json_encoders={Decimal: float}  # Decimal → float 변환
    )
```

**옵션 2**: 명시적 float 변환
```python
# Line 327-336 수정
return PortfolioSummary(
    portfolio_id=str(portfolio_data.get("portfolio_id") or portfolio_id),
    total_value=float(total_value),  # ✅ 명시적 변환
    cash_balance=float(cash_balance),
    invested_amount=float(invested_amount),
    total_return=float(total_return),
    ...
)
```

**권장**: 옵션 2 (명시적 변환) - 더 안전

**예상 작업 시간**: 10분

---

## 📊 작업 우선순위 요약

| 순위 | 항목 | 작업 시간 | 중요도 | 난이도 |
|------|------|----------|--------|--------|
| 1 | `/chart-data` 중복 핸들러 제거 | 30분 | Critical | 쉬움 |
| 2 | `/chart-data` 섹터 정보 실제 조회 | 1시간 | Critical | 보통 |
| 3 | `/performance` Sharpe Ratio 계산 | 15분 | High | 쉬움 |
| 4 | Beta 필드 타입 명확화 (스펙 수정) | 5분 | High | 매우 쉬움 |
| 5 | Decimal → float 명시적 변환 | 10분 | Low | 쉬움 |

**총 예상 작업 시간**: 약 2시간

---

## 🔍 테스트 체크리스트

수정 후 다음 항목 확인:

### `/chart-data`
- [ ] 중복 핸들러 제거 확인 (`grep -n "@router.get(\"/chart-data\")" portfolio.py`)
- [ ] 응답 타입: `total_value`가 `float`인지 확인
- [ ] 응답 구조: `sectors`가 `Dict[str, float]`인지 확인
- [ ] 섹터 정보: 실제 종목 섹터가 반영되는지 확인 (삼성전자 → "반도체")

### `/performance`
- [ ] `sharpe_ratio`가 `null`이 아닌 숫자인지 확인
- [ ] `annual_return` 계산 정상 작동 확인
- [ ] `observations` 값 확인 (60일 데이터면 ~60)

### `/{id}`
- [ ] 모든 숫자 필드가 `float` 타입인지 확인 (Postman/curl)

---

## 📝 참고 자료

- **OpenAPI 스펙**: `docs/backend/openapi.json`
- **테스트 결과**: `docs/qa/Portfolio_API_Complete_Design.md`
- **프론트엔드 매핑**: `src/lib/api/portfolio.ts`
- **백엔드 코드**:
  - `src/api/routes/portfolio.py` (라우터)
  - `src/services/portfolio_service.py` (비즈니스 로직)
  - `src/schemas/portfolio.py` (Pydantic 스키마)

---

## ✅ 완료 체크

- [ ] Critical 항목 2개 수정
- [ ] High 항목 2개 수정
- [ ] 로컬 테스트 완료 (curl 또는 Postman)
- [ ] OpenAPI 스펙 업데이트 (`openapi.json`)
- [ ] 프론트엔드 팀에 변경사항 공지

---

**작성자**: Claude (Frontend QA)
**검토 필요**: Backend 개발자
