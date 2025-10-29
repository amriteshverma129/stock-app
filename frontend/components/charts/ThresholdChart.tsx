"use client";

import React from "react";
import { Group } from "@visx/group";
import { AreaClosed, LinePath } from "@visx/shape";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import { Threshold } from "@visx/threshold";
import { curveMonotoneX } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";

interface DataPoint {
  date: string;
  price: number;
  predicted?: number;
}

interface ThresholdChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  thresholdValue?: number;
}

export function ThresholdChart({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 60 },
  thresholdValue,
}: ThresholdChartProps) {
  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Accessors
  const getDate = (d: DataPoint) => new Date(d.date);
  const getPrice = (d: DataPoint) => d.price;
  const getPredicted = (d: DataPoint) => d.predicted || d.price;

  // Scales
  const dateScale = scaleTime({
    domain: [
      Math.min(...data.map(getDate).map((d) => d.getTime())),
      Math.max(...data.map(getDate).map((d) => d.getTime())),
    ],
    range: [0, xMax],
  });

  const priceScale = scaleLinear({
    domain: [
      Math.min(...data.map(getPrice), ...data.map(getPredicted)) * 0.95,
      Math.max(...data.map(getPrice), ...data.map(getPredicted)) * 1.05,
    ],
    range: [yMax, 0],
    nice: true,
  });

  // Calculate threshold (average if not provided)
  const threshold =
    thresholdValue ||
    data.reduce((sum, d) => sum + getPrice(d), 0) / data.length;

  return (
    <div className="relative">
      <svg width={width} height={height}>
        {/* Gradients */}
        <LinearGradient
          id="area-gradient-green"
          from="#10b981"
          to="#10b981"
          toOpacity={0.2}
        />
        <LinearGradient
          id="area-gradient-red"
          from="#ef4444"
          to="#ef4444"
          toOpacity={0.2}
        />
        <LinearGradient id="line-gradient-green" from="#10b981" to="#059669" />
        <LinearGradient id="line-gradient-red" from="#ef4444" to="#dc2626" />

        <Group left={margin.left} top={margin.top}>
          {/* Grid */}
          <GridRows
            scale={priceScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
          />
          <GridColumns
            scale={dateScale}
            height={yMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
          />

          {/* Threshold visualization */}
          <Threshold
            id="threshold"
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y0={(d) => priceScale(getPrice(d)) ?? 0}
            y1={(d) => priceScale(threshold) ?? 0}
            clipAboveTo={0}
            clipBelowTo={yMax}
            curve={curveMonotoneX}
            belowAreaProps={{
              fill: "url(#area-gradient-red)",
              fillOpacity: 0.4,
            }}
            aboveAreaProps={{
              fill: "url(#area-gradient-green)",
              fillOpacity: 0.4,
            }}
          />

          {/* Threshold line */}
          <line
            x1={0}
            x2={xMax}
            y1={priceScale(threshold)}
            y2={priceScale(threshold)}
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="5,5"
          />

          {/* Actual price line */}
          <LinePath
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => priceScale(getPrice(d)) ?? 0}
            stroke="#1f2937"
            strokeWidth={2.5}
            curve={curveMonotoneX}
          />

          {/* Predicted price line (if available) */}
          {data.some((d) => d.predicted) && (
            <LinePath
              data={data.filter((d) => d.predicted)}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => priceScale(getPredicted(d)) ?? 0}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4,4"
              curve={curveMonotoneX}
            />
          )}

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={dateScale}
            numTicks={6}
            stroke="#9ca3af"
            tickStroke="#9ca3af"
            tickLabelProps={() => ({
              fill: "#6b7280",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
          <AxisLeft
            scale={priceScale}
            numTicks={8}
            stroke="#9ca3af"
            tickStroke="#9ca3af"
            tickLabelProps={() => ({
              fill: "#6b7280",
              fontSize: 11,
              textAnchor: "end",
              dx: -4,
            })}
            tickFormat={(value) => `₹${Number(value).toFixed(0)}`}
          />
        </Group>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-800"></div>
          <span className="text-gray-600">Actual Price</span>
        </div>
        {data.some((d) => d.predicted) && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500 border-dashed border-t-2"></div>
            <span className="text-gray-600">Predicted Price</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-500 border-dashed border-t-2"></div>
          <span className="text-gray-600">
            Threshold (₹{threshold.toFixed(2)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 opacity-40"></div>
          <span className="text-gray-600">Above Threshold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 opacity-40"></div>
          <span className="text-gray-600">Below Threshold</span>
        </div>
      </div>
    </div>
  );
}
