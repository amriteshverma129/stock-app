"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
  getChangeColor,
  getChangeBgColor,
} from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketData {
  marketStats: {
    averageChange: number;
    advancers: number;
    decliners: number;
    unchanged: number;
  };
  topGainers: Array<{
    symbol: string;
    name: string;
    currentPrice: number;
    changePercent: number;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    currentPrice: number;
    changePercent: number;
  }>;
}

export function MarketOverview({
  data,
  loading,
}: {
  data: MarketData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Loading market data...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Market Overview</CardTitle>
          <CardDescription className="text-slate-700">
            No data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { marketStats, topGainers, topLosers } = data;

  return (
    <div className="space-y-4">
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Market Movement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getChangeColor(
                marketStats.averageChange
              )}`}
            >
              {formatPercent(marketStats.averageChange)}
            </div>
            <p className="text-xs text-muted-foreground">Average Change</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Advancers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {marketStats.advancers}
            </div>
            <p className="text-xs text-muted-foreground">Stocks Up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Decliners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {marketStats.decliners}
            </div>
            <p className="text-xs text-muted-foreground">Stocks Down</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unchanged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              {marketStats.unchanged}
            </div>
            <p className="text-xs text-muted-foreground">No Change</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Gainers
            </CardTitle>
            <CardDescription>Best performing stocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topGainers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className={`flex justify-between items-center p-3 rounded-lg ${getChangeBgColor(
                    stock.changePercent
                  )}`}
                >
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(stock.currentPrice)}
                    </div>
                    <div className="text-sm text-green-600">
                      {formatPercent(stock.changePercent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Top Losers
            </CardTitle>
            <CardDescription>Worst performing stocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topLosers.reverse().map((stock, index) => (
                <div
                  key={stock.symbol}
                  className={`flex justify-between items-center p-3 rounded-lg ${getChangeBgColor(
                    stock.changePercent
                  )}`}
                >
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(stock.currentPrice)}
                    </div>
                    <div className="text-sm text-red-600">
                      {formatPercent(stock.changePercent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
