"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Radio,
  Brain,
  DollarSign,
  RefreshCw,
  Download,
  Bell,
  Settings,
  Search,
  Filter,
  X,
} from "lucide-react";
const API_URL = "https://stock-app-iscx.onrender.com";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  pe?: number;
  beta?: number;
  high52w?: number;
  low52w?: number;
  technicalIndicators?: {
    rsi: number;
    macd: number;
    sma20: number;
    sma50: number;
    bollingerUpper: number;
    bollingerLower: number;
  };
}
import { MarketHeatmap } from "./MarketHeatmap";
import { LiveStockList } from "./LiveStockList";
import { LiveStockAnalysis } from "./LiveStockAnalysis";
import { ModelComparison } from "./ModelComparison";
import { LoadingScreen } from "./LoadingScreen";
import { MarketTicker } from "./MarketTicker";
import { AddStockDialog } from "./AddStockDialog";
import { SettingsPanel } from "./SettingsPanel";

export function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedLiveStock, setSelectedLiveStock] = useState<string | null>(
    null
  );
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [portfolioPositions, setPortfolioPositions] = useState<any[]>([]);
  const [portfolioRawData, setPortfolioRawData] = useState<
    Array<{
      symbol: string;
      quantity: number;
      avgPrice: number;
      purchaseDate?: string;
    }>
  >([]);
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("heatmap");
  const [showSettings, setShowSettings] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [appSettings, setAppSettings] = useState({
    defaultTab: "heatmap",
    currency: "INR",
    numberFormat: "indian",
    refreshInterval: 30,
    autoRefresh: true,
    showVolume: true,
    compactView: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAppSettings(parsed);
        // Set default tab from settings
        if (!window.location.hash && parsed.defaultTab) {
          setActiveTab(parsed.defaultTab);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // Fetch stocks data from API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch(`${API_URL}/market/stocks-all`);
        const data = await response.json();
        const stocks = (data?.stocks || []).map((s: any) => ({
          symbol: s.symbol,
          name: s.name,
          price: Number(s.current_price ?? s.price ?? 0),
          change: Number(s.change ?? 0),
          changePercent: Number(s.change_percent ?? s.changePercent ?? 0),
          volume: Number(s.volume ?? 0),
          marketCap: Number(
            // market_cap may be numeric or string like "16.5T"; keep as-is if numeric
            typeof s.market_cap === "number" ? s.market_cap : 0
          ),
          sector: s.sector || "Unknown",
          pe: typeof s.pe_ratio === "number" ? s.pe_ratio : undefined,
          beta: typeof s.beta === "number" ? s.beta : undefined,
          high52w: typeof s.high_52w === "number" ? s.high_52w : undefined,
          low52w: typeof s.low_52w === "number" ? s.low_52w : undefined,
          technicalIndicators: undefined,
        }));
        setStocks(stocks);
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
      }
    };

    fetchStocks();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!appSettings.autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger re-fetch of portfolio data
      if (portfolioRawData.length > 0) {
        const fetchData = async () => {
          try {
            const response = await fetch(`${API_URL}/portfolio/calculate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(portfolioRawData),
            });
            if (response.ok) {
              const data = await response.json();
              setPortfolioPositions(data.positions);
            }
          } catch (error) {
            console.error("Auto-refresh failed:", error);
          }
        };
        fetchData();
      }
    }, appSettings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [appSettings.autoRefresh, appSettings.refreshInterval, portfolioRawData]);

  // Initialize tab from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const validTabs = [
      "heatmap",
      "live",
      "models",
      "stocks",
      "portfolio",
      "watchlist",
    ];
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch portfolio calculations from backend when portfolioRawData changes
  useEffect(() => {
    const fetchPortfolioCalculations = async () => {
      try {
        const response = await fetch(`${API_URL}/portfolio/calculate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(portfolioRawData),
        });

        if (response.ok) {
          const data = await response.json();
          setPortfolioPositions(data.positions);
        }
      } catch (error) {
        console.error("Failed to calculate portfolio:", error);
        // Fallback to local data
      }
    };

    if (portfolioRawData.length > 0) {
      fetchPortfolioCalculations();
    } else {
      setPortfolioPositions([]);
    }
  }, [portfolioRawData]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDownload = () => {
    // Create CSV data from portfolio positions
    const csvData = [
      [
        "Symbol",
        "Quantity",
        "Avg Price",
        "Current Price",
        "Total Value",
        "P&L",
        "P&L %",
      ],
      ...portfolioPositions.map((position) => [
        position.symbol,
        position.quantity,
        position.avgPrice,
        position.currentPrice,
        position.totalValue,
        position.pnl,
        position.pnlPercent,
      ]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleAddStock = (
    stockSymbol: string,
    quantity: number,
    avgPrice: number,
    purchaseDate?: string
  ) => {
    const newRawPosition = {
      symbol: stockSymbol,
      quantity,
      avgPrice,
      purchaseDate,
    };

    setPortfolioRawData([...portfolioRawData, newRawPosition]);
    setShowAddStockDialog(false);
  };

  const handleRemoveStock = (symbol: string) => {
    setPortfolioRawData(
      portfolioRawData.filter((pos) => pos.symbol !== symbol)
    );
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
  };

  const formatCurrency = (value: number) => {
    const currencyMap: { [key: string]: string } = {
      INR: "en-IN",
      USD: "en-US",
      EUR: "de-DE",
    };

    return new Intl.NumberFormat(currencyMap[appSettings.currency] || "en-IN", {
      style: "currency",
      currency: appSettings.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (appSettings.numberFormat === "indian") {
      const symbol =
        appSettings.currency === "INR"
          ? "₹"
          : appSettings.currency === "USD"
          ? "$"
          : "€";
      if (value >= 1e7) return `${symbol}${(value / 1e7).toFixed(2)}Cr`;
      if (value >= 1e5) return `${symbol}${(value / 1e5).toFixed(2)}L`;
      if (value >= 1e3) return `${symbol}${(value / 1e3).toFixed(1)}K`;
      return value.toString();
    } else {
      const symbol =
        appSettings.currency === "INR"
          ? "₹"
          : appSettings.currency === "USD"
          ? "$"
          : "€";
      if (value >= 1e12) return `${symbol}${(value / 1e12).toFixed(2)}T`;
      if (value >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `${symbol}${(value / 1e3).toFixed(1)}K`;
      return value.toString();
    }
  };

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

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(stockSearchTerm.toLowerCase());
    const matchesSector = selectedSector
      ? stock.sector === selectedSector
      : true;
    return matchesSearch && matchesSector;
  });

  // Calculate dynamic portfolio totals
  const portfolioTotalValue = portfolioPositions.reduce(
    (sum, pos) => sum + pos.marketValue,
    0
  );
  const portfolioTotalCost = portfolioPositions.reduce(
    (sum, pos) => sum + pos.costBasis,
    0
  );
  const portfolioTotalGain = portfolioTotalValue - portfolioTotalCost;
  const portfolioTotalGainPercent =
    portfolioTotalCost > 0
      ? (portfolioTotalGain / portfolioTotalCost) * 100
      : 0;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Enterprise Header */}
      <div className="flex-none border-b bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded shadow-sm flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center space-x-3 divide-x divide-slate-200">
                <h1 className="text-sm font-semibold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Market Terminal
                </h1>
                <span className="pl-3 text-xs text-muted-foreground font-mono">
                  NSE • BSE •{" "}
                  <span className="text-blue-600 font-semibold">500</span>{" "}
                  Stocks
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
                <span className="text-[11px] font-semibold text-emerald-700">
                  LIVE
                </span>
              </div>
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md border bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200/50 text-xs font-mono">
                <Brain className="w-3 h-3 text-purple-600" />
                <span className="text-purple-700 font-semibold">13 ML</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-blue-50"
                onClick={handleSettings}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="flex-none">
        <MarketTicker />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="container mx-auto px-6 py-3">
          {/* Enterprise Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Portfolio Value
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  {formatCurrency(portfolioTotalValue)}
                </div>
                <p className="text-[10px] text-blue-600 mt-1 uppercase tracking-wide font-semibold">
                  Assets Under Management
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div
                className={`absolute inset-0 ${
                  portfolioTotalGain >= 0
                    ? "bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent"
                    : "bg-gradient-to-br from-red-500/10 via-red-400/5 to-transparent"
                }`}
              ></div>
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  portfolioTotalGain >= 0
                    ? "bg-gradient-to-b from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-b from-red-500 to-red-600"
                }`}
              ></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Total P&L
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow ${
                      portfolioTotalGain >= 0
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                        : "bg-gradient-to-br from-red-500 to-red-600"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold tracking-tight font-mono ${
                    portfolioTotalGain >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(portfolioTotalGain)}
                </div>
                <p
                  className={`text-[10px] mt-1 uppercase tracking-wide font-semibold ${
                    portfolioTotalGain >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {portfolioTotalGain >= 0 ? "+" : ""}
                  {portfolioTotalGainPercent.toFixed(2)}% ROI
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-transparent"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Cost Basis
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  {formatCurrency(portfolioTotalCost)}
                </div>
                <p className="text-[10px] text-purple-600 mt-1 uppercase tracking-wide font-semibold">
                  Total Capital Deployed
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Positions
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  {portfolioPositions.length}
                </div>
                <p className="text-[10px] text-amber-600 mt-1 uppercase tracking-wide font-semibold">
                  Active Securities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-3"
          >
            <div className="flex items-center justify-between border-b bg-white/50 backdrop-blur-sm">
              <TabsList className="h-10 bg-transparent border-0 p-0">
                <TabsTrigger
                  value="heatmap"
                  className="relative data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-xs font-semibold transition-all hover:text-primary/80 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-purple-500"
                >
                  <Activity className="w-3.5 h-3.5 mr-2" />
                  Heatmap
                </TabsTrigger>
                <TabsTrigger
                  value="live"
                  className="relative data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-xs font-semibold transition-all hover:text-primary/80 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-emerald-500 data-[state=active]:after:to-green-500"
                >
                  <Radio className="w-3.5 h-3.5 mr-2" />
                  Live
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="relative data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-xs font-semibold transition-all hover:text-primary/80 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-purple-500 data-[state=active]:after:to-pink-500"
                >
                  <Brain className="w-3.5 h-3.5 mr-2" />
                  Models
                </TabsTrigger>
                <TabsTrigger
                  value="stocks"
                  className="relative data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-xs font-semibold transition-all hover:text-primary/80 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-cyan-500"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-2" />
                  Stocks
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="relative data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-xs font-semibold transition-all hover:text-primary/80 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-amber-500 data-[state=active]:after:to-orange-500"
                >
                  <PieChart className="w-3.5 h-3.5 mr-2" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger
                  value="watchlist"
                  className="relative data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-xs font-semibold transition-all hover:text-primary/80 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-yellow-500 data-[state=active]:after:to-amber-500"
                >
                  <Star className="w-3.5 h-3.5 mr-2" />
                  Watchlist
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-1 pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={handleRefresh}
                  title="Refresh data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={handleDownload}
                  title="Download CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <TabsContent value="heatmap" className="space-y-3 mt-0">
              <MarketHeatmap />
            </TabsContent>

            <TabsContent value="live" className="space-y-3 mt-0">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <LiveStockList onSelectStock={setSelectedLiveStock} />
                </div>
                <div className="col-span-12 md:col-span-8">
                  {selectedLiveStock ? (
                    <LiveStockAnalysis symbol={selectedLiveStock} />
                  ) : (
                    <Card className="h-full flex items-center justify-center min-h-[600px]">
                      <CardContent className="text-center p-12">
                        <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                          Select a Stock
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Choose from the list to view live analysis
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-4">
                  <LiveStockList onSelectStock={setSelectedLiveStock} />
                </div>
                <div className="col-span-12 md:col-span-8">
                  {selectedLiveStock ? (
                    <ModelComparison symbol={selectedLiveStock} />
                  ) : (
                    <Card className="h-full flex items-center justify-center min-h-[600px]">
                      <CardContent className="text-center p-12">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                          ML Model Comparison
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Select a stock to compare models
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stocks" className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={stockSearchTerm}
                      onChange={(e) => setStockSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 w-64 text-xs border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <select
                    value={selectedSector || ""}
                    onChange={(e) => setSelectedSector(e.target.value || null)}
                    className="px-2 py-1.5 text-xs border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Sectors</option>
                    {Array.from(new Set(stocks.map((s) => s.sector)))
                      .sort()
                      .map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                  </select>
                  {(stockSearchTerm || selectedSector) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setStockSearchTerm("");
                        setSelectedSector(null);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {filteredStocks.length} of {stocks.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                  <Card className="border border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Market Stocks</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono"
                        >
                          {filteredStocks.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y max-h-[600px] overflow-y-auto">
                        {filteredStocks.map((stock) => (
                          <div
                            key={stock.symbol}
                            className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => setSelectedStock(stock)}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                <span className="text-xs font-semibold">
                                  {stock.symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {stock.symbol}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {stock.name}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex items-center space-x-3">
                              <div>
                                <p className="font-semibold text-sm font-mono">
                                  {formatCurrency(stock.price)}
                                </p>
                                <div
                                  className={`flex items-center space-x-1 text-xs ${getChangeColor(
                                    stock.change
                                  )}`}
                                >
                                  {getChangeIcon(stock.change)}
                                  <span className="font-mono font-semibold">
                                    {stock.change > 0 ? "+" : ""}
                                    {Number(stock.changePercent ?? 0).toFixed(
                                      2
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (watchlist.includes(stock.symbol)) {
                                    removeFromWatchlist(stock.symbol);
                                  } else {
                                    addToWatchlist(stock.symbol);
                                  }
                                }}
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${
                                    watchlist.includes(stock.symbol)
                                      ? "fill-current text-amber-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  {selectedStock ? (
                    <Card className="sticky top-6 border border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <span className="font-semibold">
                            {selectedStock.symbol}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {selectedStock.sector}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center p-3 bg-muted rounded">
                          <p className="text-2xl font-bold font-mono">
                            {formatCurrency(selectedStock.price)}
                          </p>
                          <div
                            className={`flex items-center justify-center space-x-1 mt-1 text-xs ${getChangeColor(
                              selectedStock.change
                            )}`}
                          >
                            {getChangeIcon(selectedStock.change)}
                            <span className="font-mono font-semibold">
                              {selectedStock.change > 0 ? "+" : ""}
                              {Number(selectedStock.change ?? 0).toFixed(2)} (
                              {selectedStock.changePercent > 0 ? "+" : ""}
                              {Number(selectedStock.changePercent ?? 0).toFixed(
                                2
                              )}
                              %)
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              label: "Market Cap",
                              value: formatNumber(selectedStock.marketCap),
                            },
                            {
                              label: "P/E Ratio",
                              value: selectedStock.pe?.toFixed(1) || "N/A",
                            },
                            {
                              label: "Volume",
                              value: formatNumber(selectedStock.volume),
                            },
                            {
                              label: "Beta",
                              value: selectedStock.beta?.toFixed(2) || "N/A",
                            },
                            {
                              label: "52W High",
                              value: selectedStock.high52w
                                ? formatCurrency(selectedStock.high52w)
                                : "N/A",
                            },
                            {
                              label: "52W Low",
                              value: selectedStock.low52w
                                ? formatCurrency(selectedStock.low52w)
                                : "N/A",
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="space-y-0.5 p-2 bg-muted rounded"
                            >
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                {item.label}
                              </p>
                              <p className="text-xs font-semibold font-mono">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="text-xs font-semibold mb-2">
                            Technical Indicators
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                label: "RSI",
                                value:
                                  selectedStock.technicalIndicators?.rsi?.toFixed(
                                    1
                                  ) || "N/A",
                              },
                              {
                                label: "MACD",
                                value:
                                  selectedStock.technicalIndicators?.macd?.toFixed(
                                    2
                                  ) || "N/A",
                              },
                              {
                                label: "SMA 20",
                                value:
                                  selectedStock.technicalIndicators?.sma20?.toFixed(
                                    2
                                  ) || "N/A",
                              },
                              {
                                label: "SMA 50",
                                value:
                                  selectedStock.technicalIndicators?.sma50?.toFixed(
                                    2
                                  ) || "N/A",
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex justify-between items-center p-1.5 bg-muted rounded"
                              >
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                  {item.label}
                                </span>
                                <span className="text-xs font-semibold font-mono">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="sticky top-6 border border-slate-200">
                      <CardContent className="p-8 text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Select a stock to view details
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Portfolio Management
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage your stock positions and track performance
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setShowAddStockDialog(true)}
                >
                  <PieChart className="w-3 h-3 mr-1.5" />
                  Add Stock
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Portfolio Positions */}
                <Card className="lg:col-span-2 border border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Portfolio Positions</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono"
                      >
                        {portfolioPositions.length} stocks
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {portfolioPositions.map((position) => (
                      <div
                        key={position.symbol}
                        className="flex items-center justify-between p-2 border rounded hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {position.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {position.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {position.quantity} shares
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="font-semibold text-sm font-mono">
                              {formatCurrency(position.marketValue)}
                            </p>
                            <div
                              className={`flex items-center justify-end space-x-1 text-xs ${getChangeColor(
                                position.gain
                              )}`}
                            >
                              {getChangeIcon(position.gain)}
                              <span className="font-mono font-semibold">
                                {position.gain > 0 ? "+" : ""}
                                {position.gainPercent.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveStock(position.symbol)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Allocation & Predictions */}
                <div className="lg:col-span-1 space-y-3">
                  {/* Portfolio Allocation - Compact */}
                  <Card className="border border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Allocation %
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {portfolioPositions.map((position) => (
                        <div key={position.symbol} className="space-y-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">
                              {position.symbol}
                            </span>
                            <span className="text-muted-foreground font-mono">
                              {position.weight.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1">
                            <div
                              className="bg-primary h-1 rounded-full"
                              style={{ width: `${position.weight}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Stock Predictions - Compact */}
                  <Card className="border border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Predictions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {portfolioPositions.length > 0 ? (
                        portfolioPositions.map((position) => {
                          const stock = stocks.find(
                            (s) => s.symbol === position.symbol
                          );
                          if (!stock) return null;

                          const rsi = stock.technicalIndicators?.rsi || 0;
                          const macd = stock.technicalIndicators?.macd || 0;
                          const sma20 = stock.technicalIndicators?.sma20 || 0;
                          const currentPrice = position.currentPrice;

                          let prediction = "HOLD";
                          let predictedChange = 0;

                          if (rsi > 70 && macd < 0) {
                            prediction = "SELL";
                            predictedChange = -3;
                          } else if (rsi < 30 && macd > 0) {
                            prediction = "BUY";
                            predictedChange = 5;
                          } else if (currentPrice > sma20) {
                            prediction = "BUY";
                            predictedChange = 2;
                          }

                          const predictedPrice =
                            currentPrice * (1 + predictedChange / 100);

                          return (
                            <div
                              key={position.symbol}
                              className="p-2 border rounded space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs">
                                  {position.symbol}
                                </span>
                                <Badge
                                  variant={
                                    prediction === "BUY"
                                      ? "default"
                                      : prediction === "SELL"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {prediction}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-muted-foreground uppercase tracking-wide">
                                  30d Move
                                </span>
                                <span
                                  className={`font-semibold font-mono ${
                                    predictedChange >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {predictedChange >= 0 ? "+" : ""}
                                  {predictedChange.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-muted-foreground uppercase tracking-wide">
                                  Impact
                                </span>
                                <span
                                  className={`font-medium font-mono ${
                                    predictedChange >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  ₹
                                  {(
                                    position.quantity *
                                    (predictedPrice - currentPrice)
                                  ).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-muted-foreground">
                            No predictions available
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-3">
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {watchlist.map((symbol) => {
                    const stock = stocks.find((s) => s.symbol === symbol);
                    if (!stock) return null;

                    return (
                      <Card key={symbol} className="border border-slate-200">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {stock.symbol}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {stock.name}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeFromWatchlist(symbol)}
                            >
                              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                            </Button>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center p-1.5 bg-muted rounded">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                Price
                              </span>
                              <span className="font-semibold text-xs font-mono">
                                {formatCurrency(stock.price)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-1.5 bg-muted rounded">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                Change
                              </span>
                              <div
                                className={`flex items-center space-x-1 text-xs ${getChangeColor(
                                  stock.change
                                )}`}
                              >
                                {getChangeIcon(stock.change)}
                                <span className="font-semibold font-mono">
                                  {stock.change > 0 ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border border-slate-200">
                  <CardContent className="p-8 text-center">
                    <Star className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-sm font-semibold mb-1">
                      No stocks in watchlist
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Add stocks from the Stocks tab to track them here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Stock Dialog */}
      <AddStockDialog
        isOpen={showAddStockDialog}
        onClose={() => setShowAddStockDialog(false)}
        onAdd={handleAddStock}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={appSettings}
        onSave={(newSettings) => {
          setAppSettings(newSettings);
          localStorage.setItem("appSettings", JSON.stringify(newSettings));
        }}
      />
    </div>
  );
}
