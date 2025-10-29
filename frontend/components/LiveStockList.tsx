"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Star,
  ArrowUpDown,
  Activity,
} from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LiveStockListProps {
  onSelectStock: (symbol: string) => void;
}

export function LiveStockList({ onSelectStock }: LiveStockListProps) {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "symbol" | "price" | "change" | "volume"
  >("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/market/stocks-all`);
        if (!response.ok) throw new Error("Failed to fetch stocks");

        const data = await response.json();
        const normalized = (data.stocks || []).map((s: any) => ({
          symbol: s.symbol,
          name: s.name,
          price: Number(s.current_price ?? s.price ?? 0),
          change: Number(s.change ?? 0),
          changePercent: Number(s.change_percent ?? s.changePercent ?? 0),
          volume: Number(s.volume ?? 0),
          sector: s.sector || "Unknown",
        }));
        setStocks(normalized);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

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
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "symbol":
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "change":
        aValue = a.changePercent;
        bValue = b.changePercent;
        break;
      case "volume":
        aValue = a.volume;
        bValue = b.volume;
        break;
      default:
        aValue = a.symbol;
        bValue = b.symbol;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-sm font-semibold mb-2">Loading Market Data</h3>
          <p className="text-xs text-muted-foreground">
            Fetching real-time information...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-semibold">Live Market</span>
          </span>
          <Badge variant="secondary" className="text-[10px] font-mono">
            {stocks.length} stocks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center space-x-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Sort:
            </span>
            <Button
              variant={sortBy === "symbol" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort("symbol")}
              className="h-6 px-2 text-[10px]"
            >
              Symbol
              <ArrowUpDown className="h-2.5 w-2.5 ml-1" />
            </Button>
            <Button
              variant={sortBy === "price" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort("price")}
              className="h-6 px-2 text-[10px]"
            >
              Price
              <ArrowUpDown className="h-2.5 w-2.5 ml-1" />
            </Button>
            <Button
              variant={sortBy === "change" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort("change")}
              className="h-6 px-2 text-[10px]"
            >
              Change
              <ArrowUpDown className="h-2.5 w-2.5 ml-1" />
            </Button>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {sortedStocks.length > 0 ? (
            <div className="divide-y">
              {sortedStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`flex items-center justify-between p-4 hover:bg-accent cursor-pointer transition-colors ${
                    selectedStock === stock.symbol ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedStock(stock.symbol);
                    onSelectStock(stock.symbol);
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold">
                        {stock.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stock.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-semibold text-sm font-mono">
                      {formatCurrency(stock.price)}
                    </p>
                    <div
                      className={`flex items-center justify-end space-x-1 text-xs ${getChangeColor(
                        stock.change
                      )}`}
                    >
                      {getChangeIcon(stock.change)}
                      <span className="font-mono font-semibold">
                        {stock.change > 0 ? "+" : ""}
                        {Number(stock.changePercent ?? 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No stocks found matching your search
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
