"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPercent, cn } from "@/lib/utils";
import {
  RefreshCw,
  Grid3x3,
  ScatterChart,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketScatterChart } from "@/components/charts/MarketScatterChart";
import { SectorPerformanceChart } from "@/components/charts/SectorPerformanceChart";
import { ChartLoader } from "./LoadingScreen";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StockHeatmapData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface SectorData {
  name: string;
  count: number;
  avgChange: number;
  stocks: StockHeatmapData[];
}

export function MarketHeatmap() {
  const [heatmapData, setHeatmapData] = useState<StockHeatmapData[]>([]);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<StockHeatmapData | null>(
    null
  );

  useEffect(() => {
    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchHeatmap = async () => {
    try {
      const response = await axios.get(`${API_URL}/market/heatmap`);
      setHeatmapData(response.data.stocks);
      setSectorData(response.data.sectors);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching heatmap:", error);
      setLoading(false);
    }
  };

  const getColorClasses = (changePercent: number) => {
    if (changePercent > 3)
      return "from-green-600 to-green-700 text-white shadow-green-500/50";
    if (changePercent > 1)
      return "from-green-500 to-green-600 text-white shadow-green-400/40";
    if (changePercent > 0)
      return "from-green-400 to-green-500 text-white shadow-green-300/30";
    if (changePercent > -1)
      return "from-red-400 to-red-500 text-white shadow-red-300/30";
    if (changePercent > -3)
      return "from-red-500 to-red-600 text-white shadow-red-400/40";
    return "from-red-600 to-red-700 text-white shadow-red-500/50";
  };

  const getSectorGradient = (avgChange: number) => {
    if (avgChange > 2)
      return "from-green-500/10 via-green-400/5 to-transparent";
    if (avgChange > 0) return "from-green-400/5 via-green-300/5 to-transparent";
    if (avgChange > -2) return "from-red-400/5 via-red-300/5 to-transparent";
    return "from-red-500/10 via-red-400/5 to-transparent";
  };

  const getSectorBorderColor = (avgChange: number) => {
    if (avgChange > 2) return "border-green-500/30";
    if (avgChange > 0) return "border-green-400/20";
    if (avgChange > -2) return "border-red-400/20";
    return "border-red-500/30";
  };

  const totalVolume = !loading
    ? heatmapData.reduce((sum, s) => sum + s.volume, 0)
    : 0;
  const advancers = !loading
    ? heatmapData.filter((s) => s.changePercent > 0).length
    : 0;
  const decliners = !loading
    ? heatmapData.filter((s) => s.changePercent < 0).length
    : 0;
  const avgChange =
    !loading && heatmapData.length > 0
      ? heatmapData.reduce((sum, s) => sum + s.changePercent, 0) /
        heatmapData.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 pointer-events-none"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Live Market Overview
                </CardTitle>
                <CardDescription className="text-blue-200 text-base mt-1">
                  Real-time heatmap • {lastUpdate && `Updated ${lastUpdate}`}
                </CardDescription>
              </div>
            </div>
            <Button
              size="lg"
              variant="secondary"
              onClick={fetchHeatmap}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/20 text-white"
            >
              <RefreshCw
                className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Market Stats */}
          {!loading && heatmapData.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-blue-200 text-sm font-medium mb-1">
                  Total Stocks
                </div>
                <div className="text-3xl font-bold">{heatmapData.length}</div>
              </div>
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                <div className="text-green-200 text-sm font-medium mb-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Advancing
                </div>
                <div className="text-3xl font-bold text-green-100">
                  {advancers}
                </div>
                <div className="text-xs text-green-200 mt-1">
                  {((advancers / heatmapData.length) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
                <div className="text-red-200 text-sm font-medium mb-1 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Declining
                </div>
                <div className="text-3xl font-bold text-red-100">
                  {decliners}
                </div>
                <div className="text-xs text-red-200 mt-1">
                  {((decliners / heatmapData.length) * 100).toFixed(0)}%
                </div>
              </div>
              <div
                className={cn(
                  "backdrop-blur-sm rounded-xl p-4 border",
                  avgChange >= 0
                    ? "bg-green-500/20 border-green-400/30"
                    : "bg-red-500/20 border-red-400/30"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    avgChange >= 0 ? "text-green-200" : "text-red-200"
                  )}
                >
                  Market Sentiment
                </div>
                <div
                  className={cn(
                    "text-3xl font-bold",
                    avgChange >= 0 ? "text-green-100" : "text-red-100"
                  )}
                >
                  {formatPercent(avgChange)}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* View Tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-white/80 border border-slate-200 p-1 shadow-sm">
          <TabsTrigger
            value="grid"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
          >
            <Grid3x3 className="h-4 w-4" />
            Grid View
          </TabsTrigger>
          <TabsTrigger
            value="chart"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
          >
            <ScatterChart className="h-4 w-4" />
            Chart View
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Grid View */}
        <TabsContent value="grid" className="space-y-6 mt-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <ChartLoader />
            </div>
          ) : (
            <>
              {sectorData.map((sector) => (
                <Card
                  key={sector.name}
                  className={cn(
                    "border-2 shadow-xl transition-all duration-300 hover:shadow-2xl overflow-hidden",
                    "bg-gradient-to-br",
                    getSectorGradient(sector.avgChange),
                    getSectorBorderColor(sector.avgChange)
                  )}
                >
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-3 rounded-xl",
                            sector.avgChange >= 0
                              ? "bg-gradient-to-br from-green-500 to-green-600"
                              : "bg-gradient-to-br from-red-500 to-red-600"
                          )}
                        >
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">
                            {sector.name}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {sector.count} stocks tracked
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-3xl font-bold",
                            sector.avgChange >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {formatPercent(sector.avgChange)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Sector Average
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sector.stocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          onClick={() => setSelectedStock(stock)}
                          className={cn(
                            "group relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                            "bg-gradient-to-br shadow-lg hover:shadow-2xl hover:scale-105",
                            "border border-white/20",
                            getColorClasses(stock.changePercent)
                          )}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                          <div className="relative z-10">
                            <div className="font-bold text-base mb-1">
                              {stock.symbol}
                            </div>
                            <div className="text-sm opacity-90 mb-2">
                              ₹{stock.price.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-1">
                              {stock.changePercent > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span className="text-sm font-bold">
                                {formatPercent(stock.changePercent)}
                              </span>
                            </div>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                            <div className="font-semibold">{stock.name}</div>
                            <div className="mt-1">
                              Volume: {(stock.volume / 1000000).toFixed(2)}M
                            </div>
                            <div className="mt-1">
                              MCap: ₹{(stock.marketCap / 10000000).toFixed(0)}Cr
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Enhanced Legend */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
                    <span className="text-muted-foreground font-semibold">
                      Performance Scale:
                    </span>
                    {[
                      { label: "> +3%", color: "from-green-600 to-green-700" },
                      {
                        label: "+1 to +3%",
                        color: "from-green-500 to-green-600",
                      },
                      {
                        label: "0 to +1%",
                        color: "from-green-400 to-green-500",
                      },
                      { label: "0 to -1%", color: "from-red-400 to-red-500" },
                      { label: "-1 to -3%", color: "from-red-500 to-red-600" },
                      { label: "< -3%", color: "from-red-600 to-red-700" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md shadow-md bg-gradient-to-br",
                            item.color
                          )}
                        ></div>
                        <span className="text-xs font-medium">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Chart View */}
        <TabsContent value="chart" className="space-y-6 mt-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <ChartLoader />
            </div>
          ) : (
            <>
              <MarketScatterChart stocks={heatmapData} sectors={sectorData} />
              <SectorPerformanceChart sectors={sectorData} />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Stock Detail Modal (if selected) */}
      {selectedStock && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStock(null)}
        >
          <Card
            className="max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardTitle className="text-2xl">{selectedStock.symbol}</CardTitle>
              <CardDescription className="text-blue-100">
                {selectedStock.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="text-2xl font-bold">
                    ₹{selectedStock.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={cn(
                      "text-xl font-bold",
                      selectedStock.changePercent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {formatPercent(selectedStock.changePercent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-semibold">
                    {(selectedStock.volume / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">
                    ₹{(selectedStock.marketCap / 10000000).toFixed(0)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sector</span>
                  <span className="font-semibold">{selectedStock.sector}</span>
                </div>
              </div>
              <Button
                className="w-full mt-6"
                onClick={() => setSelectedStock(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
