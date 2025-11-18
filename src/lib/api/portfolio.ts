import apiClient from "@/lib/api";
import { Portfolio, Stock } from "@/lib/types/portfolio";
import { normalizeSector } from "@/lib/sector";

// API Types (subset from OpenAPI)
interface PortfolioOverviewAPI {
  summary: {
    total_value: number;
    principal: number;
    profit: number;
    profit_rate: number;
    cash: number;
    cash_percentage: number;
    updated_at?: string | null;
  };
  holdings: Array<{
    stock_code: string;
    stock_name: string;
    quantity: number;
    avg_price: number;
    current_price: number;
    market_value: number;
    profit: number;
    profit_rate: number;
    weight: number;
  }>;
  allocation: {
    sectors: Array<{
      name: string;
      value: number;
      percentage: number;
    }>;
    asset_classes?: Array<{
      name: string;
      value: number;
      percentage: number;
    }>;
  };
}

export interface PortfolioChartDataResponse {
  stocks: Array<{
    stock_code: string;
    stock_name: string;
    quantity: number;
    current_price: number;
    purchase_price: number;
    weight: number; // 0~1
    return_percent: number;
    sector: string;
  }>;
  total_value: number;
  total_return: number;
  total_return_percent: number;
  cash: number;
  sectors: Record<string, number>; // 섹터별 비중 (0~1)
}

function mapOverviewToPortfolio(api: PortfolioOverviewAPI): Portfolio {
  const safeHoldings = Array.isArray((api as any)?.holdings) ? (api as any).holdings : [];

  // 백엔드 summary 데이터 추출
  const apiSummary = (api as any)?.summary ?? {};

  // 섹터별 총 가치 계산
  const sectorMap = new Map<string, number>();

  // allocation.sectors에서 섹터 정보 추출
  const sectors = (api as any)?.allocation?.sectors ?? [];
  sectors.forEach((sector: { name: string; value: number; percentage: number }) => {
    sectorMap.set(sector.name, sector.value);
  });

  const stocks: Stock[] = safeHoldings
    .filter((h: any) => {
      // 현금 항목 제외 (stock_code가 'CASH' 또는 비어있는 경우)
      const code = h.stock_code ?? h.code ?? "";
      return code && code.toUpperCase() !== "CASH";
    })
    .map((h: any) => ({
      code: h.stock_code ?? h.code ?? h.ticker ?? h.symbol ?? "",
      name: h.stock_name ?? h.name ?? h.ticker_name ?? h.display_name ?? (h.stock_code ?? ""),
      quantity: h.quantity ?? 0,
      averagePrice: h.avg_price ?? h.average_price ?? 0,
      currentPrice: h.current_price ?? 0,
      value: h.market_value ?? h.value ?? 0,
      return: h.profit ?? h.pnl ?? 0,
      returnRate: h.profit_rate ?? h.return_rate ?? 0,
      weight: h.weight ?? 0,
      sector: normalizeSector(h.sector, h.stock_name ?? h.name ?? h.ticker_name ?? h.display_name ?? ""),
    }));

  // 주식 평가금액 및 주식 원금 (백엔드 summary가 없을 때를 위한 보조 지표)
  const stocksValue = stocks.reduce((sum, s) => sum + s.value, 0);
  const stocksPrincipal = stocks.reduce((sum, s) => sum + s.quantity * s.averagePrice, 0);

  // 백엔드 원본 값
  const backendTotalValue = apiSummary.total_value ?? 0;
  const backendCash = apiSummary.cash ?? 0;

  // 1차: 총 평가금액과 현금은 백엔드 값을 우선 사용,
  // 수익/수익률은 "현금 + 주식 원금"을 전체 원금으로 보는 관점에서 프론트에서 일관되게 계산한다.
  const totalValue: number =
    backendTotalValue && backendTotalValue > 0
      ? backendTotalValue
      : stocksValue + backendCash;

  const cash: number =
    backendCash && backendCash >= 0
      ? backendCash
      : Math.max(0, totalValue - stocksValue);

  // 총 수익/수익률은 "주식 원금 대비 주식 평가금" 기준으로 계산
  const stockProfit: number = stocksValue - stocksPrincipal;
  const stockProfitRate: number =
    stocksPrincipal > 0 ? (stockProfit / stocksPrincipal) * 100 : 0;

  return {
    summary: {
      totalValue,
      totalReturn: stockProfit,
      totalReturnRate: stockProfitRate,
      stockCount: stocks.length, // 현금 제외한 실제 종목 수
      cash,
    },
    stocks,
    sectors: sectorMap, // 섹터 정보 추가 (총 가치 기준)
  };
}

export async function fetchPortfolioOverview(): Promise<Portfolio> {
  const { data } = await apiClient.get<PortfolioOverviewAPI>("/api/v1/portfolio/");

  // 디버깅: 백엔드 응답 로그
  console.log("[Portfolio API] 백엔드 응답:", {
    summary: data.summary,
    holdings_count: data.holdings?.length,
    allocation: data.allocation,
  });

  return mapOverviewToPortfolio(data);
}

export async function fetchPortfolioChartData(): Promise<PortfolioChartDataResponse> {
  const { data } = await apiClient.get<PortfolioChartDataResponse>(
    "/api/v1/portfolio/chart-data",
  );
  return data;
}
