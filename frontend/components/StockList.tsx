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
import { formatCurrency, formatPercent, getChangeColor } from "@/lib/utils";
import { StockCardLoader } from "./LoadingScreen";

const API_URL = "https://stock-app-iscx.onrender.com";

interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
}

export function StockList({
  onSelectStock,
}: {
  onSelectStock: (symbol: string) => void;
}) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/stocks?category=Nifty50&limit=10`
      );
      setStocks(response.data.stocks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setLoading(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setSelected(symbol);
    onSelectStock(symbol);
  };

  if (loading) {
    return <StockCardLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nifty 50 Stocks</CardTitle>
        <CardDescription>Select a stock to analyze</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stocks.map((stock) => (
            <Button
              key={stock.symbol}
              variant={selected === stock.symbol ? "default" : "outline"}
              className="w-full justify-between h-auto py-3"
              onClick={() => handleSelectStock(stock.symbol)}
            >
              <div className="text-left">
                <div className="font-semibold">{stock.symbol}</div>
                <div className="text-xs opacity-70">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(stock.currentPrice)}
                </div>
                <div
                  className={`text-xs ${getChangeColor(stock.changePercent)}`}
                >
                  {formatPercent(stock.changePercent)}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
