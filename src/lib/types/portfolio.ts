/**
 * Portfolio Types
 *
 * 포트폴리오 데이터 타입 정의
 */

/**
 * 포트폴리오 요약 정보
 */
export interface PortfolioSummary {
  totalValue: number; // 총 평가금액
  totalReturn: number; // 총 수익금액
  totalReturnRate: number; // 총 수익률 (%)
  stockCount: number; // 보유 종목 수
  cash: number; // 현금 보유액
}

/**
 * 개별 종목 정보
 */
export interface Stock {
  code: string; // 종목코드 (예: "005930")
  name: string; // 종목명 (예: "삼성전자")
  quantity: number; // 보유 수량
  averagePrice: number; // 평균 매수가
  currentPrice: number; // 현재가
  value: number; // 평가금액 (quantity * currentPrice)
  return: number; // 수익금액 (value - quantity * averagePrice)
  returnRate: number; // 수익률 (%)
  weight: number; // 포트폴리오 비중 (%)
  sector: string; // 섹터 (예: "반도체", "배터리")
}

/**
 * 전체 포트폴리오 데이터
 */
export interface Portfolio {
  summary: PortfolioSummary;
  stocks: Stock[];
}

/**
 * 차트 타입
 */
export type ChartType = "treemap" | "pie" | "bar";

/**
 * 트리맵 차트 데이터 아이템
 */
export interface TreemapDataItem {
  name: string;
  size: number; // 평가금액
  weight: number; // 비중 (%)
  returnRate: number; // 수익률
  color: string; // 차트 색상
}

/**
 * 원형 차트 데이터 아이템
 */
export interface PieChartDataItem {
  name: string;
  value: number; // 평가금액
  weight: number; // 비중 (%)
  color: string; // 차트 색상
}

/**
 * 막대 차트 데이터 아이템
 */
export interface BarChartDataItem {
  name: string;
  returnRate: number; // 수익률 (%)
  value: number; // 평가금액
  color: string; // 차트 색상
}
