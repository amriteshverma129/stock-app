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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PredictionData {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  predictions: Array<{
    date: string;
    daysAhead: number;
    predicted: number;
    upperBound: number;
    lowerBound: number;
    confidence: number;
  }>;
  modelMetrics: {
    rmse: number;
    mae: number;
    r2: number;
    mape: number;
  };
  trend: string;
  priceTargets: {
    conservative: number;
    moderate: number;
    aggressive: number;
    conservative_pct: number;
    moderate_pct: number;
    aggressive_pct: number;
  };
  recommendation: string;
  confidence: string;
}

export function LiveStockAnalysis({ symbol }: { symbol: string }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (symbol) {
      fetchPredictions();
    }
  }, [symbol, selectedTimeframe]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/live/stocks/${symbol}/predict?timeframe=${selectedTimeframe}`
      );
      setPredictionData(response.data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading predictions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!predictionData) {
    return null;
  }

  const { currentPrice, predictions, modelMetrics, trend, priceTargets, recommendation, confidence } = predictionData;
  
  const lastPrediction = predictions[predictions.length - 1];
  const expectedReturn = ((lastPrediction.predicted - currentPrice) / currentPrice) * 100;

  return (
    <div className="space-y-4">
      {/* Timeframe Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{symbol} - Live Analysis</span>
            <div className="flex gap-2">
              {['1M', '6M', '1Y', '5Y'].map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={selectedTimeframe === tf ? "default" : "outline"}
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </CardTitle>
          <CardDescription>
            Multi-timeframe ML predictions with real-time data
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Status & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(currentPrice)}</div>
            <div className={`text-sm mt-1 flex items-center gap-1 ${trend === 'Bullish' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'Bullish' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {trend} Trend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              {selectedTimeframe} Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(lastPrediction.predicted)}</div>
            <div className={`text-sm mt-1 ${expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(expectedReturn)} Expected
            </div>
          </CardContent>
        </Card>

        <Card className={
          recommendation === 'BUY' ? 'bg-green-50 dark:bg-green-900/20' :
          recommendation === 'SELL' ? 'bg-red-50 dark:bg-red-900/20' :
          'bg-yellow-50 dark:bg-yellow-900/20'
        }>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              recommendation === 'BUY' ? 'text-green-600' :
              recommendation === 'SELL' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {recommendation}
            </div>
            <div className="text-sm mt-1 text-muted-foreground">
              Confidence: {confidence}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Price Targets ({selectedTimeframe})</CardTitle>
          <CardDescription>Conservative, Moderate, and Aggressive targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Conservative</div>
              <div className="text-2xl font-bold">{formatCurrency(priceTargets.conservative)}</div>
              <div className="text-sm text-blue-600">+{priceTargets.conservative_pct.toFixed(1)}%</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Moderate</div>
              <div className="text-2xl font-bold">{formatCurrency(priceTargets.moderate)}</div>
              <div className="text-sm text-green-600">+{priceTargets.moderate_pct.toFixed(1)}%</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Aggressive</div>
              <div className="text-2xl font-bold">{formatCurrency(priceTargets.aggressive)}</div>
              <div className="text-sm text-purple-600">+{priceTargets.aggressive_pct.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
          <CardDescription>How accurate is the {selectedTimeframe} prediction model?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-muted-foreground">RMSE</div>
              <div className="text-lg font-bold mt-1">₹{modelMetrics.rmse.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-muted-foreground">MAE</div>
              <div className="text-lg font-bold mt-1">₹{modelMetrics.mae.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-muted-foreground">R² Score</div>
              <div className="text-lg font-bold mt-1">{modelMetrics.r2.toFixed(4)}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-muted-foreground">MAPE</div>
              <div className="text-lg font-bold mt-1">{modelMetrics.mape.toFixed(2)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Predictions</CardTitle>
          <CardDescription>Predicted prices with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-right">Days Ahead</th>
                  <th className="p-2 text-right">Predicted Price</th>
                  <th className="p-2 text-right">Range</th>
                  <th className="p-2 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 20).map((pred, idx) => {
                  const change = ((pred.predicted - currentPrice) / currentPrice) * 100;
                  return (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-2">{pred.date}</td>
                      <td className="p-2 text-right text-muted-foreground">{pred.daysAhead}d</td>
                      <td className={`p-2 text-right font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pred.predicted)}
                      </td>
                      <td className="p-2 text-right text-xs text-muted-foreground">
                        {formatCurrency(pred.lowerBound)} - {formatCurrency(pred.upperBound)}
                      </td>
                      <td className="p-2 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          pred.confidence > 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                          pred.confidence > 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30'
                        }`}>
                          {pred.confidence.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeframe:</span>
              <span className="font-semibold">{selectedTimeframe}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Price:</span>
              <span className="font-semibold">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Predicted Price:</span>
              <span className="font-semibold">{formatCurrency(lastPrediction.predicted)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Return:</span>
              <span className={`font-semibold ${expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(expectedReturn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trend:</span>
              <span className={`font-semibold ${trend === 'Bullish' ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recommendation:</span>
              <span className={`font-bold ${
                recommendation === 'BUY' ? 'text-green-600' :
                recommendation === 'SELL' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {recommendation} ({confidence} Confidence)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

