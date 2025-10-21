// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  purchaseDate?: string;
}

export interface CalculatedPosition {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  gain: number;
  gainPercent: number;
  weight: number;
  purchaseDate?: string;
  holdingDays?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  positionCount: number;
}

export interface PortfolioCalculationResponse {
  positions: CalculatedPosition[];
  summary: PortfolioSummary;
}

// Calculate portfolio on backend
export async function calculatePortfolio(
  positions: PortfolioPosition[]
): Promise<PortfolioCalculationResponse> {
  const response = await fetch(`${API_BASE_URL}/portfolio/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(positions),
  });

  if (!response.ok) {
    throw new Error(`Failed to calculate portfolio: ${response.statusText}`);
  }

  return response.json();
}

// Search stocks for portfolio
export async function searchStocksForPortfolio(
  query: string = '',
  limit: number = 20
) {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  params.append('limit', limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/portfolio/stock-search?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to search stocks: ${response.statusText}`);
  }

  return response.json();
}

// Get all Indian stocks
export async function getAllIndianStocks() {
  const response = await fetch(`${API_BASE_URL}/market/stocks-all`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stocks: ${response.statusText}`);
  }

  return response.json();
}

