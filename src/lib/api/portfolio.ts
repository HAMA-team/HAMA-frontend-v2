import apiClient from "@/lib/api";
import { Portfolio, Stock } from "@/lib/types/portfolio";

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
      sector: h.sector ?? "", // 섹터는 chart-data API에서 보강
    }));

  // 백엔드 데이터가 잘못되어 있으므로 프론트엔드에서 직접 계산
  const stocksValue = stocks.reduce((sum, s) => sum + s.value, 0);
  const stocksPrincipal = stocks.reduce((sum, s) => sum + s.quantity * s.averagePrice, 0);

  // 백엔드 원본 값
  const backendTotalValue = apiSummary.total_value ?? 0;
  const backendCash = apiSummary.cash ?? 0;
  const backendPrincipal = apiSummary.principal ?? 0;

  // 프론트엔드 계산 값
  let totalValue: number;
  let cash: number;
  let principal: number;
  let profit: number;
  let profitRate: number;

  // total_value 검증 및 재계산
  if (Math.abs(backendTotalValue - stocksValue) > stocksValue * 0.1) {
    // 백엔드 값과 주식 평가금액 합계의 차이가 10% 이상이면 잘못된 것
    console.warn("[Portfolio API] total_value가 비정상적입니다. 프론트엔드에서 재계산:", {
      backend: backendTotalValue,
      stocksValue,
      diff: backendTotalValue - stocksValue,
    });

    // 현금을 백엔드 total_value - 주식 평가금액으로 계산
    cash = Math.max(0, backendTotalValue - stocksValue);
    totalValue = stocksValue + cash;
  } else {
    // 백엔드 값 신뢰
    totalValue = backendTotalValue;
    cash = backendCash;
  }

  // principal 검증
  if (Math.abs(backendPrincipal - stocksPrincipal) > stocksPrincipal * 0.1) {
    console.warn("[Portfolio API] principal이 비정상적입니다. 프론트엔드에서 재계산:", {
      backend: backendPrincipal,
      calculated: stocksPrincipal,
    });
    principal = stocksPrincipal + cash; // 원금 = 주식 매수 원금 + 현금
  } else {
    principal = backendPrincipal;
  }

  // profit 및 profit_rate 계산
  profit = totalValue - principal;
  profitRate = principal > 0 ? (profit / principal) * 100 : 0;

  console.log("[Portfolio API] 최종 summary:", {
    backend: {
      total_value: backendTotalValue,
      cash: backendCash,
      principal: backendPrincipal,
      profit: apiSummary.profit,
      profit_rate: apiSummary.profit_rate,
    },
    calculated: {
      totalValue,
      cash,
      principal,
      profit,
      profitRate,
      stocksValue,
    },
  });

  return {
    summary: {
      totalValue,
      totalReturn: profit,
      totalReturnRate: profitRate,
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
