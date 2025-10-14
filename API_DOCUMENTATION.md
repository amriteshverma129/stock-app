# 📡 API Documentation

Complete reference for Stock Market Data Science API endpoints.

**Base URL**: `http://localhost:8000`

**Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Historical Data Endpoints](#historical-data-endpoints)
4. [Live Data Endpoints](#live-data-endpoints)
5. [Market Data Endpoints](#market-data-endpoints)
6. [ML Model Endpoints](#ml-model-endpoints)
7. [Response Formats](#response-formats)
8. [Error Handling](#error-handling)

---

## Overview

The API provides access to:

- **Historical stock data** from JSON files
- **Real-time stock data** from Yahoo Finance
- **ML predictions** across multiple timeframes (1M, 6M, 1Y, 5Y)
- **Market heatmaps** and breadth indicators
- **Technical indicators** (MA, RSI, MACD, Bollinger Bands)
- **Model comparison** (Random Forest, Gradient Boosting, CNN)

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

**CORS**: Enabled for `http://localhost:3000` (Next.js frontend)

---

## Historical Data Endpoints

### 1. List All Stocks

**GET** `/stocks`

Get a list of available stocks from historical data.

**Query Parameters:**

| Parameter | Type   | Default   | Description                |
| --------- | ------ | --------- | -------------------------- |
| category  | string | "Nifty50" | Stock category/folder name |
| limit     | int    | 10        | Maximum number of stocks   |

**Example Request:**

```bash
curl "http://localhost:8000/stocks?category=Nifty50&limit=5"
```

**Response:**

```json
{
  "stocks": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance",
      "currentPrice": 2850.5,
      "change": 45.2,
      "changePercent": 1.61,
      "marketCap": 1920000,
      "peRatio": 28.5,
      "volume": 8500000
    }
  ],
  "count": 5
}
```

---

### 2. Get Stock Details

**GET** `/stocks/{symbol}`

Get detailed information and price history for a specific stock.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Query Parameters:**

| Parameter | Type | Default | Description               |
| --------- | ---- | ------- | ------------------------- |
| days      | int  | 365     | Number of historical days |

**Example Request:**

```bash
curl "http://localhost:8000/stocks/RELIANCE?days=90"
```

**Response:**

```json
{
  "stockInfo": {
    "symbol": "RELIANCE",
    "name": "Reliance",
    "currentPrice": 2850.5,
    "change": 45.2,
    "changePercent": 1.61,
    "marketCap": 1920000,
    "peRatio": 28.5,
    "volume": 8500000
  },
  "priceHistory": [
    {
      "date": "2025-01-15",
      "open": 2800.0,
      "high": 2860.0,
      "low": 2795.0,
      "close": 2850.5,
      "volume": 8500000
    }
  ]
}
```

---

### 3. Get Stock Analysis

**GET** `/stocks/{symbol}/analysis`

Comprehensive ML-powered analysis with predictions and technical indicators.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Example Request:**

```bash
curl "http://localhost:8000/stocks/RELIANCE/analysis"
```

**Response:**

```json
{
  "stockInfo": { ... },
  "priceHistory": [ ... ],
  "predictions": [
    {
      "date": "2025-10-15",
      "predicted": 2890.30,
      "actual": null,
      "upperBound": 2950.00,
      "lowerBound": 2830.60
    }
  ],
  "technicalIndicators": {
    "ma20": 2820.50,
    "ma50": 2780.30,
    "ma200": 2650.00,
    "rsi": 65.5,
    "momentum": 120.30,
    "volatility": 28.5
  },
  "modelMetrics": {
    "rmse": 45.20,
    "mae": 32.10,
    "r2": 0.85,
    "mape": 1.2
  },
  "featureImportance": [
    {
      "feature": "ma20",
      "importance": 0.25
    }
  ],
  "recommendation": "BUY",
  "confidence": "High",
  "riskLevel": "Medium"
}
```

---

### 4. Predict Future Prices

**GET** `/stocks/{symbol}/predict`

Get future price predictions for specified number of days.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Query Parameters:**

| Parameter | Type | Default | Description               |
| --------- | ---- | ------- | ------------------------- |
| days      | int  | 30      | Number of days to predict |

**Example Request:**

```bash
curl "http://localhost:8000/stocks/RELIANCE/predict?days=30"
```

**Response:**

```json
{
  "symbol": "RELIANCE",
  "predictions": [
    {
      "date": "2025-10-15",
      "predicted": 2890.3,
      "upperBound": 2950.0,
      "lowerBound": 2830.6
    }
  ],
  "forecastDays": 30
}
```

---

## Live Data Endpoints

### 5. Get Live Stocks List

**GET** `/live/stocks`

Get list of all available Indian stocks for live trading.

**Example Request:**

```bash
curl "http://localhost:8000/live/stocks"
```

**Response:**

```json
{
  "stocks": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance Industries",
      "sector": "Energy"
    }
  ],
  "count": 40
}
```

---

### 6. Get Live Stock Data

**GET** `/live/stocks/{symbol}`

Fetch real-time stock data from Yahoo Finance.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Query Parameters:**

| Parameter | Type   | Default | Description                        |
| --------- | ------ | ------- | ---------------------------------- |
| period    | string | "1y"    | Time period: 1mo, 6mo, 1y, 5y, max |

**Example Request:**

```bash
curl "http://localhost:8000/live/stocks/RELIANCE?period=6mo"
```

**Response:**

```json
{
  "stockInfo": {
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "currentPrice": 2850.50,
    "previousClose": 2805.30,
    "open": 2810.00,
    "dayHigh": 2860.00,
    "dayLow": 2800.00,
    "volume": 8500000,
    "marketCap": 192500.50,
    "peRatio": 28.5,
    "pbRatio": 2.8,
    "dividendYield": 0.45,
    "52WeekHigh": 3000.00,
    "52WeekLow": 2200.00
  },
  "priceHistory": [ ... ],
  "period": "6mo"
}
```

---

### 7. Multi-Timeframe Prediction

**GET** `/live/stocks/{symbol}/predict`

Get ML predictions for specific timeframe (1M, 6M, 1Y, or 5Y).

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Query Parameters:**

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| timeframe | string | Yes      | '1M', '6M', '1Y', or '5Y' |

**Example Request:**

```bash
curl "http://localhost:8000/live/stocks/RELIANCE/predict?timeframe=1Y"
```

**Response:**

```json
{
  "symbol": "RELIANCE",
  "timeframe": "1Y",
  "currentPrice": 2850.5,
  "predictions": [
    {
      "date": "2025-11-14",
      "daysAhead": 31,
      "predicted": 2950.3,
      "upperBound": 3100.0,
      "lowerBound": 2800.0,
      "confidence": 95.5
    }
  ],
  "modelMetrics": {
    "rmse": 85.3,
    "mae": 62.1,
    "r2": 0.78,
    "mape": 2.8
  },
  "trend": "Bullish",
  "priceTargets": {
    "conservative": 3210.0,
    "moderate": 4275.0,
    "aggressive": 4988.0,
    "conservative_pct": 25.0,
    "moderate_pct": 50.0,
    "aggressive_pct": 75.0
  },
  "recommendation": "BUY",
  "confidence": "High",
  "predictionPoints": 52
}
```

---

### 8. Complete Live Analysis

**GET** `/live/stocks/{symbol}/analysis`

Get predictions for all timeframes at once (1M, 6M, 1Y, 5Y).

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Example Request:**

```bash
curl "http://localhost:8000/live/stocks/RELIANCE/analysis"
```

**Response:**

```json
{
  "stockInfo": { ... },
  "predictions": {
    "1M": { ... },
    "6M": { ... },
    "1Y": { ... },
    "5Y": { ... }
  },
  "timestamp": "2025-10-14T20:30:00"
}
```

---

### 9. CNN-Based Predictions

**GET** `/live/stocks/{symbol}/predict-cnn`

Get predictions using Convolutional Neural Network model.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Query Parameters:**

| Parameter | Type   | Default | Description               |
| --------- | ------ | ------- | ------------------------- |
| timeframe | string | "1M"    | '1M', '6M', '1Y', or '5Y' |

**Example Request:**

```bash
curl "http://localhost:8000/live/stocks/RELIANCE/predict-cnn?timeframe=6M"
```

**Response:**

```json
{
  "symbol": "RELIANCE",
  "timeframe": "6M",
  "model": "CNN (1D Convolutional Neural Network)",
  "currentPrice": 2850.50,
  "predictedPrice": 3150.30,
  "expectedReturn": 10.52,
  "predictions": [ ... ],
  "modelMetrics": {
    "rmse": 72.50,
    "mae": 55.30,
    "r2": 0.82,
    "mape": 2.1
  },
  "trainingHistory": {
    "loss": [0.5, 0.3, 0.2, 0.15],
    "val_loss": [0.6, 0.35, 0.25, 0.18]
  },
  "trend": "Bullish",
  "recommendation": "BUY",
  "confidence": "High",
  "predictionPoints": 26
}
```

---

## Market Data Endpoints

### 10. Market Summary

**GET** `/market/summary`

Get market overview with top gainers and losers.

**Query Parameters:**

| Parameter | Type   | Default   | Description      |
| --------- | ------ | --------- | ---------------- |
| category  | string | "Nifty50" | Stock category   |
| limit     | int    | 10        | Number of stocks |

**Example Request:**

```bash
curl "http://localhost:8000/market/summary?category=Nifty50&limit=10"
```

**Response:**

```json
{
  "marketStats": {
    "averageChange": 1.25,
    "advancers": 6,
    "decliners": 3,
    "unchanged": 1
  },
  "topGainers": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance",
      "currentPrice": 2850.50,
      "change": 45.20,
      "changePercent": 1.61,
      "marketCap": 1920000,
      "volume": 8500000
    }
  ],
  "topLosers": [ ... ],
  "allStocks": [ ... ]
}
```

---

### 11. Market Heatmap

**GET** `/market/heatmap`

Get comprehensive market heatmap data with sector grouping.

**Example Request:**

```bash
curl "http://localhost:8000/market/heatmap"
```

**Response:**

```json
{
  "stocks": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "sector": "IT",
      "price": 3850.50,
      "change": 123.40,
      "changePercent": 3.31,
      "volume": 2500000,
      "marketCap": 14000000
    }
  ],
  "sectors": [
    {
      "name": "IT",
      "count": 6,
      "avgChange": 2.45,
      "stocks": [ ... ]
    }
  ],
  "timestamp": "2025-10-14T20:30:00"
}
```

---

### 12. Market Breadth

**GET** `/market/breadth`

Get market breadth statistics (advance/decline ratio, volume, etc.).

**Example Request:**

```bash
curl "http://localhost:8000/market/breadth"
```

**Response:**

```json
{
  "advanceDeclineRatio": 1.85,
  "advancing": 26,
  "declining": 14,
  "unchanged": 2,
  "totalVolume": 285000000,
  "totalMarketCap": 125000000000,
  "timestamp": "2025-10-14T20:30:00"
}
```

---

## ML Model Endpoints

### 13. Compare ML Models

**GET** `/models/compare`

Compare performance of different ML algorithms for a stock.

**Query Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Example Request:**

```bash
curl "http://localhost:8000/models/compare?symbol=RELIANCE"
```

**Response:**

```json
{
  "symbol": "RELIANCE",
  "models": [
    {
      "name": "Linear Regression",
      "rmse": 85.3,
      "mae": 62.1,
      "r2": 0.65,
      "mape": 3.2
    },
    {
      "name": "Random Forest",
      "rmse": 45.2,
      "mae": 32.1,
      "r2": 0.85,
      "mape": 1.2
    }
  ],
  "bestModel": "Random Forest"
}
```

---

### 14. Compare All Models

**GET** `/models/compare-all/{symbol}`

Compare Random Forest, Gradient Boosting, and CNN models.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| symbol    | string | Yes      | Stock symbol |

**Query Parameters:**

| Parameter | Type   | Default | Description               |
| --------- | ------ | ------- | ------------------------- |
| timeframe | string | "1M"    | '1M', '6M', '1Y', or '5Y' |

**Example Request:**

```bash
curl "http://localhost:8000/models/compare-all/RELIANCE?timeframe=1Y"
```

**Response:**

```json
{
  "symbol": "RELIANCE",
  "timeframe": "1Y",
  "models": [
    {
      "name": "Random Forest / Gradient Boosting",
      "metrics": { ... },
      "recommendation": "BUY",
      "confidence": "High",
      "available": true
    },
    {
      "name": "CNN (Convolutional Neural Network)",
      "metrics": { ... },
      "recommendation": "BUY",
      "confidence": "High",
      "available": true,
      "trainingLoss": [0.5, 0.3, 0.2, 0.15]
    }
  ],
  "bestModel": "CNN",
  "bestR2": 0.82
}
```

---

## Response Formats

### Standard Success Response

All successful responses follow this format:

```json
{
  "data": { ... },
  "status": "success",
  "timestamp": "2025-10-14T20:30:00"
}
```

### Stock Info Object

```json
{
  "symbol": "RELIANCE",
  "name": "Reliance Industries",
  "currentPrice": 2850.5,
  "change": 45.2,
  "changePercent": 1.61,
  "marketCap": 1920000,
  "peRatio": 28.5,
  "volume": 8500000
}
```

### Price Point Object

```json
{
  "date": "2025-10-14",
  "open": 2800.0,
  "high": 2860.0,
  "low": 2795.0,
  "close": 2850.5,
  "volume": 8500000
}
```

### Prediction Object

```json
{
  "date": "2025-11-14",
  "daysAhead": 31,
  "predicted": 2950.3,
  "upperBound": 3100.0,
  "lowerBound": 2800.0,
  "confidence": 95.5
}
```

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message description",
  "status": "error",
  "timestamp": "2025-10-14T20:30:00"
}
```

### HTTP Status Codes

| Code | Meaning               | Description                          |
| ---- | --------------------- | ------------------------------------ |
| 200  | OK                    | Request successful                   |
| 400  | Bad Request           | Invalid parameters or request format |
| 404  | Not Found             | Stock symbol not found               |
| 500  | Internal Server Error | Server error (check logs)            |

### Common Error Scenarios

**1. Stock Not Found**

```json
{
  "detail": "Stock INVALID not found"
}
```

**Status Code**: 404

**2. Invalid Timeframe**

```json
{
  "detail": "Timeframe must be 1M, 6M, 1Y, or 5Y"
}
```

**Status Code**: 400

**3. Insufficient Data**

```json
{
  "detail": "Insufficient data for 5Y training. Need at least 200 samples, got 50"
}
```

**Status Code**: 400

---

## Rate Limiting

Currently, there are **no rate limits** on the API. However, for production use, consider:

- **Live data endpoints**: Limit to 60 requests/minute
- **ML prediction endpoints**: Limit to 10 requests/minute (computationally expensive)
- **Market heatmap**: Cache for 60 seconds

---

## Best Practices

1. **Cache responses** when possible (especially market heatmap)
2. **Use appropriate timeframes** for your use case
3. **Handle errors gracefully** on the client side
4. **Don't fetch all timeframes** if you only need one
5. **Batch requests** when fetching multiple stocks

---

## Code Examples

### Python

```python
import requests

# Get live stock prediction
response = requests.get(
    "http://localhost:8000/live/stocks/RELIANCE/predict",
    params={"timeframe": "1Y"}
)
data = response.json()
print(f"Recommendation: {data['recommendation']}")
```

### JavaScript/TypeScript

```typescript
// Get market heatmap
const response = await fetch("http://localhost:8000/market/heatmap");
const data = await response.json();
console.log(`Total stocks: ${data.stocks.length}`);
```

### cURL

```bash
# Get stock analysis
curl -X GET "http://localhost:8000/stocks/RELIANCE/analysis" \
  -H "accept: application/json"
```

---

## Websocket Support (Future)

**Planned for v2.0:**

- Real-time price updates
- Live market breadth streaming
- Prediction updates

**Endpoint**: `ws://localhost:8000/ws/stocks/{symbol}`

---

## API Versioning

Current Version: **v1.0**

Future versions will be accessible via:

- `http://localhost:8000/v2/...`

---

## Support

- **Documentation**: http://localhost:8000/docs
- **GitHub**: [Your Repository]
- **Issues**: [Issue Tracker]

---

**Last Updated**: October 14, 2025
