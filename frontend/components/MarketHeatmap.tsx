"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Activity,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface HeatmapData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
}

interface SectorData {
  name: string;
  change: number;
  changePercent: number;
  marketCap: number;
  stockCount: number;
  topStocks: string[];
}

export function MarketHeatmap() {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/market/stocks-all`);
        if (!response.ok) throw new Error("Failed to fetch stocks");

        const data = await response.json();

        const stocks = (data.stocks || []).map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: Number(stock.current_price ?? stock.price ?? 0),
          change: Number(stock.change ?? 0),
          changePercent: Number(
            stock.change_percent ?? stock.changePercent ?? 0
          ),
          volume: Number(stock.volume ?? 0),
          marketCap: Number(stock.market_cap ?? stock.marketCap ?? 0),
          sector: stock.sector || "Unknown",
        }));

        setHeatmapData(stocks);
        setSectorData(data.sectors || []);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)}L`;
    if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  const getIntensityClass = (changePercent: number) => {
    const absChange = Math.abs(changePercent);
    if (absChange >= 5)
      return changePercent > 0 ? "bg-green-500" : "bg-red-500";
    if (absChange >= 3)
      return changePercent > 0 ? "bg-green-400" : "bg-red-400";
    if (absChange >= 1)
      return changePercent > 0 ? "bg-green-300" : "bg-red-300";
    if (absChange >= 0.5)
      return changePercent > 0 ? "bg-green-200" : "bg-red-200";
    return changePercent > 0 ? "bg-green-100" : "bg-red-100";
  };

  const filteredStocks = heatmapData.filter((stock) => {
    const matchesSector = selectedSector
      ? stock.sector === selectedSector
      : true;
    const matchesSearch = searchTerm
      ? stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesSector && matchesSearch;
  });

  const totalVolume =
    !loading && heatmapData
      ? heatmapData.reduce((sum, stock) => sum + stock.volume, 0)
      : 0;
  const advancers =
    !loading && heatmapData
      ? heatmapData.filter((stock) => stock.change > 0).length
      : 0;
  const decliners =
    !loading && heatmapData
      ? heatmapData.filter((stock) => stock.change < 0).length
      : 0;
  const avgChange =
    !loading && heatmapData && heatmapData.length > 0
      ? heatmapData.reduce(
          (sum, stock) => sum + Number(stock.changePercent ?? 0),
          0
        ) / heatmapData.length
      : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-sm font-semibold mb-2">Loading Market Data</h3>
          <p className="text-xs text-muted-foreground">
            Fetching real-time information...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent"></div>
          <CardContent className="p-3 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Total Volume
              </span>
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-slate-600" />
              </div>
            </div>
            <div className="text-xl font-bold font-mono">
              {formatNumber(totalVolume)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
              Market Activity
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
          <CardContent className="p-3 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Advancing
              </span>
              <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-emerald-600 font-mono">
              {advancers}
            </div>
            <p className="text-[10px] text-emerald-600 mt-0.5 uppercase tracking-wide font-semibold">
              Stocks Up
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
          <CardContent className="p-3 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Declining
              </span>
              <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-3 w-3 text-red-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-red-600 font-mono">
              {decliners}
            </div>
            <p className="text-[10px] text-red-600 mt-0.5 uppercase tracking-wide font-semibold">
              Stocks Down
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
          <div
            className={`absolute inset-0 ${
              avgChange > 0
                ? "bg-gradient-to-br from-blue-500/5 to-transparent"
                : "bg-gradient-to-br from-orange-500/5 to-transparent"
            }`}
          ></div>
          <CardContent className="p-3 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Avg Change
              </span>
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  avgChange > 0 ? "bg-blue-100" : "bg-orange-100"
                }`}
              >
                <Activity
                  className={`h-3 w-3 ${
                    avgChange > 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                />
              </div>
            </div>
            <div
              className={`text-xl font-bold font-mono ${
                avgChange > 0
                  ? "text-blue-600"
                  : avgChange < 0
                  ? "text-orange-600"
                  : "text-slate-600"
              }`}
            >
              {avgChange > 0 ? "+" : ""}
              {avgChange.toFixed(2)}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
              Market Sentiment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Performance */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50/50 to-transparent">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="font-semibold">Sector Performance</span>
            <Button
              variant={!selectedSector ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs shadow-sm"
              onClick={() => setSelectedSector(null)}
            >
              All Sectors
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {sectorData && sectorData.length > 0 ? (
              sectorData.map((sector) => (
                <button
                  key={sector.name}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedSector === sector.name
                      ? "bg-primary text-primary-foreground border-primary shadow-md hover:shadow-lg"
                      : "bg-card hover:bg-muted border-border hover:border-primary/50 shadow-sm hover:shadow-md"
                  }`}
                  onClick={() =>
                    setSelectedSector(
                      selectedSector === sector.name ? null : sector.name
                    )
                  }
                >
                  <div className="space-y-1">
                    <p
                      className={`text-xs font-semibold ${
                        selectedSector === sector.name ? "" : ""
                      }`}
                    >
                      {sector.name}
                    </p>
                    <div
                      className={`flex items-center space-x-1 text-xs font-mono ${
                        selectedSector === sector.name
                          ? "text-primary-foreground"
                          : getChangeColor(sector.change)
                      }`}
                    >
                      {getChangeIcon(sector.change)}
                      <span>
                        {sector.change > 0 ? "+" : ""}
                        {Number(sector.changePercent ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <p
                      className={`text-[10px] ${
                        selectedSector === sector.name
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {sector.stockCount} stocks
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No sector data available
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Heatmap */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50/50 to-transparent">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Stock Heatmap</span>
              {selectedSector && (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {selectedSector}
                </Badge>
              )}
              {searchTerm && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-[10px]"
                >
                  "{searchTerm}"
                  <X
                    className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48 h-8 text-xs"
                />
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Refresh
              </Button>
              <Badge variant="outline" className="text-[10px] font-mono">
                {filteredStocks.length} stocks
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStocks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="group relative overflow-hidden rounded-lg border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                >
                  <div
                    className={`absolute inset-0 ${
                      stock.change > 0
                        ? "bg-gradient-to-br from-emerald-500/5 to-transparent"
                        : stock.change < 0
                        ? "bg-gradient-to-br from-red-500/5 to-transparent"
                        : "bg-gradient-to-br from-slate-500/5 to-transparent"
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0 left-0 right-0 h-0.5 ${
                      stock.change > 0
                        ? "bg-gradient-to-r from-emerald-500 to-green-500"
                        : stock.change < 0
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : "bg-gradient-to-r from-slate-400 to-slate-500"
                    }`}
                  ></div>

                  <div className="p-2.5 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs truncate">
                        {stock.symbol}
                      </span>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${getIntensityClass(
                          stock.changePercent
                        )}`}
                      ></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold font-mono">
                        {formatCurrency(stock.price)}
                      </p>
                      <div
                        className={`flex items-center space-x-1 text-[11px] font-mono font-semibold ${getChangeColor(
                          stock.change
                        )}`}
                      >
                        {getChangeIcon(stock.change)}
                        <span>
                          {stock.change > 0 ? "+" : ""}
                          {Number(stock.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Vol: {formatNumber(stock.volume)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No stocks found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? `No results for "${searchTerm}"${
                      selectedSector ? ` in ${selectedSector}` : ""
                    }`
                  : `No stocks in ${selectedSector}`}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSector(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
