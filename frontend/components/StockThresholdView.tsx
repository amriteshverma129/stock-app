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
import { ThresholdChart } from "@/components/charts/ThresholdChart";
import { Button } from "@/components/ui/button";

const API_URL = "https://stock-app-iscx.onrender.com";

interface ThresholdData {
  date: string;
  price: number;
  predicted?: number;
}

export function StockThresholdView({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ThresholdData[]>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<number | undefined>(undefined);
  const [useCustomThreshold, setUseCustomThreshold] = useState(false);

  useEffect(() => {
    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch historical data
      const historyResponse = await axios.get(
        `${API_URL}/live/stocks/${symbol}?period=6mo`
      );

      // Fetch predictions
      const predictionResponse = await axios.get(
        `${API_URL}/live/stocks/${symbol}/predict?timeframe=1M`
      );

      // Combine historical and prediction data
      const historicalData: ThresholdData[] =
        historyResponse.data.priceHistory.map((item: any) => ({
          date: item.date,
          price: item.close,
        }));

      const predictionData: ThresholdData[] =
        predictionResponse.data.predictions.slice(0, 30).map((item: any) => ({
          date: item.date,
          price: item.predicted,
          predicted: item.predicted,
        }));

      // Combine and sort by date
      const combined = [...historicalData, ...predictionData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setData(combined);

      // Set default threshold to average of last 30 days
      const last30Days = historicalData.slice(-30);
      const avgPrice =
        last30Days.reduce((sum, d) => sum + d.price, 0) / last30Days.length;
      setThreshold(avgPrice);
    } catch (error) {
      console.error("Error fetching threshold data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading threshold analysis...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Please select a stock to view threshold analysis
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentPrice = data.find((d) => !d.predicted)?.price || 0;
  const isAboveThreshold = threshold ? currentPrice > threshold : false;
  const percentFromThreshold = threshold
    ? ((currentPrice - threshold) / threshold) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Threshold Analysis - {symbol}</CardTitle>
          <CardDescription>
            Visual representation of price movements above and below threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Current Price
              </div>
              <div className="text-2xl font-bold">
                ₹{currentPrice.toFixed(2)}
              </div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Threshold Level
              </div>
              <div className="text-2xl font-bold">
                ₹{threshold?.toFixed(2) || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                (30-day average)
              </div>
            </div>

            <div
              className={`text-center p-4 rounded-lg ${
                isAboveThreshold
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div
                className={`text-2xl font-bold ${
                  isAboveThreshold ? "text-green-600" : "text-red-600"
                }`}
              >
                {isAboveThreshold ? "Above" : "Below"}
              </div>
              <div
                className={`text-sm font-semibold mt-1 ${
                  isAboveThreshold ? "text-green-600" : "text-red-600"
                }`}
              >
                {percentFromThreshold > 0 ? "+" : ""}
                {percentFromThreshold.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Threshold Controls */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              size="sm"
              variant={useCustomThreshold ? "outline" : "default"}
              onClick={() => {
                setUseCustomThreshold(false);
                // Reset to average
                const last30Days = data.filter((d) => !d.predicted).slice(-30);
                const avgPrice =
                  last30Days.reduce((sum, d) => sum + d.price, 0) /
                  last30Days.length;
                setThreshold(avgPrice);
              }}
            >
              Auto (30-day Avg)
            </Button>
            <Button
              size="sm"
              variant={useCustomThreshold ? "default" : "outline"}
              onClick={() => setUseCustomThreshold(true)}
            >
              Custom
            </Button>
            {useCustomThreshold && (
              <input
                type="number"
                className="border rounded px-3 py-1 w-32"
                placeholder="Threshold"
                value={threshold || ""}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Threshold Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price vs Threshold Over Time</CardTitle>
          <CardDescription>
            Green areas indicate price above threshold, red areas below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThresholdChart
            data={data}
            width={900}
            height={400}
            thresholdValue={threshold}
          />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Days Above Threshold:
              </span>
              <span className="font-semibold text-green-600">
                {
                  data
                    .filter((d) => !d.predicted)
                    .filter((d) => threshold && d.price > threshold).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Days Below Threshold:
              </span>
              <span className="font-semibold text-red-600">
                {
                  data
                    .filter((d) => !d.predicted)
                    .filter((d) => threshold && d.price < threshold).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Highest Price:</span>
              <span className="font-semibold">
                ₹
                {Math.max(
                  ...data.filter((d) => !d.predicted).map((d) => d.price)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lowest Price:</span>
              <span className="font-semibold">
                ₹
                {Math.min(
                  ...data.filter((d) => !d.predicted).map((d) => d.price)
                ).toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Predicted 30-day Trend:
                </span>
                <span
                  className={`font-semibold ${
                    (data[data.length - 1]?.predicted ?? 0) > currentPrice
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(data[data.length - 1]?.predicted ?? 0) > currentPrice
                    ? "↗ Bullish"
                    : "↘ Bearish"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
