export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  sector: string;
  high52w: number;
  low52w: number;
  dividend: number;
  beta: number;
  eps: number;
  bookValue: number;
  priceToBook: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  priceHistory: PricePoint[];
  technicalIndicators: TechnicalIndicators;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  bollingerUpper: number;
  bollingerLower: number;
  stochastic: number;
  williamsR: number;
  atr: number;
  adx: number;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
  positions: Position[];
}

export interface Position {
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
}

export interface MarketData {
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  topGainers: Stock[];
  topLosers: Stock[];
  mostActive: Stock[];
  marketStatus: "open" | "closed" | "pre-market" | "after-hours";
  lastUpdate: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface SectorPerformance {
  name: string;
  change: number;
  changePercent: number;
  marketCap: number;
  stockCount: number;
  topStocks: string[];
}

import { INDIAN_STOCKS_500, SECTOR_COUNTS } from "./indian-stocks-500";

// Convert Indian stocks to full stock format
function convertToFullStock(indianStock: any): Stock {
  const basePrice = indianStock.price;
  return {
    ...indianStock,
    dividend: parseFloat((Math.random() * 5).toFixed(2)),
    beta: parseFloat((0.5 + Math.random() * 1.5).toFixed(2)),
    eps: parseFloat((basePrice / (indianStock.pe || 20)).toFixed(2)),
    bookValue: parseFloat((basePrice / 5).toFixed(2)),
    priceToBook: parseFloat((Math.random() * 10 + 1).toFixed(2)),
    roe: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    roa: parseFloat((Math.random() * 15 + 5).toFixed(2)),
    debtToEquity: parseFloat((Math.random() * 2).toFixed(2)),
    currentRatio: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
    quickRatio: parseFloat((Math.random() * 1.5 + 0.3).toFixed(2)),
    priceHistory: generatePriceHistory(indianStock.price, 30),
    technicalIndicators: {
      sma20: parseFloat((basePrice * (0.98 + Math.random() * 0.04)).toFixed(2)),
      sma50: parseFloat((basePrice * (0.96 + Math.random() * 0.08)).toFixed(2)),
      sma200: parseFloat(
        (basePrice * (0.92 + Math.random() * 0.16)).toFixed(2)
      ),
      ema12: parseFloat((basePrice * (0.99 + Math.random() * 0.02)).toFixed(2)),
      ema26: parseFloat((basePrice * (0.98 + Math.random() * 0.04)).toFixed(2)),
      rsi: parseFloat((30 + Math.random() * 40).toFixed(1)),
      macd: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),
      macdSignal: parseFloat(((Math.random() - 0.5) * 8).toFixed(2)),
      bollingerUpper: parseFloat((basePrice * 1.05).toFixed(2)),
      bollingerLower: parseFloat((basePrice * 0.95).toFixed(2)),
      stochastic: parseFloat((Math.random() * 100).toFixed(1)),
      williamsR: parseFloat((Math.random() * -100).toFixed(1)),
      atr: parseFloat((basePrice * 0.02).toFixed(2)),
      adx: parseFloat((20 + Math.random() * 40).toFixed(1)),
    },
  };
}

// Hardcoded Financial Data - Now with 500 Indian Stocks
export const FINANCIAL_STOCKS: Stock[] =
  INDIAN_STOCKS_500.map(convertToFullStock);

// Original stocks for backward compatibility
const ORIGINAL_STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.25,
    change: 2.15,
    changePercent: 1.15,
    volume: 45234567,
    marketCap: 2950000000000,
    pe: 28.5,
    sector: "Technology",
    high52w: 198.23,
    low52w: 124.17,
    dividend: 0.96,
    beta: 1.25,
    eps: 6.64,
    bookValue: 3.61,
    priceToBook: 52.4,
    roe: 147.8,
    roa: 19.2,
    debtToEquity: 1.73,
    currentRatio: 1.04,
    quickRatio: 0.99,
    priceHistory: generatePriceHistory(189.25, 30),
    technicalIndicators: {
      sma20: 185.32,
      sma50: 178.45,
      sma200: 165.78,
      ema12: 187.23,
      ema26: 182.45,
      rsi: 68.5,
      macd: 2.15,
      macdSignal: 1.89,
      bollingerUpper: 192.45,
      bollingerLower: 178.12,
      stochastic: 75.2,
      williamsR: -24.8,
      atr: 3.45,
      adx: 28.7,
    },
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.85,
    change: -1.25,
    changePercent: -0.33,
    volume: 23456789,
    marketCap: 2810000000000,
    pe: 32.1,
    sector: "Technology",
    high52w: 384.3,
    low52w: 309.45,
    dividend: 3.0,
    beta: 0.89,
    eps: 11.79,
    bookValue: 25.18,
    priceToBook: 15.05,
    roe: 46.8,
    roa: 15.2,
    debtToEquity: 0.31,
    currentRatio: 2.52,
    quickRatio: 2.45,
    priceHistory: generatePriceHistory(378.85, 30),
    technicalIndicators: {
      sma20: 375.45,
      sma50: 365.78,
      sma200: 342.12,
      ema12: 380.23,
      ema26: 372.45,
      rsi: 45.2,
      macd: -1.25,
      macdSignal: -0.89,
      bollingerUpper: 385.67,
      bollingerLower: 365.23,
      stochastic: 42.1,
      williamsR: -57.9,
      atr: 4.12,
      adx: 22.3,
    },
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.35,
    change: 3.45,
    changePercent: 2.48,
    volume: 34567890,
    marketCap: 1780000000000,
    pe: 25.8,
    sector: "Technology",
    high52w: 151.55,
    low52w: 102.21,
    dividend: 0.0,
    beta: 1.05,
    eps: 5.51,
    bookValue: 25.18,
    priceToBook: 5.65,
    roe: 21.9,
    roa: 12.4,
    debtToEquity: 0.12,
    currentRatio: 3.21,
    quickRatio: 3.15,
    priceHistory: generatePriceHistory(142.35, 30),
    technicalIndicators: {
      sma20: 138.92,
      sma50: 135.45,
      sma200: 128.78,
      ema12: 141.23,
      ema26: 137.45,
      rsi: 72.8,
      macd: 3.45,
      macdSignal: 2.12,
      bollingerUpper: 145.67,
      bollingerLower: 132.23,
      stochastic: 85.2,
      williamsR: -14.8,
      atr: 2.89,
      adx: 31.2,
    },
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 155.78,
    change: -2.12,
    changePercent: -1.34,
    volume: 45678901,
    marketCap: 1620000000000,
    pe: 52.3,
    sector: "Consumer Discretionary",
    high52w: 170.83,
    low52w: 101.15,
    dividend: 0.0,
    beta: 1.15,
    eps: 2.98,
    bookValue: 15.23,
    priceToBook: 10.23,
    roe: 19.6,
    roa: 3.2,
    debtToEquity: 0.45,
    currentRatio: 1.12,
    quickRatio: 0.89,
    priceHistory: generatePriceHistory(155.78, 30),
    technicalIndicators: {
      sma20: 158.45,
      sma50: 152.78,
      sma200: 145.12,
      ema12: 156.23,
      ema26: 154.45,
      rsi: 38.7,
      macd: -2.12,
      macdSignal: -1.45,
      bollingerUpper: 162.34,
      bollingerLower: 148.67,
      stochastic: 28.9,
      williamsR: -71.1,
      atr: 3.78,
      adx: 19.8,
    },
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.42,
    change: 8.75,
    changePercent: 3.65,
    volume: 67890123,
    marketCap: 789000000000,
    pe: 65.2,
    sector: "Automotive",
    high52w: 299.29,
    low52w: 138.8,
    dividend: 0.0,
    beta: 2.15,
    eps: 3.81,
    bookValue: 12.45,
    priceToBook: 19.95,
    roe: 30.6,
    roa: 8.9,
    debtToEquity: 0.23,
    currentRatio: 1.45,
    quickRatio: 1.23,
    priceHistory: generatePriceHistory(248.42, 30),
    technicalIndicators: {
      sma20: 235.67,
      sma50: 225.34,
      sma200: 198.78,
      ema12: 245.23,
      ema26: 238.45,
      rsi: 78.9,
      macd: 8.75,
      macdSignal: 5.23,
      bollingerUpper: 258.45,
      bollingerLower: 212.89,
      stochastic: 92.1,
      williamsR: -7.9,
      atr: 12.45,
      adx: 42.3,
    },
  },
];

export const MARKET_INDICES: MarketIndex[] = [
  {
    name: "S&P 500",
    symbol: "^GSPC",
    value: 4567.89,
    change: 23.45,
    changePercent: 0.52,
    volume: 3456789012,
  },
  {
    name: "Dow Jones",
    symbol: "^DJI",
    value: 35234.56,
    change: 145.67,
    changePercent: 0.41,
    volume: 2345678901,
  },
  {
    name: "NASDAQ",
    symbol: "^IXIC",
    value: 14234.78,
    change: 89.23,
    changePercent: 0.63,
    volume: 4567890123,
  },
  {
    name: "Russell 2000",
    symbol: "^RUT",
    value: 1987.45,
    change: -12.34,
    changePercent: -0.62,
    volume: 1234567890,
  },
];

// Calculate sector performance from actual stock data
function calculateSectorPerformance(): SectorPerformance[] {
  const sectorMap = new Map<
    string,
    { stocks: Stock[]; totalMarketCap: number; totalChange: number }
  >();

  FINANCIAL_STOCKS.forEach((stock) => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, {
        stocks: [],
        totalMarketCap: 0,
        totalChange: 0,
      });
    }
    const sectorData = sectorMap.get(stock.sector)!;
    sectorData.stocks.push(stock);
    sectorData.totalMarketCap += stock.marketCap;
    sectorData.totalChange += stock.changePercent;
  });

  const sectors: SectorPerformance[] = [];
  sectorMap.forEach((data, sectorName) => {
    const avgChange = data.totalChange / data.stocks.length;
    const topStocks = data.stocks
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 5)
      .map((s) => s.symbol);

    sectors.push({
      name: sectorName,
      change: parseFloat(
        ((avgChange * data.totalMarketCap) / 1000000000).toFixed(2)
      ),
      changePercent: parseFloat(avgChange.toFixed(2)),
      marketCap: data.totalMarketCap,
      stockCount: data.stocks.length,
      topStocks,
    });
  });

  return sectors.sort((a, b) => b.stockCount - a.stockCount);
}

export const SECTOR_PERFORMANCE: SectorPerformance[] =
  calculateSectorPerformance();

export const PORTFOLIO_DATA: Portfolio = {
  totalValue: 125000.0,
  totalCost: 110000.0,
  totalGain: 15000.0,
  totalGainPercent: 13.64,
  dayChange: 1250.0,
  dayChangePercent: 1.01,
  positions: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 50,
      avgPrice: 175.0,
      currentPrice: 189.25,
      marketValue: 9462.5,
      costBasis: 8750.0,
      gain: 712.5,
      gainPercent: 8.14,
      weight: 7.57,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      quantity: 30,
      avgPrice: 350.0,
      currentPrice: 378.85,
      marketValue: 11365.5,
      costBasis: 10500.0,
      gain: 865.5,
      gainPercent: 8.24,
      weight: 9.09,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      quantity: 25,
      avgPrice: 130.0,
      currentPrice: 142.35,
      marketValue: 3558.75,
      costBasis: 3250.0,
      gain: 308.75,
      gainPercent: 9.5,
      weight: 2.85,
    },
  ],
};

// Helper function to generate price history
function generatePriceHistory(
  currentPrice: number,
  days: number
): PricePoint[] {
  const history: PricePoint[] = [];
  let price = currentPrice * 0.8; // Start 20% below current price

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    // Simulate realistic price movement
    const volatility = 0.02; // 2% daily volatility
    const trend = 0.001; // Slight upward trend
    const randomChange = (Math.random() - 0.5) * volatility;
    const dailyChange = trend + randomChange;

    price *= 1 + dailyChange;

    const open = price;
    const high = price * (1 + Math.random() * 0.03);
    const low = price * (1 - Math.random() * 0.03);
    const close = price;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;

    history.push({
      date: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  return history;
}
