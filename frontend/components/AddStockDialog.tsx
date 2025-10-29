"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { DatePicker } from "./DatePicker";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  sector: string;
}

interface AddStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    symbol: string,
    quantity: number,
    avgPrice: number,
    purchaseDate?: string
  ) => void;
}

export function AddStockDialog({
  isOpen,
  onClose,
  onAdd,
}: AddStockDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stocks from backend
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_URL}/market/stocks-all`)
        .then((res) => res.json())
        .then((data) => {
          const stocks = data?.stocks || [];
          const normalized = stocks.map((s: any) => ({
            symbol: s.symbol,
            name: s.name,
            price: Number(s.current_price ?? s.price ?? 0),
            sector: s.sector || "Unknown",
          }));
          setStocks(normalized);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch stocks:", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStocks = stocks
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10); // Limit to 10 results

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol);

  const handleAdd = () => {
    if (!selectedSymbol || !quantity || !avgPrice) {
      alert("Please fill in all fields");
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(avgPrice);

    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      alert("Please enter valid numbers");
      return;
    }

    onAdd(selectedSymbol, qty, price, purchaseDate || undefined);
    setSearchTerm("");
    setSelectedSymbol("");
    setQuantity("");
    setAvgPrice("");
    setPurchaseDate("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="font-semibold">Add Stock to Portfolio</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Search Stock */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide">
              Search Stock
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            {searchTerm && (
              <div className="border rounded divide-y max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Loading stocks...
                  </div>
                ) : filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className={`p-2 hover:bg-accent cursor-pointer flex items-center justify-between transition-colors ${
                        selectedSymbol === stock.symbol ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        setSelectedSymbol(stock.symbol);
                        // Don't auto-fill price - let user enter their actual purchase price
                        setSearchTerm("");
                      }}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                          <span className="text-xs font-semibold">
                            {stock.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {stock.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm font-mono">
                          ₹{Number(stock.price ?? 0).toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-[10px]">
                          {stock.sector}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No stocks found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Stock */}
          {selectedStock && (
            <div className="p-3 bg-muted rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {selectedStock.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStock.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Current Price
                  </p>
                  <p className="font-semibold text-sm font-mono">
                    ₹{Number(selectedStock.price ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide">
              Quantity (Shares)
            </label>
            <Input
              type="number"
              placeholder="Enter number of shares"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              className="h-9 text-sm"
            />
          </div>

          {/* Average Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide">
              Average Purchase Price (₹)
            </label>
            <Input
              type="number"
              placeholder="Enter purchase price per share"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              min="0"
              step="0.01"
              className="h-9 text-sm"
            />
          </div>

          {/* Purchase Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide">
              Purchase Date (Optional)
            </label>
            <DatePicker
              value={purchaseDate}
              onChange={setPurchaseDate}
              placeholder="Select purchase date"
              maxDate={new Date().toISOString().split("T")[0]}
            />
            <p className="text-[10px] text-muted-foreground">
              Select the date when you purchased this stock
            </p>
          </div>

          {/* Summary */}
          {selectedStock && quantity && avgPrice && (
            <div className="p-3 bg-muted rounded space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Investment Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-background rounded">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Total Cost
                  </p>
                  <p className="font-semibold font-mono">
                    ₹{(parseFloat(quantity) * parseFloat(avgPrice)).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-background rounded">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Current Value
                  </p>
                  <p className="font-semibold font-mono">
                    ₹{(parseFloat(quantity) * selectedStock.price).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-background rounded">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Profit/Loss
                  </p>
                  <p
                    className={`font-semibold font-mono ${
                      parseFloat(quantity) * selectedStock.price -
                        parseFloat(quantity) * parseFloat(avgPrice) >
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹
                    {(
                      parseFloat(quantity) * selectedStock.price -
                      parseFloat(quantity) * parseFloat(avgPrice)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-background rounded">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Return %
                  </p>
                  <p
                    className={`font-semibold font-mono ${
                      ((selectedStock.price - parseFloat(avgPrice)) /
                        parseFloat(avgPrice)) *
                        100 >
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(
                      ((selectedStock.price - parseFloat(avgPrice)) /
                        parseFloat(avgPrice)) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
                {purchaseDate && (
                  <>
                    <div className="p-2 bg-background rounded">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Purchase Date
                      </p>
                      <p className="font-semibold">
                        {new Date(purchaseDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Holding Period
                      </p>
                      <p className="font-semibold font-mono">
                        {Math.floor(
                          (new Date().getTime() -
                            new Date(purchaseDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={handleAdd}
              disabled={!selectedSymbol || !quantity || !avgPrice}
            >
              Add to Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
