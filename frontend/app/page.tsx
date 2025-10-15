"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StockList } from "@/components/StockList";
import { StockAnalysis } from "@/components/StockAnalysis";
import { MarketOverview } from "@/components/MarketOverview";
import { ModelComparison } from "@/components/ModelComparison";
import { LiveStockList } from "@/components/LiveStockList";
import { LiveStockAnalysis } from "@/components/LiveStockAnalysis";
import { MarketHeatmap } from "@/components/MarketHeatmap";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Logo } from "@/components/Logo";
import {
  Activity,
  TrendingUp,
  Zap,
  Brain,
  Flame,
  Radio,
  BarChart3,
  LineChart,
  Cpu,
  Info,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedLiveStock, setSelectedLiveStock] = useState<string | null>(
    null
  );
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchMarketSummary();
  }, []);

  // Scroll hijacking & parallax
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (contentRef.current) {
        const container = contentRef.current;
        const delta = e.deltaY;

        // Smooth scroll with easing
        container.scrollBy({
          top: delta * 0.8,
          behavior: "auto",
        });

        setScrollY(container.scrollTop);
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const fetchMarketSummary = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/market/summary?category=Nifty50&limit=10`
      );
      setMarketData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching market data:", error);
      setLoading(false);
    }
  };

  const parallaxOffset = scrollY * 0.5;

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="h-full flex flex-col relative">
        {/* Parallax Background Layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header - Fixed */}
        <div className="flex-none h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl relative z-20 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <div className="scale-75">
                  <Logo />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Stock Market Intelligence
                </h1>
                <p className="text-[10px] text-slate-700 uppercase tracking-wider">
                  Real-time Analysis Platform
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-slate-800">
                  118 Stocks
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200 shadow-sm">
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-mono text-slate-800">
                  13 Models
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-mono text-slate-800">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative z-10">
          <Tabs defaultValue="heatmap" className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex-none px-6 pt-3">
              <TabsList className="inline-flex h-10 items-center justify-start gap-1 bg-white/80 p-1 rounded-lg border border-slate-200 backdrop-blur-sm shadow-sm">
                <TabsTrigger
                  value="heatmap"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 rounded-md hover:text-slate-900 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Heatmap
                </TabsTrigger>
                <TabsTrigger
                  value="live"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 rounded-md hover:text-slate-900 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Live
                </TabsTrigger>
                <TabsTrigger
                  value="market"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 rounded-md hover:text-slate-900 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Market
                </TabsTrigger>
                <TabsTrigger
                  value="stocks"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 rounded-md hover:text-slate-900 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  Historical
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 rounded-md hover:text-slate-900 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Brain className="w-3.5 h-3.5" />
                  Models
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 rounded-md hover:text-slate-900 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Info className="w-3.5 h-3.5" />
                  About
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content with Parallax */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-6 pb-4"
              style={{
                scrollBehavior: "auto",
              }}
            >
              <TabsContent value="heatmap" className="mt-4">
                <div
                  style={{
                    transform: `translateY(${scrollY * -0.1}px)`,
                    transition: "transform 0.1s ease-out",
                  }}
                >
                  <MarketHeatmap />
                </div>
              </TabsContent>

              <TabsContent value="live" className="mt-4">
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-160px)]">
                  <div className="col-span-3 h-full overflow-y-auto">
                    <LiveStockList onSelectStock={setSelectedLiveStock} />
                  </div>
                  <div className="col-span-9 h-full overflow-y-auto">
                    {selectedLiveStock ? (
                      <LiveStockAnalysis symbol={selectedLiveStock} />
                    ) : (
                      <Card className="h-full flex items-center justify-center border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
                        <CardContent className="text-center">
                          <Radio className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                          <CardTitle className="text-slate-300 mb-2 text-lg">
                            Select a Stock
                          </CardTitle>
                          <CardDescription className="text-slate-700 text-sm">
                            Choose from 118 stocks to view live predictions
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="market" className="mt-4">
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-160px)]">
                  <div className="col-span-3 h-full overflow-y-auto">
                    <LiveStockList onSelectStock={setSelectedLiveStock} />
                  </div>
                  <div className="col-span-9 h-full overflow-y-auto">
                    {selectedLiveStock ? (
                      <LiveStockAnalysis symbol={selectedLiveStock} />
                    ) : (
                      <MarketOverview data={marketData} loading={loading} />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stocks" className="mt-4">
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-160px)]">
                  <div className="col-span-3 h-full overflow-y-auto">
                    <LiveStockList onSelectStock={setSelectedStock} />
                  </div>
                  <div className="col-span-9 h-full overflow-y-auto">
                    {selectedStock ? (
                      <LiveStockAnalysis symbol={selectedStock} />
                    ) : (
                      <Card className="h-full flex items-center justify-center border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
                        <CardContent className="text-center">
                          <LineChart className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                          <CardTitle className="text-slate-300 mb-2 text-lg">
                            Select a Stock
                          </CardTitle>
                          <CardDescription className="text-slate-700 text-sm">
                            View historical analysis and patterns
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="models" className="mt-4">
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-160px)]">
                  <div className="col-span-3 h-full overflow-y-auto">
                    <LiveStockList onSelectStock={setSelectedLiveStock} />
                  </div>
                  <div className="col-span-9 h-full overflow-y-auto">
                    {selectedLiveStock ? (
                      <ModelComparison symbol={selectedLiveStock} />
                    ) : (
                      <Card className="h-full flex items-center justify-center border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
                        <CardContent className="text-center">
                          <Brain className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                          <CardTitle className="text-slate-300 mb-2 text-lg">
                            ML Model Comparison
                          </CardTitle>
                          <CardDescription className="text-slate-700 text-sm">
                            Select a stock to compare 13 machine learning models
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-4">
                <Card className="border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
                  <CardHeader className="border-b border-slate-200">
                    <CardTitle className="text-xl text-slate-900">
                      Stock Market Intelligence Platform
                    </CardTitle>
                    <CardDescription className="text-slate-700">
                      Advanced AI-powered stock analysis and predictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-slate-700">
                        Features
                      </h3>
                      <ul className="grid grid-cols-2 gap-3 text-sm">
                        <li className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          118 Indian stocks tracked
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Real-time Yahoo Finance data
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          13 ML prediction models
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Multi-timeframe analysis
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Interactive heatmaps
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Technical indicators
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-slate-700">
                        ML Models
                      </h3>
                      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                        {[
                          "Random Forest",
                          "Gradient Boost",
                          "XGBoost",
                          "LightGBM",
                          "CatBoost",
                          "CNN",
                          "LSTM",
                          "GRU",
                          "RNN",
                          "Linear Reg",
                          "Ridge",
                          "Lasso",
                          "ElasticNet",
                        ].map((model) => (
                          <div
                            key={model}
                            className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded border border-slate-200 text-slate-700 text-center shadow-sm hover:shadow-md transition-shadow"
                          >
                            {model}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-slate-700">
                        Sectors
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          "IT",
                          "Banking",
                          "Auto",
                          "Energy",
                          "FMCG",
                          "Pharma",
                          "Financial",
                          "Metals",
                          "Infrastructure",
                          "Real Estate",
                          "Telecom",
                          "Consumer",
                        ].map((sector) => (
                          <span
                            key={sector}
                            className="px-3 py-1.5 bg-white/80 rounded-full border border-slate-200 text-slate-700 shadow-sm hover:shadow-md transition-shadow"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-600 font-mono">
                        DISCLAIMER: For educational purposes only. Not financial
                        advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
