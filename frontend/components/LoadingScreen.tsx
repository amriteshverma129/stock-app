"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Zap,
  Activity,
  Target,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Initializing Financial Terminal...",
    "Loading Market Data...",
    "Training AI Models...",
    "Analyzing Stock Patterns...",
    "Generating Predictions...",
    "Finalizing Dashboard...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2.5 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Financial Terminal
              </h1>
              <p className="text-xs text-slate-600">
                Professional Trading Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Main Loading Card */}
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Loading Financial Data
              </h2>
              <p className="text-xs text-slate-600">
                Preparing your professional trading environment...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Progress
                </span>
                <span className="text-xs font-semibold font-mono text-slate-700">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-1.5 mb-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">
                  Current Step
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-700 font-medium">
                  {steps[currentStep]}
                </p>
                <div className="flex justify-center space-x-1 mt-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index <= currentStep ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <Card className="border border-slate-200 bg-muted">
                <CardContent className="p-3 text-center">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1.5" />
                  <h3 className="font-semibold text-sm text-slate-900 mb-0.5">
                    Real-time Data
                  </h3>
                  <p className="text-xs text-slate-600">Live market feeds</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-muted">
                <CardContent className="p-3 text-center">
                  <Brain className="h-6 w-6 text-purple-600 mx-auto mb-1.5" />
                  <h3 className="font-semibold text-sm text-slate-900 mb-0.5">
                    AI Models
                  </h3>
                  <p className="text-xs text-slate-600">13 ML algorithms</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-muted">
                <CardContent className="p-3 text-center">
                  <Target className="h-6 w-6 text-blue-600 mx-auto mb-1.5" />
                  <h3 className="font-semibold text-sm text-slate-900 mb-0.5">
                    Predictions
                  </h3>
                  <p className="text-xs text-slate-600">Advanced forecasting</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-600">Market Status</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-600">Data Feed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-600">AI Models</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-600">Analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-xs">
            Powered by advanced machine learning algorithms
          </p>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for stock cards
export function StockCardLoader() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-full border border-slate-200 rounded-lg p-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-24"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-5 bg-slate-200 rounded w-20"></div>
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
