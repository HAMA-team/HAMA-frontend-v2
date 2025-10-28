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
}

function mapOverviewToPortfolio(api: PortfolioOverviewAPI): Portfolio {
  const safeHoldings = Array.isArray((api as any)?.holdings) ? (api as any).holdings : [];
  const stocks: Stock[] = safeHoldings.map((h) => ({
    code: h.stock_code,
    name: h.stock_name,
    quantity: h.quantity,
    averagePrice: h.avg_price,
    currentPrice: h.current_price,
    value: h.market_value,
    return: h.profit,
    returnRate: h.profit_rate,
    weight: h.weight,
    sector: "", // not provided by API
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
