# How it Works – Agent Architecture (요약)

> 포스터 QR 코드용 **노드/워커 단위 초간단 설명**입니다.  
> 실제 구현은 `HAMA-backend` 레포의 `src/subgraphs` 및 `src/services`를 참고하세요.

---

## 1. Supervisor / Graph Master

- **Supervisor (graph_master.build_supervisor)**  
  사용자의 질의를 받고, 단순 조회는 직접 처리하고, 복잡한 건 서브그래프로 라우팅하는 상위 조정자입니다.
- **Rebalance Planner Node (rebalance_planner_node)**  
  현재 포트폴리오와 정량 분석 결과를 합쳐 “어떤 종목을 얼마나 가져가야 할지” 목표 비중을 계산합니다.
- **Rebalance Simulator Node (rebalance_simulator_node)**  
  리밸런싱 전·후 포트폴리오와 리스크 지표를 계산해, 실제로 바꾸면 어떤 변화가 나는지 시뮬레이션합니다.
- **Rebalance Summary Node (rebalance_summary_node)**  
  시뮬레이션 결과를 사람이 읽기 쉬운 요약(요약 문장 + 핵심 지표)으로 정리합니다.

---

## 2. Research Subgraph (심층 리서치)

- **Stock Code Extractor (async _extract_stock_code)**  
  사용자의 한국어 질의에서 종목명/코드를 찾아, 필요한 경우 LLM과 종목 검색 툴로 6자리 코드로 변환합니다.
- **Data Worker (ALLOWED_WORKERS: \"data\")**  
  가격·재무·지표·지수 등 **사실 데이터만** 모아서 Research 에이전트가 쓸 “재료 테이블”을 만들어 줍니다.
- **Bull Case Worker (\"bull\")**  
  해당 종목이 잘 될 수 있는 상승 요인(성장 스토리, 수요 모멘텀 등)만 따로 정리합니다.
- **Bear Case Worker (\"bear\")**  
  하방 리스크, 실적 둔화, 규제 등 “왜 조심해야 하는지”만 분리해서 정리합니다.
- **Macro Impact Worker (\"macro\")**  
  금리·경기·환율 같은 거시지표가 이 종목/섹터에 어떤 방향으로 영향을 줄지 연결해서 설명합니다.
- **Technical Worker (\"technical\")**  
  이동평균·거래량·모멘텀 지표를 계산하고, 현재 가격 흐름이 추세/과열/과매도인지 요약합니다.
- **Trading Flow Worker (\"trading_flow\")**  
  수급·거래대금·단기 흐름을 보고 “지금은 따라붙을 구간인지, 기다릴 구간인지” 거래 관점에서 판단합니다.
- **Research Synthesizer Node**  
  위 워커들의 결과를 하나의 리서치 리포트로 합쳐, Chat 프론트에서 그대로 보여주는 최종 보고서를 만듭니다.

---

## 3. Quantitative Subgraph (정량·전략 에이전트)

- **Risk Profile Node**  
  사용자 프로필과 포트폴리오 구성을 바탕으로 “공격형/중립/보수형” 같은 리스크 성향을 정량화합니다.
- **Factor Exposure Node**  
  종목/섹터 비중을 뜯어 보고, 성장·가치·퀄리티·모멘텀 등 팩터에 얼마나 노출돼 있는지 계산합니다.
- **Portfolio Metrics Node**  
  변동성, VaR, 최대 낙폭 추정치 등 핵심 리스크 지표를 숫자로 만들어 Trading/HITL 단계에서 재사용합니다.
- **Strategy Synthesis Node**  
  시장 국면(확장/피크/침체/저점)과 사용자 리스크 선호를 바탕으로 **어떤 전략을 쓸지** 한 줄로 결정합니다.
- **Target Allocation Node**  
  위 전략을 실제 비중으로 바꿔 “주식 vs 현금”과 종목별 목표 비중을 산출해 Rebalance Planner로 넘깁니다.

---

## 4. Trading Subgraph (매매 + HITL)

> 메인 플로우: `trade_planner → portfolio_simulator → trade_hitl → execute_trade`

- **Trade Planner Node (trade_planner_node)**  
  `request_trade` 툴 호출 결과에서 매매 방향/수량/가격을 읽어, 사람이 이해하기 쉬운 “매매 제안 카드”로 구조화합니다.
- **Portfolio Simulator Node (portfolio_simulator_node)**  
  `get_portfolio_positions` 결과를 기반으로, 매매 전·후 포트폴리오와 비중 변화를 계산합니다.
- **Risk Comparison Node**  
  매매 전·후의 변동성, VaR, 집중도(HHI) 등을 비교해 “이 주문이 리스크를 얼마나 바꾸는지” 숫자로 보여줍니다.
- **Trade HITL Node (trade_hitl_node)**  
  위 정보를 한 덩어리로 묶어 프론트에 `trade_approval` 요청을 보내고, **사용자 승인이 올 때까지 그래프를 일시 중단(Interrupt)** 합니다.
- **Execute Trade Node (execute_trade_node)**  
  사용자가 HITL 패널에서 승인하면 재개되어, 실제 증권사 API를 통해 주문을 실행합니다.

---

## 5. Shared Services / Tools (백그라운드 워커 느낌)

- **Stock Data Service (stock_data_service)**  
  KIS·pykrx 등 여러 소스에서 시세/차트 데이터를 모아 표준 형식으로 반환하는 데이터 어댑터입니다.
- **Portfolio Service (portfolio_service)**  
  DB와 증권사 계좌를 묶어서 포트폴리오 스냅샷, 리스크 지표, 섹터 비중 등을 계산해주는 포트폴리오 “단일 진실 원천”입니다.
- **Portfolio Optimizer (portfolio_optimizer)**  
  정량 에이전트 결과와 제약(섹터 한도, 종목 한도 등)을 바탕으로, 현실적인 목표 비중과 리밸런싱 제안을 생성합니다.
- **Trading Service (trading_service)**  
  매수/매도 주문을 실제 API 호출로 변환하고, 응답을 검증·로그 기록까지 담당하는 주문 실행 레이어입니다.

