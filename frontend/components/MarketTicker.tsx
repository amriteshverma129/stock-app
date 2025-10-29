"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MarketData {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export function MarketTicker() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch market data from API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`${API_URL}/market/stocks-all`);
        const data = await response.json();

        // Extract stocks array from response
        const stocks = data.stocks || [];

        // Convert stocks to market data format, accounting for backend keys
        const marketData = stocks.slice(0, 10).map((stock: any) => ({
          symbol: stock.symbol,
          value: Number(stock.current_price ?? stock.price ?? 0),
          change: Number(stock.change ?? 0),
          changePercent: Number(
            stock.change_percent ?? stock.changePercent ?? 0
          ),
        }));

        setMarketData(marketData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-3 w-3" />;
    if (change < 0) return <ArrowDownRight className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden border-b bg-muted/30 relative z-10">
        <div className="flex flex-nowrap animate-scroll whitespace-nowrap py-2">
          <div className="flex items-center px-4 py-1">
            <span className="text-xs text-muted-foreground">
              Loading market data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border-b bg-muted/30 relative z-10">
      <div className="flex flex-nowrap animate-scroll whitespace-nowrap py-2">
        {[...marketData, ...marketData].map((data, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-1 border-r last:border-r-0"
          >
            <span className="text-xs font-semibold mr-2">{data.symbol}</span>
            <span className="text-xs font-medium text-muted-foreground mr-2">
              ₹{Number(data.value ?? 0).toFixed(2)}
            </span>
            <span
              className={`flex items-center text-xs font-medium ${getChangeColor(
                data.change
              )}`}
            >
              {getChangeIcon(data.change ?? 0)}
              <span className="ml-1">
                {(data.change ?? 0) > 0 ? "+" : ""}
                {Number(data.change ?? 0).toFixed(2)} (
                {(data.changePercent ?? 0) > 0 ? "+" : ""}
                {Number(data.changePercent ?? 0).toFixed(2)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
