"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { Logo } from "./Logo";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Initializing platform",
}: LoadingScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const stocks = [
    "TCS",
    "INFY",
    "RELIANCE",
    "HDFC",
    "ICICI",
    "WIPRO",
    "ITC",
    "SBIN",
  ];
  const prices = [3850, 1456, 2842, 1678, 945, 423, 428, 598];

  const loadingMessages = [
    "Establishing secure connection",
    "Synchronizing market indices",
    "Calibrating ML models",
    "Loading real-time data feeds",
    "Initializing prediction engines",
    "Configuring analytics pipeline",
  ];

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      setCurrentStock((prev) => (prev + 1) % stocks.length);
    }, 100);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
          <span className="text-slate-800">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px),
                            linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Main logo container */}
        <div className="flex flex-col items-center gap-4">
          {/* Logo with pulse effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
              <div className="scale-125">
                <Logo />
              </div>
            </div>
          </div>

          {/* Title and subtitle */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Stock Market Intelligence
            </h1>
            <p className="text-sm text-slate-600">
              AI-Powered Stock Analysis Platform
            </p>
          </div>
        </div>

        {/* Animated chart visualization */}
        <div className="relative w-80 h-24 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg p-4">
          <div className="flex items-end justify-between h-full gap-1.5">
            {[...Array(16)].map((_, i) => {
              const height = Math.sin((progress + i * 20) * 0.05) * 35 + 50;
              const isUp = Math.sin((progress + i * 20) * 0.05) > 0;
              return (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    isUp
                      ? "bg-gradient-to-t from-green-500/70 to-green-400/50"
                      : "bg-gradient-to-t from-red-500/70 to-red-400/50"
                  }`}
                  style={{
                    height: `${height}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Loading message */}
        <div className="flex flex-col items-center gap-3 px-6 py-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg min-w-[320px]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BarChart3 className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-medium text-slate-700 animate-pulse">
              {loadingMessages[messageIndex]}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-500">Loading...</span>
              <span className="text-xs font-mono text-slate-600">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-700">
              Live Data
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-700">
              13 ML Models
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export function StockCardLoader() {
  return (
    <div className="p-4 bg-white/50 rounded-lg border border-slate-200 animate-pulse shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-slate-200 rounded w-16"></div>
        <div className="h-3 bg-slate-200 rounded w-12"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-24 mb-2"></div>
      <div className="flex items-center gap-2">
        <div className="h-3 bg-slate-200 rounded w-8"></div>
        <div className="h-3 bg-slate-200 rounded w-12"></div>
      </div>
    </div>
  );
}

export function ChartLoader() {
  return (
    <div className="relative w-full h-64 bg-white/50 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="absolute inset-0 flex items-end justify-between p-4 gap-1 h-full">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-full bg-slate-200 rounded-t animate-pulse"
            style={{
              height: `${Math.random() * 80 + 20}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-3">
          <BarChart3 className="w-12 h-12 text-slate-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-700">
            Loading data...
          </span>
        </div>
      </div>
    </div>
  );
}
