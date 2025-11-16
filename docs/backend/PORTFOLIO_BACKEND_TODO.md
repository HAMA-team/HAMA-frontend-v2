# Portfolio Backend TODO (v2)

> 목적: Vercel Live 모드에서 확인된 포트폴리오 데이터 불일치(보유 종목 수/종목명/섹터/타입) 문제를 해소하기 위한 백엔드 수정 항목 정리
> 범위: Portfolio 관련 라우터/서비스/스키마/OpenAPI, 데이터 적재·조인

## **현황 요약**
- 라이브 응답 예시에서 보유 종목이 2개만 노출되고, `stock_name`이 숫자 코드로 반환됨.
- 섹터가 "기타"로만 집계되며, `/chart-data` 스펙과 실제 응답 구조 차이가 존재.
- 일부 수치가 Decimal 직렬화로 문자열화되거나, `/performance`의 지표가 null.
- 기본 엔드포인트(`/api/v1/portfolio/`)의 포트폴리오 resolve 정책으로 인해 사용자의 기대 포트폴리오가 아닌 스냅샷이 선택될 가능성 존재.

## **원인 가설(확인됨)**
- 종목 메타 조인 실패 시 `stock_name = stock_code` 폴백 적용: `..\\HAMA-backend\\src\\services\\portfolio_service.py:311` 부근.
- 섹터 조회에 목 함수 사용으로 항상 "기타": `..\\HAMA-backend\\src\\api\\routes\\portfolio.py:28` 정의된 `get_sector()` 경유 코드 경로.
- `/chart-data` 중복 핸들러 정의로 스펙 불일치: `..\\HAMA-backend\\src\\api\\routes\\portfolio.py:379`, `:539`.
- Decimal → JSON 직렬화 시 문자열화 가능성.
- 포트폴리오 ID resolve가 데모/최초 포트폴리오로 귀결될 수 있음: `..\\HAMA-backend\\src\\services\\portfolio_service.py:62-139`.

## **해야 할 일 (Action Items)**

### **Critical**
- `/chart-data` 단일화 + 스펙 일치
  - 중복 라우트 제거: `..\\HAMA-backend\\src\\api\\routes\\portfolio.py:379`, `:539` 중 하나 정리.
  - 단일 핸들러에 `response_model=PortfolioChartData` 지정, OpenAPI와 구조 일치.
  - `sectors`는 `Dict[str, float]`(비중)으로 간소화. 색상/가치는 별도 필드가 아니라면 제외.
  - 모든 수치는 `float`로 반환(Decimal 명시 변환).

- 섹터/종목명 실제 데이터로 채우기
  - `portfolio_service`에서 holdings 생성 시 `stocks` 테이블 조인으로 `stock_name`, `sector` 보장.
  - 목 함수 `get_sector()` 제거 또는 비활성화. 개요/차트 핸들러 모두 실제 섹터 사용.
  - KIS 동기화 시 신규 종목 코드는 `stocks` 테이블에 upsert.

### **High**
- `/performance` 지표 보강
  - `_compute_market_metrics()`에 Sharpe Ratio 계산 추가 후 응답에 포함.
  - `annual_return`이 null이 되지 않도록 방어.

- Decimal → float 변환 통일
  - 라우터 반환 시 명시적 `float()` 적용 또는 Pydantic `json_encoders={Decimal: float}` 설정.

- 포트폴리오 resolve 정책 명시화
  - `GET /api/v1/portfolio/`는 인증 사용자 컨텍스트의 기본 포트폴리오를 반환.
  - `portfolio_id` 명시 시(경로/쿼리), 해당 스냅샷 우선. 필요 시 `X-Portfolio-Id` 헤더도 허용.
  - 현재 `resolve_portfolio_id()` 로직 문서화 및 예외 케이스 보강.

### **Medium**
- OpenAPI 최신화
  - `/chart-data`의 응답 스키마를 실제 반환 구조와 일치시켜 문서 반영.
  - `/performance`의 `beta` 타입 명확화(맵 vs 단일 값). 맵이면 `additionalProperties: number`.

- 데이터 가용성 개선
  - `stocks` 테이블 시드/동기화(이름/섹터 최소치 포함). 결측 시 외부 서비스 조회 폴백(`stock_data_service`).

### **Low**
- 로깅/헬스체크 강화
  - 포트폴리오 스냅샷 생성 시 조인 실패/결측 카운트 경고 로그.
  - `/health`에 포트폴리오·마스터 테이블 간 간단한 정합성 수치 첨부(선택).

## **구체 수정 포인트**
- 파일: `..\\HAMA-backend\\src\\api\\routes\\portfolio.py:379` (첫 번째 chart-data)
- 파일: `..\\HAMA-backend\\src\\api\\routes\\portfolio.py:539` (두 번째 chart-data)
- 파일: `..\\HAMA-backend\\src\\services\\portfolio_service.py:282-315` (stock_name/sector 조인/폴백)
- 파일: `..\\HAMA-backend\\src\\models\\stock.py` (마스터 스키마 — sector/stock_name 존재)
- 파일: `..\\HAMA-backend\\src\\main.py:118-145` (CORS/문서 — 참고)

## **수정 가이드(예시 코드 스니펫)**
- Decimal → float 변환(예)
```python
# portfolio.py (응답 직전)
return PortfolioOverview(
    summary=PortfolioSummarySection(
        total_value=float(total_value),
        principal=float(principal),
        profit=float(profit),
        profit_rate=float(profit_rate),
        cash=float(cash),
        cash_percentage=float(cash_percentage),
        updated_at=market_data.get("last_updated"),
    ),
    holdings=holdings_payload,
    allocation=allocation,
)
```
- 섹터 실제 조회(예)
```python
# portfolio.py (chart-data)
# before: sector = get_sector(stock_code)
stock_record = stocks.get(stock_code) if 'stocks' in locals() else None
sector = (stock_record.sector if (stock_record and stock_record.sector)
          else ("현금" if stock_code.upper()=="CASH" else "기타"))
```
- `/chart-data` 단일화(예)
```python
@router.get("/chart-data", response_model=PortfolioChartData)
async def get_portfolio_chart_data():
    # ... (하나의 구현만 유지, sectors: Dict[str, float])
    return PortfolioChartData(
        stocks=stocks_data,
        total_value=float(total_value),
        total_return=float(total_return),
        total_return_percent=round(total_return_percent, 2),
        cash=float(cash),
        sectors={k: float(v) for k, v in sector_weights.items()},
    )
```

## **검증 체크리스트(AC)**
- Holdings 정합성
  - 기대 보유 종목 전량 노출(예: 삼성전자, CJ제일제당, CJ, 삼양식품, SK하이닉스, LG화학, JYP Ent., 삼성전자우 등).
  - `stock_name !== stock_code` 비율 100% (예외: 신규 상장 등 특수 케이스만 코드).
- 섹터/자산배분
  - `allocation.sectors`가 실제 섹터 분포 반영(“기타” 과도 비중 해소).
  - `/chart-data` `sectors` 타입은 `Dict[str, float]`, 총합≈1.0(현금 포함 시 1.0).
- 타입/스펙
  - 모든 수치 필드 JSON 타입이 number(float).
  - `/performance` `sharpe_ratio`/`annual_return` null 아님.
- OpenAPI
  - 문서와 실제 응답 구조/타입 일치(Postman/Swagger UI 확인).

## **테스트 커맨드(예시)**
- 포트폴리오 개요
```
curl -s "${BASE}/api/v1/portfolio/" | jq
```
- 특정 포트폴리오
```
curl -s "${BASE}/api/v1/portfolio/${PORTFOLIO_ID}" | jq
```
- 차트 데이터
```
curl -s "${BASE}/api/v1/portfolio/chart-data?portfolio_id=${PORTFOLIO_ID}" | jq
```
- 성과 지표
```
curl -s "${BASE}/api/v1/portfolio/${PORTFOLIO_ID}/performance" | jq
```

## **데이터 준비(권장)**
- `stocks` 시드/동기화: 보유 종목 코드에 대해 최소 `stock_name`, `sector` 채우기(없으면 외부 조회 폴백).
- KIS 동기화 실행 및 예외 로깅 개선(계좌/권한/레이트리밋 등).

## **롤아웃**
- 단계: 개발 → 스테이징(ngrok/Vercel 프리뷰) → 본선.
- 관찰: 응답 구조/타입 메트릭, 조인 실패/결측 로그, 프론트 QA(시각화/명칭/섹터 확인).

## **용어 정리**
- `portfolio_id`: 백엔드 DB에서 포트폴리오를 식별하는 고유 ID(UUID). `GET /api/v1/portfolio/{portfolio_id}`로 명시 조회 가능. 미지정 시 `/api/v1/portfolio/`는 사용자 컨텍스트로 resolve.

---

담당자: Backend Team
연동자: Frontend Team
상태: 준비
우선순위: Critical > High > Medium > Low

## **증빙/재현 정보**
- Backend Base: https://gifted-michiko-auric.ngrok-free.dev
- Health 확인
```
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
irm "$BASE/health" -Headers @{ 'ngrok-skip-browser-warning'='true' }
```
예상: `{ status: healthy, database: connected, agents: ready, app: HAMA }`

- Portfolio 응답 + 빠른 점검(PowerShell)
```
$BASE = 'https://gifted-michiko-auric.ngrok-free.dev'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$r = irm "$BASE/api/v1/portfolio/" -Headers @{ 'ngrok-skip-browser-warning'='true' }

# 1) 보유 종목 수
$r.holdings.Count  # 관측: 2

# 2) 종목명=코드 여부(이름 조인 실패 탐지)
($r.holdings | ? { $_.stock_name -eq $_.stock_code }).Count  # 관측: 2

# 3) 섹터 분포
$r.allocation.sectors | % { "$( $_.name ): $( $_.percentage )" }  # 관측: "기타"만 노출(약 9.15)

# 4) 타입 확인(Decimal → number 검증)
($r.summary.total_value).GetType().Name  # 관측: Decimal
```

- curl 대안
```
curl -s -H "ngrok-skip-browser-warning: true" "$BASE/api/v1/portfolio/" | jq
```

## **환경/재현 경로**
- Frontend(Base URL): Vercel 프로젝트 환경변수 `NEXT_PUBLIC_API_BASE_URL` = `https://gifted-michiko-auric.ngrok-free.dev`
- 재현: Vercel 배포 → Live 모드 전환 → Portfolio 페이지 진입 → Network 탭에서 `GET /api/v1/portfolio/`가 위 ngrok으로 나가는 것 확인
- 관측 결과 요약
  - holdings: 2개
  - stock_name === stock_code: 2개(100%)
  - allocation.sectors: "기타"만 노출
  - summary.total_value 타입: Decimal

## **담당/일정 제안**
- 담당: Backend Team(포트폴리오 라우트/서비스/스키마/시드), Frontend Team(옵션: 경고 배지/임시 폴백)
- 제안 일정: Critical 항목 1~2 영업일 내 반영 → 스테이징 검증 → 배포
