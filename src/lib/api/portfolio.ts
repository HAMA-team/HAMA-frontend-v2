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
  const stocks: Stock[] = api.holdings.map((h) => ({
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
      totalValue: api.summary.total_value,
      totalReturn: api.summary.profit,
      totalReturnRate: api.summary.profit_rate,
      stockCount: stocks.length,
      cash: api.summary.cash,
    },
    stocks,
  };
}

export async function fetchPortfolioOverview(): Promise<Portfolio> {
  const { data } = await apiClient.get<PortfolioOverviewAPI>("/api/v1/portfolio/");
  return mapOverviewToPortfolio(data);
}

