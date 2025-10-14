"use client";

import { useState, useEffect } from "react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedLiveStock, setSelectedLiveStock] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketSummary();
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📊 Stock Market Data Science Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            AI-powered stock analysis with machine learning predictions
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="heatmap" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="heatmap">🔥 Market Heatmap</TabsTrigger>
            <TabsTrigger value="live">🔴 Live Predictions</TabsTrigger>
            <TabsTrigger value="market">Market Overview</TabsTrigger>
            <TabsTrigger value="stocks">Historical</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Market Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-4">
            <MarketHeatmap />
          </TabsContent>

          {/* Live Predictions Tab */}
          <TabsContent value="live" className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live Stock Market Data
                </CardTitle>
                <CardDescription>
                  Real-time Indian stock data with multi-timeframe ML predictions (1M, 6M, 1Y, 5Y)
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <LiveStockList onSelectStock={setSelectedLiveStock} />
              </div>
              <div className="lg:col-span-2">
                {selectedLiveStock ? (
                  <LiveStockAnalysis symbol={selectedLiveStock} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select a Stock</CardTitle>
                      <CardDescription>
                        Choose a stock to view real-time data and multi-timeframe predictions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                          ← Select a stock from the list to get started
                        </p>
                        <p className="text-xs mt-2">
                          You'll see predictions for 1 Month, 6 Months, 1 Year, and 5 Years
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Market Overview Tab */}
          <TabsContent value="market" className="space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle>Market Overview - Live Data</CardTitle>
                <CardDescription>
                  Real-time market statistics and top movers
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <LiveStockList onSelectStock={setSelectedLiveStock} />
              </div>
              <div className="lg:col-span-2">
                {selectedLiveStock ? (
                  <LiveStockAnalysis symbol={selectedLiveStock} />
                ) : (
                  <MarketOverview data={marketData} loading={loading} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Historical Analysis Tab */}
          <TabsContent value="stocks" className="space-y-4">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle>Historical Data Analysis</CardTitle>
                <CardDescription>
                  Deep-dive analysis with historical data (up to 10 years)
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <LiveStockList onSelectStock={setSelectedStock} />
              </div>
              <div className="lg:col-span-2">
                {selectedStock ? (
                  <LiveStockAnalysis symbol={selectedStock} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select a Stock</CardTitle>
                      <CardDescription>
                        Choose a stock to view detailed historical analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                          ← Select a stock to view historical patterns and trends
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Model Comparison Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
              <CardHeader>
                <CardTitle>ML Model Comparison</CardTitle>
                <CardDescription>
                  Compare performance of different machine learning algorithms
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <LiveStockList onSelectStock={setSelectedLiveStock} />
              </div>
              <div className="lg:col-span-2">
                {selectedLiveStock ? (
                  <ModelComparison symbol={selectedLiveStock} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select a Stock</CardTitle>
                      <CardDescription>
                        Choose a stock to compare ML model performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                          ← Select a stock to compare Random Forest, Gradient Boosting, and Linear models
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About This Dashboard</CardTitle>
                <CardDescription>
                  Stock Market Data Science Platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">🎯 Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li><strong>🆕 Real-time Indian stock data</strong> from Yahoo Finance</li>
                    <li><strong>🆕 Multi-timeframe predictions</strong> (1M, 6M, 1Y, 5Y)</li>
                    <li>Machine Learning models (Random Forest, Gradient Boosting)</li>
                    <li>Technical indicators (MA, RSI, MACD, Bollinger Bands)</li>
                    <li>Price targets with confidence levels</li>
                    <li>Feature importance analysis</li>
                    <li>Model performance metrics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🛠️ Technology Stack</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Backend</p>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                        <li>FastAPI</li>
                        <li>Scikit-learn</li>
                        <li>Pandas & NumPy</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Frontend</p>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                        <li>Next.js 14</li>
                        <li>shadcn/ui</li>
                        <li>visx Charts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📊 ML Models</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Random Forest</strong> - Primary model with 100
                      estimators
                    </li>
                    <li>
                      <strong>Gradient Boosting</strong> - Alternative ensemble
                      method
                    </li>
                    <li>
                      <strong>Linear Models</strong> - Ridge & Lasso for
                      baseline comparison
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ⚠️ <strong>Disclaimer:</strong> This tool is for educational
                    purposes only. Not financial advice. Always consult with a
                    financial advisor before making investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
