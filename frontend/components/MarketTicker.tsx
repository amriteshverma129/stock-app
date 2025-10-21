"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MarketData {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

const marketData: MarketData[] = [
  { symbol: "NIFTY 50", value: 19674.25, change: 123.45, changePercent: 0.63 },
  { symbol: "SENSEX", value: 65953.48, change: 412.67, changePercent: 0.63 },
  { symbol: "BANK NIFTY", value: 44287.30, change: -234.78, changePercent: -0.53 },
  { symbol: "NIFTY IT", value: 31234.56, change: 178.23, changePercent: 0.57 },
  { symbol: "NIFTY AUTO", value: 14567.89, change: 89.45, changePercent: 0.62 },
  { symbol: "NIFTY PHARMA", value: 13890.12, change: -56.78, changePercent: -0.41 },
  { symbol: "NIFTY FMCG", value: 48234.67, change: 145.89, changePercent: 0.30 },
  { symbol: "NIFTY METAL", value: 6789.45, change: -78.23, changePercent: -1.14 },
  { symbol: "NIFTY REALTY", value: 512.34, change: 12.56, changePercent: 2.51 },
  { symbol: "NIFTY ENERGY", value: 28456.78, change: 234.12, changePercent: 0.83 },
];

export function MarketTicker() {
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

  return (
    <div className="w-full overflow-hidden border-b bg-muted/30 relative z-10">
      <div className="flex flex-nowrap animate-scroll whitespace-nowrap py-2">
        {[...marketData, ...marketData].map((data, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-1 border-r last:border-r-0"
          >
            <span className="text-xs font-semibold mr-2">
              {data.symbol}
            </span>
            <span className="text-xs font-medium text-muted-foreground mr-2">
              ₹{data.value.toFixed(2)}
            </span>
            <span
              className={`flex items-center text-xs font-medium ${getChangeColor(
                data.change
              )}`}
            >
              {getChangeIcon(data.change)}
              <span className="ml-1">
                {data.change > 0 ? "+" : ""}
                {data.change.toFixed(2)} (
                {data.changePercent > 0 ? "+" : ""}
                {data.changePercent.toFixed(2)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}