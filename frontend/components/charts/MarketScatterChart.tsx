"use client";

import { useMemo } from "react";
import { scaleLinear } from "@visx/scale";
import { Circle } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

interface StockData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface SectorData {
  name: string;
  avgChange: number;
}

interface MarketScatterChartProps {
  stocks: StockData[];
  sectors: SectorData[];
}

const width = 900;
const height = 500;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

const xMax = width - margin.left - margin.right;
const yMax = height - margin.top - margin.bottom;

// Sector colors
const sectorColors: Record<string, string> = {
  IT: "#3b82f6",
  Banking: "#10b981",
  Auto: "#f59e0b",
  Energy: "#ef4444",
  FMCG: "#8b5cf6",
  Pharma: "#ec4899",
  Metals: "#6366f1",
  Cement: "#14b8a6",
  Infrastructure: "#f97316",
  Telecom: "#06b6d4",
  Finance: "#84cc16",
  "Oil & Gas": "#dc2626",
  Mining: "#a855f7",
  Power: "#eab308",
  Paint: "#22c55e",
  Jewelry: "#f43f5e",
  Conglomerate: "#6b7280",
  Unknown: "#9ca3af",
};

export function MarketScatterChart({
  stocks,
  sectors,
}: MarketScatterChartProps) {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<StockData>();

  // X-axis: Market Cap (log scale for better distribution)
  // Y-axis: Change Percent
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [
          Math.min(...stocks.map((d) => Math.log10(d.marketCap + 1))),
          Math.max(...stocks.map((d) => Math.log10(d.marketCap + 1))),
        ],
        range: [0, xMax],
        nice: true,
      }),
    [stocks]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [
          Math.min(...stocks.map((d) => d.changePercent)) - 1,
          Math.max(...stocks.map((d) => d.changePercent)) + 1,
        ],
        range: [yMax, 0],
        nice: true,
      }),
    [stocks]
  );

  const handleMouseOver = (event: React.MouseEvent, stock: StockData) => {
    const svgElement = (event.target as SVGElement).ownerSVGElement;
    if (svgElement) {
      const coords = localPoint(svgElement, event);
      showTooltip({
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
        tooltipData: stock,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Risk-Return Scatter Plot</CardTitle>
          <CardDescription>
            Market Cap (X-axis) vs Performance (Y-axis) • Size = Volume • Color
            = Sector
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div style={{ position: "relative" }}>
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {/* Grid */}
                <GridRows
                  scale={yScale}
                  width={xMax}
                  stroke="#e2e8f0"
                  strokeOpacity={0.3}
                />
                <GridColumns
                  scale={xScale}
                  height={yMax}
                  stroke="#e2e8f0"
                  strokeOpacity={0.3}
                />

                {/* Zero line */}
                <line
                  x1={0}
                  x2={xMax}
                  y1={yScale(0)}
                  y2={yScale(0)}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4"
                />

                {/* Data points */}
                {stocks.map((stock, i) => {
                  const cx = xScale(Math.log10(stock.marketCap + 1));
                  const cy = yScale(stock.changePercent);
                  const r = Math.sqrt(stock.volume / 1000000) + 3; // Size by volume

                  return (
                    <Circle
                      key={`stock-${i}`}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={
                        sectorColors[stock.sector] || sectorColors["Unknown"]
                      }
                      fillOpacity={0.7}
                      stroke={stock.changePercent >= 0 ? "#10b981" : "#ef4444"}
                      strokeWidth={2}
                      onMouseOver={(e) => handleMouseOver(e, stock)}
                      onMouseOut={hideTooltip}
                      style={{ cursor: "pointer" }}
                    />
                  );
                })}

                {/* Axes */}
                <AxisBottom
                  top={yMax}
                  scale={xScale}
                  label="Market Cap (Log Scale)"
                  labelOffset={15}
                  tickLabelProps={() => ({
                    fill: "#64748b",
                    fontSize: 11,
                    textAnchor: "middle",
                  })}
                />
                <AxisLeft
                  scale={yScale}
                  label="Change (%)"
                  labelOffset={40}
                  tickLabelProps={() => ({
                    fill: "#64748b",
                    fontSize: 11,
                    textAnchor: "end",
                  })}
                />
              </Group>
            </svg>

            {/* Tooltip */}
            {tooltipData && (
              <TooltipWithBounds
                top={tooltipTop}
                left={tooltipLeft}
                style={{
                  ...defaultStyles,
                  background: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                <div>
                  <div className="font-bold text-sm mb-1">
                    {tooltipData.symbol}
                  </div>
                  <div className="text-xs opacity-80 mb-2">
                    {tooltipData.name}
                  </div>
                  <div className="space-y-1">
                    <div>Price: ₹{tooltipData.price.toFixed(2)}</div>
                    <div
                      className={
                        tooltipData.changePercent >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      Change: {formatPercent(tooltipData.changePercent)}
                    </div>
                    <div>
                      Volume: {(tooltipData.volume / 1000000).toFixed(2)}M
                    </div>
                    <div>
                      Market Cap: ₹{tooltipData.marketCap.toFixed(0)} Cr
                    </div>
                    <div>Sector: {tooltipData.sector}</div>
                  </div>
                </div>
              </TooltipWithBounds>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sector Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sector Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(sectorColors)
              .filter(([sector]) => sectors.some((s) => s.name === sector))
              .map(([sector, color]) => (
                <div key={sector} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs">{sector}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
