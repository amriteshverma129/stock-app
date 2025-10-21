"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Settings,
  Bell,
  Palette,
  Database,
  Download,
  RefreshCw,
  Eye,
  Clock,
  TrendingUp,
  DollarSign,
  Save,
} from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (settings: any) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
}: SettingsPanelProps) {
  const [settings, setSettings] = React.useState({
    // Display Settings
    defaultTab: "heatmap",
    currency: "INR",
    numberFormat: "indian",

    // Data Settings
    refreshInterval: 30,
    autoRefresh: true,

    // Notification Settings
    priceAlerts: true,
    portfolioAlerts: true,
    marketAlerts: false,

    // Export Settings
    exportFormat: "csv",
    includeHistory: true,

    // Display Preferences
    showVolume: true,
    showMarketCap: true,
    compactView: false,

    // Advanced
    apiEndpoint: "http://localhost:8000",
    cacheData: true,
  });

  React.useEffect(() => {
    setSettings({ ...settings, ...initialSettings });
  }, [initialSettings]);

  const handleSave = () => {
    onSave(settings);
    alert("Settings saved successfully! Refresh the page to see all changes.");
    onClose();
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      const defaultSettings = {
        defaultTab: "heatmap",
        currency: "INR",
        numberFormat: "indian",
        refreshInterval: 30,
        autoRefresh: true,
        priceAlerts: true,
        portfolioAlerts: true,
        marketAlerts: false,
        exportFormat: "csv",
        includeHistory: true,
        showVolume: true,
        showMarketCap: true,
        compactView: false,
        apiEndpoint: "http://localhost:8000",
        cacheData: true,
      };
      onSave(defaultSettings);
      setSettings(defaultSettings);
      alert("Settings reset to defaults!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <CardHeader className="border-b sticky top-0 bg-card z-10 pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="font-semibold">Application Settings</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </CardTitle>
          <CardDescription className="text-xs">
            Customize your trading terminal experience
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Display Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Display Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide">
                    Default Tab
                  </label>
                  <select
                    value={settings.defaultTab}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultTab: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="heatmap">Heatmap</option>
                    <option value="live">Live Analysis</option>
                    <option value="models">ML Models</option>
                    <option value="stocks">Stocks</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="watchlist">Watchlist</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide">
                    Currency Format
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide">
                    Number Format
                  </label>
                  <select
                    value={settings.numberFormat}
                    onChange={(e) =>
                      setSettings({ ...settings, numberFormat: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="indian">Indian (Cr, L, K)</option>
                    <option value="international">
                      International (B, M, K)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-xs font-medium">Compact View</p>
                    <p className="text-[10px] text-muted-foreground">
                      Reduce spacing throughout the app
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compactView}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        compactView: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Data Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide">
                  Refresh Interval (seconds)
                </label>
                <Input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      refreshInterval: parseInt(e.target.value) || 30,
                    })
                  }
                  min="10"
                  max="300"
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  How often to fetch new data (10-300 seconds)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-xs font-medium">Auto Refresh</p>
                    <p className="text-[10px] text-muted-foreground">
                      Automatically update data
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoRefresh: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-xs font-medium">Cache Data</p>
                    <p className="text-[10px] text-muted-foreground">
                      Store locally for speed
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.cacheData}
                    onChange={(e) =>
                      setSettings({ ...settings, cacheData: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-xs font-medium">Show Volume</p>
                    <p className="text-[10px] text-muted-foreground">
                      Display in cards
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showVolume}
                    onChange={(e) =>
                      setSettings({ ...settings, showVolume: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Notifications</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-2 border rounded h-[60px]">
                <div>
                  <p className="text-xs font-medium">Price Alerts</p>
                  <p className="text-[10px] text-muted-foreground">
                    Stock price changes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.priceAlerts}
                  onChange={(e) =>
                    setSettings({ ...settings, priceAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between p-2 border rounded h-[60px]">
                <div>
                  <p className="text-xs font-medium">Portfolio Alerts</p>
                  <p className="text-[10px] text-muted-foreground">
                    Portfolio changes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.portfolioAlerts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      portfolioAlerts: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between p-2 border rounded h-[60px]">
                <div>
                  <p className="text-xs font-medium">Market Alerts</p>
                  <p className="text-[10px] text-muted-foreground">
                    Major market moves
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketAlerts}
                  onChange={(e) =>
                    setSettings({ ...settings, marketAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Export Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide">
                  Export Format
                </label>
                <select
                  value={settings.exportFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, exportFormat: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-xs font-medium">Include History</p>
                    <p className="text-[10px] text-muted-foreground">
                      Export with price history data
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.includeHistory}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        includeHistory: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Advanced</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide">
                  API Endpoint
                </label>
                <Input
                  type="text"
                  value={settings.apiEndpoint}
                  onChange={(e) =>
                    setSettings({ ...settings, apiEndpoint: e.target.value })
                  }
                  placeholder="http://localhost:8000"
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Backend API server URL
                </p>
              </div>

              <div className="p-3 bg-muted rounded space-y-1.5">
                <p className="text-xs font-semibold">Current Configuration</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-1.5 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Total Stocks
                    </p>
                    <p className="font-medium">500 Indian Stocks</p>
                  </div>
                  <div className="p-1.5 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      ML Models
                    </p>
                    <p className="font-medium">13 Active Models</p>
                  </div>
                  <div className="p-1.5 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Data Source
                    </p>
                    <p className="font-medium">Backend API</p>
                  </div>
                  <div className="p-1.5 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Update Frequency
                    </p>
                    <p className="font-medium font-mono">
                      {settings.refreshInterval}s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={handleReset}
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Reset to Defaults
            </Button>
            <div className="flex items-center space-x-2">
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
                onClick={handleSave}
              >
                <Save className="w-3 h-3 mr-1.5" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
