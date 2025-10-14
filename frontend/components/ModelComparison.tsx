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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ModelMetrics {
  rmse: number;
  mae: number;
  r2: number;
  mape: number;
}

interface TimeframeData {
  modelMetrics: ModelMetrics;
  trend: string;
  recommendation: string;
  confidence: string;
}

export function ModelComparison({ symbol }: { symbol: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, TimeframeData>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (symbol) {
      fetchComparison();
    }
  }, [symbol]);

  const fetchComparison = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all timeframe predictions for comparison
      const timeframes = ["1M", "6M", "1Y", "5Y"];
      const results: Record<string, TimeframeData> = {};

      for (const tf of timeframes) {
        try {
          const response = await axios.get(
            `${API_URL}/live/stocks/${symbol}/predict?timeframe=${tf}`
          );
          results[tf] = response.data;
        } catch (err) {
          console.error(`Error fetching ${tf}:`, err);
        }
      }

      setData(results);
    } catch (err: any) {
      setError(err.message || "Failed to fetch model comparison");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading model comparison...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const timeframes = Object.keys(data);

  if (timeframes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Unable to fetch model data for {symbol}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Comparison - {symbol}</CardTitle>
          <CardDescription>
            Compare ML model performance across different timeframes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Metrics Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics by Timeframe</CardTitle>
          <CardDescription>
            Lower is better for RMSE, MAE, MAPE. Higher is better for R²
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="p-3 text-left">Timeframe</th>
                  <th className="p-3 text-right">Model</th>
                  <th className="p-3 text-right">RMSE</th>
                  <th className="p-3 text-right">MAE</th>
                  <th className="p-3 text-right">R²</th>
                  <th className="p-3 text-right">MAPE</th>
                  <th className="p-3 text-center">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {timeframes.map((tf) => {
                  const metrics = data[tf].modelMetrics;
                  const model = ["1M", "6M"].includes(tf)
                    ? "Random Forest"
                    : "Gradient Boosting";
                  const isGoodR2 = metrics.r2 > 0.5;

                  return (
                    <tr
                      key={tf}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <td className="p-3 font-semibold">{tf}</td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        {model}
                      </td>
                      <td className="p-3 text-right">
                        ₹{metrics.rmse.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        ₹{metrics.mae.toFixed(2)}
                      </td>
                      <td
                        className={`p-3 text-right font-semibold ${
                          isGoodR2 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {metrics.r2.toFixed(4)}
                      </td>
                      <td className="p-3 text-right">
                        {metrics.mape.toFixed(2)}%
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            data[tf].recommendation === "BUY"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                              : data[tf].recommendation === "SELL"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                          }`}
                        >
                          {data[tf].recommendation}
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

      {/* Model Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Short-Term Model</CardTitle>
            <CardDescription>
              Random Forest (1M, 6M predictions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Estimators:</span>
                <span className="font-semibold">100</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Max Depth:</span>
                <span className="font-semibold">10</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Best For:</span>
                <span className="font-semibold">Volatility Capture</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Features:</span>
                <span className="font-semibold">15+</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Long-Term Model</CardTitle>
            <CardDescription>
              Gradient Boosting (1Y, 5Y predictions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Estimators:</span>
                <span className="font-semibold">150</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Max Depth:</span>
                <span className="font-semibold">8</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Best For:</span>
                <span className="font-semibold">Trend Detection</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Learning Rate:</span>
                <span className="font-semibold">0.05</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Recommendations Summary</CardTitle>
          <CardDescription>Across all timeframes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeframes.map((tf) => (
              <div
                key={tf}
                className={`p-4 rounded-lg text-center ${
                  data[tf].recommendation === "BUY"
                    ? "bg-green-50 dark:bg-green-900/20"
                    : data[tf].recommendation === "SELL"
                    ? "bg-red-50 dark:bg-red-900/20"
                    : "bg-yellow-50 dark:bg-yellow-900/20"
                }`}
              >
                <div className="text-sm text-muted-foreground mb-1">{tf}</div>
                <div
                  className={`text-xl font-bold mb-1 ${
                    data[tf].recommendation === "BUY"
                      ? "text-green-600"
                      : data[tf].recommendation === "SELL"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {data[tf].recommendation}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data[tf].confidence} Confidence
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data[tf].trend} Trend
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
