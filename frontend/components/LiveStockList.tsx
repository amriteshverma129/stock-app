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
import { RefreshCw } from "lucide-react";
import { StockCardLoader } from "./LoadingScreen";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Stock {
  symbol: string;
  name: string;
}

export function LiveStockList({
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
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/live/stocks`);
      setStocks(response.data.stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Indian Stocks (Live)</CardTitle>
            <CardDescription>Real-time data from Yahoo Finance</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={fetchStocks}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
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
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
