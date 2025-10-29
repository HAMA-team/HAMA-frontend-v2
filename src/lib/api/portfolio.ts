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

function mapOverviewToPortfolio(api: PortfolioOverviewAPI): Portfolio {
  const safeHoldings = Array.isArray((api as any)?.holdings) ? (api as any).holdings : [];

  // 섹터별 총 가치 계산 (비중을 total_value에 곱함)
  const totalValue = (api as any)?.summary?.total_value ?? 0;
  const sectorMap = new Map<string, number>();

  // allocation.sectors에서 섹터 정보 추출
  const sectors = (api as any)?.allocation?.sectors ?? [];
  sectors.forEach((sector: { name: string; value: number; percentage: number }) => {
    sectorMap.set(sector.name, sector.value);
  });

  // 종목 코드별 섹터 매핑 (값이 큰 섹터에 종목 할당)
  const stockCodeToSector = new Map<string, string>();

  // 각 종목의 market_value를 기준으로 섹터에 매핑
  // 간단한 휴리스틱: 같은 섹터 내 종목들의 합계가 섹터 value와 일치
  // 실제로는 백엔드에서 종목별 섹터를 제공해야 함
  safeHoldings.forEach((h: any) => {
    const stockCode = h.stock_code ?? '';
    if (stockCode && stockCode.toUpperCase() !== 'CASH') {
      // 백엔드에서 섹터 정보가 올 때까지 임시로 빈 문자열
      // 추후 백엔드 API 수정 시 holdings에 sector 필드 추가 필요
      stockCodeToSector.set(stockCode, h.sector ?? '');
    }
  });

  const stocks: Stock[] = safeHoldings.map((h: any) => ({
    code: h.stock_code ?? h.code ?? h.ticker ?? h.symbol ?? '',
    name: h.stock_name ?? h.name ?? h.ticker_name ?? h.display_name ?? (h.stock_code ?? ''),
    quantity: h.quantity ?? 0,
    averagePrice: h.avg_price ?? h.average_price ?? 0,
    currentPrice: h.current_price ?? 0,
    value: h.market_value ?? h.value ?? 0,
    return: h.profit ?? h.pnl ?? 0,
    returnRate: h.profit_rate ?? h.return_rate ?? 0,
    weight: h.weight ?? 0,
    sector: h.sector ?? stockCodeToSector.get(h.stock_code) ?? '', // 섹터 정보 활용
  }));

  return {
    summary: {
      totalValue: (api as any)?.summary?.total_value ?? 0,
      totalReturn: (api as any)?.summary?.profit ?? 0,
      totalReturnRate: (api as any)?.summary?.profit_rate ?? 0,
      stockCount: stocks.length,
      cash: (api as any)?.summary?.cash ?? 0,
    },
    stocks,
    sectors: sectorMap, // 섹터 정보 추가
  };
}

export async function fetchPortfolioOverview(): Promise<Portfolio> {
  const { data } = await apiClient.get<PortfolioOverviewAPI>("/api/v1/portfolio/");
  return mapOverviewToPortfolio(data);
}

// Chart data (minimal shape for health check)
export interface PortfolioChartDataResponse {
  treemap?: Array<{ name: string; value: number; code?: string }>;
  pie?: Array<{ name: string; value: number }>;
  updated_at?: string;
}

export async function fetchPortfolioChartData() {
  const { data } = await apiClient.get<PortfolioChartDataResponse>(
    "/api/v1/portfolio/chart-data"
  );
  return data;
}
