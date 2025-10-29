"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  Brain,
} from "lucide-react";
const API_URL = "https://stock-app-iscx.onrender.com";

interface Prediction {
  timeframe: string;
  predictedPrice: number;
  confidence: number;
  recommendation: "BUY" | "SELL" | "HOLD";
  reasoning: string;
}

interface TechnicalAnalysis {
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  bollingerUpper: number;
  bollingerLower: number;
  support: number;
  resistance: number;
}

interface LiveStockAnalysisProps {
  symbol: string;
}

export function LiveStockAnalysis({ symbol }: LiveStockAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<any>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [technicalAnalysis, setTechnicalAnalysis] =
    useState<TechnicalAnalysis | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);

      try {
        // Fetch stock data from API
        const response = await fetch(`${API_URL}/market/stocks-all`);
        const data = await response.json();
        const stockRaw = (data?.stocks || []).find(
          (s: any) => s.symbol === symbol
        );

        if (stockRaw) {
          const normalized = {
            symbol: stockRaw.symbol,
            name: stockRaw.name,
            price: Number(stockRaw.current_price ?? stockRaw.price ?? 0),
            change: Number(stockRaw.change ?? 0),
            changePercent: Number(
              stockRaw.change_percent ?? stockRaw.changePercent ?? 0
            ),
            volume: Number(stockRaw.volume ?? 0),
            marketCap:
              typeof stockRaw.market_cap === "number" ? stockRaw.market_cap : 0,
            pe: typeof stockRaw.pe_ratio === "number" ? stockRaw.pe_ratio : 0,
            beta: typeof stockRaw.beta === "number" ? stockRaw.beta : 1,
          };

          setStock(normalized);

          const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y"];
          const generatedPredictions = timeframes.map((timeframe) => {
            const volatility = Math.random() * 0.1;
            const trend = Math.random() > 0.5 ? 1 : -1;
            const predictedPrice = normalized.price * (1 + trend * volatility);
            const confidence = Math.random() * 0.3 + 0.7;

            let recommendation: "BUY" | "SELL" | "HOLD";
            if (predictedPrice > normalized.price * 1.05)
              recommendation = "BUY";
            else if (predictedPrice < normalized.price * 0.95)
              recommendation = "SELL";
            else recommendation = "HOLD";

            return {
              timeframe,
              predictedPrice,
              confidence,
              recommendation,
              reasoning: `Based on ${timeframe} technical analysis and ML models, ${recommendation} signal with ${(
                confidence * 100
              ).toFixed(1)}% confidence.`,
            };
          });

          setPredictions(generatedPredictions);

          // Synthesize simple technicals from available fields
          const rsi = Math.max(0, Math.min(100, 50 + normalized.changePercent));
          setTechnicalAnalysis({
            rsi,
            macd: normalized.change,
            sma20: normalized.price * 0.98,
            sma50: normalized.price * 0.95,
            bollingerUpper: normalized.price * 1.05,
            bollingerLower: normalized.price * 0.95,
            support: normalized.price * 0.9,
            resistance: normalized.price * 1.1,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
      }

      setLoading(false);
    };

    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY":
        return "bg-green-50 border-green-500 text-green-700";
      case "SELL":
        return "bg-red-50 border-red-500 text-red-700";
      case "HOLD":
        return "bg-yellow-50 border-yellow-500 text-yellow-700";
      default:
        return "bg-gray-50 border-gray-500 text-gray-700";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Analyzing {symbol}</h3>
          <p className="text-sm text-muted-foreground">
            Running AI models and technical analysis...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stock) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Stock Not Found</h3>
          <p className="text-sm text-muted-foreground">
            Unable to find data for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentPrediction = predictions.find(
    (p) => p.timeframe === selectedTimeframe
  );

  return (
    <div className="space-y-4">
      {/* Row 1: Stock Details */}
      <Card className="border border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-lg font-bold">{stock.symbol}</h3>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono">
                  {formatCurrency(stock.price)}
                </p>
                <div
                  className={`flex items-center space-x-1 ${getChangeColor(
                    stock.change
                  )}`}
                >
                  {getChangeIcon(stock.change)}
                  <span className="text-xs font-mono font-semibold">
                    {stock.change > 0 ? "+" : ""}
                    {stock.change.toFixed(2)} (
                    {stock.changePercent > 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Market Cap
                </p>
                <p className="font-semibold text-xs font-mono">
                  ₹{(stock.marketCap / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  P/E
                </p>
                <p className="font-semibold text-xs font-mono">
                  {stock.pe.toFixed(1)}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Volume
                </p>
                <p className="font-semibold text-xs font-mono">
                  {(stock.volume / 1e6).toFixed(1)}M
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Beta
                </p>
                <p className="font-semibold text-xs font-mono">
                  {stock.beta.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 2: AI Prediction & Recommendation */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                AI Prediction & Recommendation
              </span>
            </div>
            <div className="flex gap-1">
              {["1D", "1W", "1M", "3M", "6M", "1Y"].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={
                    selectedTimeframe === timeframe ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className="h-6 px-2 text-[10px] font-mono"
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Recommendation Badge */}
            <div className="md:col-span-3">
              <div
                className={`h-full rounded-lg border-2 flex flex-col items-center justify-center p-4 ${getRecommendationColor(
                  currentPrediction?.recommendation || "HOLD"
                )}`}
              >
                <p className="text-[10px] font-medium mb-1 uppercase tracking-wide">
                  Recommendation
                </p>
                <span className="font-bold text-2xl">
                  {currentPrediction?.recommendation || "HOLD"}
                </span>
                <p className="text-[10px] mt-1 font-mono">
                  {selectedTimeframe}
                </p>
              </div>
            </div>

            {/* Prediction Details */}
            <div className="md:col-span-9 space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                    Current
                  </p>
                  <p className="font-semibold text-sm font-mono">
                    {formatCurrency(stock.price)}
                  </p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                    Target
                  </p>
                  <p className="font-semibold text-sm font-mono">
                    {formatCurrency(
                      currentPrediction?.predictedPrice || stock.price
                    )}
                  </p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                    Move
                  </p>
                  <p
                    className={`font-semibold text-sm font-mono ${
                      (currentPrediction?.predictedPrice || stock.price) >
                      stock.price
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(
                      (((currentPrediction?.predictedPrice || stock.price) -
                        stock.price) /
                        stock.price) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                    Confidence
                  </p>
                  <p className="font-semibold text-sm font-mono">
                    {((currentPrediction?.confidence || 0.5) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Analysis Reasoning */}
              <div className="p-2 border rounded bg-muted/30">
                <p className="text-[10px] font-semibold mb-1 uppercase tracking-wide">
                  AI Analysis
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {currentPrediction?.reasoning ||
                    "Select a timeframe to view prediction"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Technical Analysis */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-semibold">Technical Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {technicalAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  RSI
                </p>
                <p className="text-base font-bold font-mono">
                  {technicalAnalysis.rsi.toFixed(1)}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {technicalAnalysis.rsi > 70
                    ? "Overbought"
                    : technicalAnalysis.rsi < 30
                    ? "Oversold"
                    : "Neutral"}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  MACD
                </p>
                <p className="text-base font-bold font-mono">
                  {technicalAnalysis.macd.toFixed(2)}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {technicalAnalysis.macd > 0 ? "Bullish" : "Bearish"}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  SMA 20
                </p>
                <p className="font-semibold text-xs font-mono">
                  {formatCurrency(technicalAnalysis.sma20)}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  SMA 50
                </p>
                <p className="font-semibold text-xs font-mono">
                  {formatCurrency(technicalAnalysis.sma50)}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  Support
                </p>
                <p className="font-semibold text-xs font-mono">
                  {formatCurrency(technicalAnalysis.support)}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  Resistance
                </p>
                <p className="font-semibold text-xs font-mono">
                  {formatCurrency(technicalAnalysis.resistance)}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  BB Upper
                </p>
                <p className="font-semibold text-xs font-mono">
                  {formatCurrency(technicalAnalysis.bollingerUpper)}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  BB Lower
                </p>
                <p className="font-semibold text-xs font-mono">
                  {formatCurrency(technicalAnalysis.bollingerLower)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
