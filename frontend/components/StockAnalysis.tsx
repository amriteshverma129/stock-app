"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StockAnalysis({ symbol }: { symbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{symbol} Analysis</CardTitle>
        <CardDescription>Stock analysis and predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-semibold mb-2">
            Stock Analysis Coming Soon
          </p>
          <p className="text-sm">
            This component will display interactive charts with visx,
            <br />
            ML predictions, and technical indicators.
          </p>
          <p className="text-xs mt-4">
            Selected stock: <strong>{symbol}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
