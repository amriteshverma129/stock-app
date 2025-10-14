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
import { formatPercent } from "@/lib/utils";
import { RefreshCw, Grid3x3, ScatterChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketScatterChart } from "@/components/charts/MarketScatterChart";
import { SectorPerformanceChart } from "@/components/charts/SectorPerformanceChart";

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

  useEffect(() => {
    fetchHeatmap();
    // Auto-refresh every 60 seconds
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

  const getColorClass = (changePercent: number) => {
    if (changePercent > 3) return "bg-green-600 text-white hover:bg-green-700";
    if (changePercent > 1) return "bg-green-500 text-white hover:bg-green-600";
    if (changePercent > 0) return "bg-green-400 text-white hover:bg-green-500";
    if (changePercent > -1) return "bg-red-400 text-white hover:bg-red-500";
    if (changePercent > -3) return "bg-red-500 text-white hover:bg-red-600";
    return "bg-red-600 text-white hover:bg-red-700";
  };

  const getSectorColor = (avgChange: number) => {
    if (avgChange > 2) return "border-green-500 bg-green-50 dark:bg-green-900/20";
    if (avgChange > 0) return "border-green-300 bg-green-50/50 dark:bg-green-900/10";
    if (avgChange > -2) return "border-red-300 bg-red-50/50 dark:bg-red-900/10";
    return "border-red-500 bg-red-50 dark:bg-red-900/20";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading market heatmap...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>
                Real-time market heatmap and charts
                {lastUpdate && ` • Last update: ${lastUpdate}`}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={fetchHeatmap} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Toggle between Grid and Chart view */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <ScatterChart className="h-4 w-4" />
            Chart View
          </TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-4 mt-4">

      {/* Sector-wise Heatmap */}
      {sectorData.map((sector) => (
        <Card key={sector.name} className={`border-2 ${getSectorColor(sector.avgChange)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{sector.name}</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {sector.count} stocks
                </div>
                <div className={`text-lg font-bold ${sector.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(sector.avgChange)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {sector.stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${getColorClass(stock.changePercent)}`}
                  title={`${stock.name}\nPrice: ₹${stock.price.toFixed(2)}\nVolume: ${stock.volume.toLocaleString()}`}
                >
                  <div className="font-bold text-sm">{stock.symbol}</div>
                  <div className="text-xs opacity-90 mt-1">₹{stock.price.toFixed(2)}</div>
                  <div className="text-xs font-semibold mt-1">
                    {formatPercent(stock.changePercent)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground">Legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>&gt; 3%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>1-3%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>0-1%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>0 to -1%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>-1 to -3%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>&lt; -3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Chart View */}
        <TabsContent value="chart" className="space-y-4 mt-4">
          <MarketScatterChart stocks={heatmapData} sectors={sectorData} />
          <SectorPerformanceChart sectors={sectorData} />
          
          {/* Market Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{heatmapData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Advancing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {heatmapData.filter(s => s.changePercent > 0).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Declining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {heatmapData.filter(s => s.changePercent < 0).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  heatmapData.reduce((sum, s) => sum + s.changePercent, 0) / heatmapData.length >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatPercent(
                    heatmapData.reduce((sum, s) => sum + s.changePercent, 0) / heatmapData.length
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

