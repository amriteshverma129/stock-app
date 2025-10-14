"use client";

import { useMemo } from "react";
import { BarStack } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectorData {
  name: string;
  avgChange: number;
  count: number;
}

interface SectorPerformanceChartProps {
  sectors: SectorData[];
}

const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 60, left: 80 };

const xMax = width - margin.left - margin.right;
const yMax = height - margin.top - margin.bottom;

export function SectorPerformanceChart({ sectors }: SectorPerformanceChartProps) {
  // Sort sectors by performance
  const sortedSectors = useMemo(
    () => [...sectors].sort((a, b) => b.avgChange - a.avgChange),
    [sectors]
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: sortedSectors.map((d) => d.name),
        range: [0, xMax],
        padding: 0.3,
      }),
    [sortedSectors]
  );

  const yScale = useMemo(() => {
    const values = sortedSectors.map((d) => d.avgChange);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    
    return scaleLinear<number>({
      domain: [min - 1, max + 1],
      range: [yMax, 0],
      nice: true,
    });
  }, [sortedSectors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Performance</CardTitle>
        <CardDescription>Average change by sector</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {/* Zero line */}
            <line
              x1={0}
              x2={xMax}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke="#94a3b8"
              strokeWidth={2}
            />

            {/* Bars */}
            {sortedSectors.map((sector) => {
              const barHeight = Math.abs(yScale(sector.avgChange) - yScale(0));
              const barWidth = xScale.bandwidth();
              const barX = xScale(sector.name) || 0;
              const barY = sector.avgChange >= 0 
                ? yScale(sector.avgChange)
                : yScale(0);

              return (
                <g key={sector.name}>
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={sector.avgChange >= 0 ? '#10b981' : '#ef4444'}
                    opacity={0.8}
                  />
                  <text
                    x={barX + barWidth / 2}
                    y={barY - 5}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#1e293b"
                  >
                    {sector.avgChange.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <AxisBottom
              top={yScale(0)}
              scale={xScale}
              tickLabelProps={() => ({
                fill: '#64748b',
                fontSize: 11,
                textAnchor: 'middle',
                angle: -45,
                dx: -10,
                dy: 5,
              })}
            />
            <AxisLeft
              scale={yScale}
              label="Average Change (%)"
              labelOffset={50}
              tickLabelProps={() => ({
                fill: '#64748b',
                fontSize: 11,
                textAnchor: 'end',
              })}
            />
          </Group>
        </svg>
      </CardContent>
    </Card>
  );
}

