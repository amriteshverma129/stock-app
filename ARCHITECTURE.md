# 🏗️ System Architecture

Complete technical architecture documentation for the Stock Market Data Science Dashboard.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Data Flow](#data-flow)
7. [ML Pipeline](#ml-pipeline)
8. [Database Design](#database-design)
9. [API Design](#api-design)
10. [Security](#security)
11. [Performance](#performance)
12. [Scalability](#scalability)

---

## System Overview

The Stock Market Data Science Dashboard is a full-stack application that combines:

- **Real-time data fetching** from Yahoo Finance
- **Machine Learning models** for price prediction
- **Interactive visualizations** for market analysis
- **Multi-timeframe predictions** (1M, 6M, 1Y, 5Y)

### Key Features

- 🔴 **Live Data**: Real-time stock prices from Yahoo Finance
- 🤖 **ML Models**: Random Forest, Gradient Boosting, CNN
- 📊 **Visualizations**: Market heatmap, scatter plots, sector performance
- ⏱️ **Multi-Timeframe**: Predictions for different time horizons
- 📈 **Technical Analysis**: 15+ technical indicators
- 🎯 **Price Targets**: Conservative, Moderate, Aggressive targets

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  Next.js 14   │  │  React        │  │  TypeScript   │       │
│  │  App Router   │  │  Components   │  │               │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  shadcn/ui    │  │  visx Charts  │  │  Axios HTTP   │       │
│  │  Components   │  │  Visualize    │  │  Client       │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Layer                               │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Server                          │  │
│  │  - CORS Middleware                                         │  │
│  │  - Pydantic Models (Data Validation)                       │  │
│  │  - Async Endpoints                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Business Logic Layer   │   │    Data Access Layer     │
│                          │   │                          │
│  ┌────────────────────┐  │   │  ┌────────────────────┐  │
│  │   ML Models        │  │   │  │  Data Processor    │  │
│  │  - Random Forest   │  │   │  │  - JSON Reader     │  │
│  │  - Gradient Boost  │  │   │  │  - Data Cleaning   │  │
│  │  - CNN (TensorFlow)│  │   │  │  - Feature Eng.    │  │
│  └────────────────────┘  │   │  └────────────────────┘  │
│                          │   │                          │
│  ┌────────────────────┐  │   │  ┌────────────────────┐  │
│  │  Advanced Models   │  │   │  │ Live Data Fetcher  │  │
│  │  - Multi-Timeframe │  │   │  │  - Yahoo Finance   │  │
│  │  - Price Targets   │  │   │  │  - Multi-Source    │  │
│  │  - Trend Analysis  │  │   │  │  - Fallback Logic  │  │
│  └────────────────────┘  │   │  └────────────────────┘  │
└──────────────────────────┘   └──────────────────────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │   External APIs      │
                              │                      │
                              │  - Yahoo Finance     │
                              │  - NSE India (*)     │
                              │  - Alpha Vantage (*) │
                              └──────────────────────┘
                                    (*) Future

┌─────────────────────────────────────────────────────────────────┐
│                      Storage Layer                               │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  JSON Files    │  │  Model Cache   │  │  ML Models     │    │
│  │  (Historical)  │  │  (In-Memory)   │  │  (Pickle)      │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

| Technology        | Version | Purpose                           |
| ----------------- | ------- | --------------------------------- |
| **Python**        | 3.9+    | Core programming language         |
| **FastAPI**       | 0.104   | Web framework & API server        |
| **Uvicorn**       | 0.24    | ASGI server                       |
| **Pandas**        | 2.1     | Data manipulation                 |
| **NumPy**         | 1.26    | Numerical computing               |
| **Scikit-learn**  | 1.3     | ML models (RF, GB)                |
| **TensorFlow**    | 2.15    | Deep learning (CNN)               |
| **yfinance**      | 0.2     | Yahoo Finance data                |
| **Pydantic**      | 2.5     | Data validation                   |

### Frontend

| Technology         | Version | Purpose                          |
| ------------------ | ------- | -------------------------------- |
| **Next.js**        | 14.0    | React framework                  |
| **React**          | 18.2    | UI library                       |
| **TypeScript**     | 5.3     | Type safety                      |
| **Tailwind CSS**   | 3.3     | Styling                          |
| **shadcn/ui**      | latest  | UI components                    |
| **visx**           | 3.x     | Data visualization               |
| **Axios**          | 1.6     | HTTP client                      |
| **date-fns**       | 3.0     | Date utilities                   |

### DevOps

| Technology      | Purpose                    |
| --------------- | -------------------------- |
| **Docker**      | Containerization           |
| **Docker Compose** | Multi-container orchestration |

---

## Backend Architecture

### Directory Structure

```
backend/
├── main.py                    # FastAPI application & routes
├── ml_models.py              # Random Forest, Gradient Boosting
├── advanced_ml_models.py     # Multi-timeframe predictor
├── cnn_models.py             # CNN-based predictions
├── data_processor.py         # Data processing utilities
├── live_data_fetcher.py      # Yahoo Finance integration
├── multi_source_fetcher.py   # Multi-source data with fallback
├── requirements.txt          # Python dependencies
└── Dockerfile               # Docker configuration
```

### Core Modules

#### 1. `main.py` - API Server

**Responsibilities:**
- Define API endpoints
- Handle HTTP requests/responses
- CORS configuration
- Request validation
- Error handling

**Key Endpoints:**
```python
@app.get("/stocks")                          # List stocks
@app.get("/stocks/{symbol}/analysis")        # Full analysis
@app.get("/live/stocks/{symbol}/predict")    # Live predictions
@app.get("/market/heatmap")                  # Market heatmap
@app.get("/models/compare-all/{symbol}")     # Model comparison
```

#### 2. `ml_models.py` - Machine Learning Models

**Responsibilities:**
- Feature engineering (15+ features)
- Model training (Random Forest)
- Price prediction
- Feature importance analysis
- Recommendation generation

**Features Engineered:**
- Moving Averages (MA5, MA10, MA20, MA50)
- RSI (Relative Strength Index)
- Momentum & ROC
- Volatility
- Volume indicators
- Price ratios
- Lagged features (1-5 days)

#### 3. `advanced_ml_models.py` - Multi-Timeframe Predictor

**Responsibilities:**
- Timeframe-specific models (1M, 6M, 1Y, 5Y)
- Dynamic feature selection
- Price target calculation
- Trend analysis
- Confidence scoring

**Timeframe Configuration:**
```python
TIMEFRAME_DAYS = {
    '1M': 30,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825
}
```

#### 4. `cnn_models.py` - CNN Predictions

**Responsibilities:**
- 1D Convolutional Neural Network
- Sequential time-series modeling
- Deep learning predictions
- Training history tracking

**Model Architecture:**
```python
Conv1D(64) → MaxPooling → Dropout
Conv1D(128) → MaxPooling → Dropout
Dense(50) → Dense(1)
```

#### 5. `data_processor.py` - Data Processing

**Responsibilities:**
- Load stock data from JSON
- Calculate technical indicators
- Data cleaning & normalization
- Feature transformation

#### 6. `live_data_fetcher.py` - Live Data

**Responsibilities:**
- Fetch real-time data from Yahoo Finance
- Convert NSE symbols to Yahoo format
- Get stock info (price, PE, market cap)
- Handle API errors

#### 7. `multi_source_fetcher.py` - Multi-Source Data

**Responsibilities:**
- Primary source: Yahoo Finance
- Fallback mechanisms
- Market heatmap generation
- Sector grouping
- Market breadth calculation

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main page (dashboard)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── LiveStockAnalysis.tsx    # Live stock predictions
│   ├── LiveStockList.tsx        # Stock selector
│   ├── MarketHeatmap.tsx        # Market heatmap grid
│   ├── MarketOverview.tsx       # Market statistics
│   ├── StockAnalysis.tsx        # Historical analysis
│   ├── StockList.tsx            # Historical stock list
│   ├── ModelComparison.tsx      # ML model comparison
│   ├── charts/
│   │   ├── MarketScatterChart.tsx    # Scatter plot
│   │   └── SectorPerformanceChart.tsx # Bar chart
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── tabs.tsx
├── lib/
│   └── utils.ts              # Utility functions
├── package.json              # Node dependencies
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── Dockerfile               # Docker configuration
```

### Component Architecture

#### Page Components

**`page.tsx`** - Main Dashboard
- Tab navigation (Heatmap, Live, Market, Historical, Models, About)
- State management for selected stocks
- Market data fetching

#### Feature Components

**`LiveStockAnalysis.tsx`**
- Multi-timeframe selector (1M, 6M, 1Y, 5Y)
- Current price & recommendation cards
- Price targets display
- Model performance metrics
- Detailed prediction table

**`MarketHeatmap.tsx`**
- Grid view with color-coded stocks
- Sector grouping
- Toggle between grid/chart view
- Auto-refresh every 60 seconds
- Legend for color scale

**`StockList.tsx` / `LiveStockList.tsx`**
- Searchable stock list
- Sector filtering
- Stock selection
- Real-time price updates

#### Chart Components

**`MarketScatterChart.tsx`**
- visx scatter plot
- X-axis: Market Cap
- Y-axis: Change %
- Color: Sector
- Tooltips on hover

**`SectorPerformanceChart.tsx`**
- visx bar chart
- Sector-wise performance
- Color gradient (green/red)

---

## Data Flow

### 1. Live Stock Prediction Flow

```
User clicks stock
    │
    ▼
Frontend calls: /live/stocks/RELIANCE/predict?timeframe=1Y
    │
    ▼
FastAPI receives request
    │
    ▼
MultiSourceFetcher.fetch_stock_data('RELIANCE', '5y')
    │
    ▼
Yahoo Finance API → Historical OHLCV data
    │
    ▼
MultiTimeframePredictor.prepare_features(df, '1Y')
    │
    ▼
Feature engineering (MAs, RSI, Momentum, etc.)
    │
    ▼
MultiTimeframePredictor.train_model(df, 'RELIANCE', '1Y')
    │
    ▼
Model selection: Gradient Boosting (for 1Y timeframe)
    │
    ▼
Train on 80% data, Test on 20%
    │
    ▼
Calculate metrics (RMSE, MAE, R², MAPE)
    │
    ▼
MultiTimeframePredictor.predict_future(df, 'RELIANCE', '1Y')
    │
    ▼
Generate 52 weekly predictions
    │
    ▼
Calculate price targets & recommendation
    │
    ▼
Return JSON response to frontend
    │
    ▼
Frontend displays: Current Price, Forecast, Targets, Metrics
```

### 2. Market Heatmap Flow

```
User opens dashboard
    │
    ▼
Frontend calls: /market/heatmap
    │
    ▼
MultiSourceFetcher.get_market_heatmap()
    │
    ├─── Fetch RELIANCE from Yahoo
    ├─── Fetch TCS from Yahoo
    ├─── Fetch INFY from Yahoo
    ├─── ... (40+ stocks in parallel)
    │
    ▼
For each stock:
    - Get current price
    - Calculate change %
    - Get volume, market cap
    - Assign sector
    │
    ▼
Group stocks by sector
    │
    ▼
Calculate sector averages
    │
    ▼
Return: { stocks: [...], sectors: [...] }
    │
    ▼
Frontend renders color-coded grid
```

### 3. Model Comparison Flow

```
User selects "Models" tab
    │
    ▼
Frontend calls: /models/compare-all/RELIANCE?timeframe=1Y
    │
    ▼
Parallel predictions:
    ├─── Random Forest/Gradient Boosting
    └─── CNN (if TensorFlow available)
    │
    ▼
Compare metrics (R², RMSE, MAE)
    │
    ▼
Determine best model
    │
    ▼
Return comparison results
    │
    ▼
Frontend displays side-by-side comparison
```

---

## ML Pipeline

### Training Pipeline

```
Historical Data (OHLCV)
    │
    ▼
┌────────────────────────┐
│  Feature Engineering   │
│  - Technical Indicators│
│  - Lagged Features     │
│  - Ratios & Momentum   │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│  Feature Scaling       │
│  - StandardScaler      │
│  - Fit on train data   │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│  Train/Test Split      │
│  - 80% Train           │
│  - 20% Test            │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│  Model Selection       │
│  - 1M/6M: Random Forest│
│  - 1Y/5Y: Grad Boost   │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│  Model Training        │
│  - Fit on train data   │
│  - Hyperparameters     │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│  Evaluation            │
│  - RMSE, MAE, R², MAPE │
│  - Feature Importance  │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│  Cache Model           │
│  - Store in memory     │
│  - Reuse for predictions│
└────────────────────────┘
```

### Prediction Pipeline

```
Latest Stock Data
    │
    ▼
Extract Features (same as training)
    │
    ▼
Scale Features (using cached scaler)
    │
    ▼
Load Cached Model
    │
    ▼
Generate Predictions
    │
    ▼
Calculate Confidence Intervals
    │
    ▼
Analyze Trend (Bullish/Bearish)
    │
    ▼
Calculate Price Targets
    │
    ▼
Generate Recommendation (BUY/SELL/HOLD)
    │
    ▼
Return Prediction Response
```

---

## Database Design

Currently, the system uses **file-based storage**:

### Historical Data
- **Format**: JSON files
- **Location**: `data/Nifty50/*.json`
- **Schema**:
```json
[
  {
    "date": "2024-01-15",
    "open": 2800,
    "high": 2860,
    "low": 2795,
    "close": 2850.50,
    "volume": 8500000,
    "marketCap": 1920000,
    "peRatio": 28.5
  }
]
```

### Model Cache
- **Format**: In-memory dictionary
- **Key**: `"{symbol}_{timeframe}"`
- **Value**: Trained model object

### Future Database Schema (PostgreSQL)

**stocks** table:
```sql
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    sector VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**price_history** table:
```sql
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id),
    date DATE NOT NULL,
    open DECIMAL(10,2),
    high DECIMAL(10,2),
    low DECIMAL(10,2),
    close DECIMAL(10,2),
    volume BIGINT,
    UNIQUE(stock_id, date)
);
```

**predictions** table:
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id),
    timeframe VARCHAR(10),
    prediction_date DATE,
    predicted_price DECIMAL(10,2),
    actual_price DECIMAL(10,2),
    confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Design

### RESTful Principles

1. **Resource-based URLs**: `/stocks/{symbol}`
2. **HTTP Methods**: GET (read operations only for now)
3. **JSON Responses**: All responses in JSON format
4. **Status Codes**: Proper HTTP status codes (200, 404, 500)
5. **Query Parameters**: For filtering and pagination

### Design Patterns

**1. Repository Pattern**
- `DataProcessor` acts as repository for historical data
- `LiveDataFetcher` acts as repository for real-time data

**2. Strategy Pattern**
- Different ML models (RandomForest, GradientBoosting, CNN)
- Selected based on timeframe and requirements

**3. Factory Pattern**
- Model creation based on timeframe
- Feature engineering based on timeframe

**4. Singleton Pattern**
- Model cache (single instance per symbol-timeframe)

---

## Security

### Current Implementation

1. **CORS**: Restricted to `http://localhost:3000`
2. **Input Validation**: Pydantic models for request validation
3. **Error Handling**: No sensitive information in error messages

### Production Recommendations

1. **Authentication & Authorization**
   - JWT tokens
   - API keys for external access
   - Rate limiting per user

2. **HTTPS**
   - SSL/TLS encryption
   - Certificate management

3. **Input Sanitization**
   - SQL injection prevention (when using DB)
   - XSS prevention

4. **API Rate Limiting**
   - 60 requests/minute for live data
   - 10 requests/minute for ML predictions

5. **Security Headers**
   ```python
   app.add_middleware(
       SecurityHeadersMiddleware,
       csp="default-src 'self'",
       xss_protection="1; mode=block"
   )
   ```

---

## Performance

### Current Optimizations

1. **Model Caching**
   - Trained models cached in memory
   - Reused for multiple predictions

2. **Data Caching**
   - Stock data cached for 60 seconds
   - Reduces API calls to Yahoo Finance

3. **Async Processing**
   - FastAPI async endpoints
   - Non-blocking I/O operations

4. **Parallel Processing**
   - scikit-learn: `n_jobs=-1` (use all CPUs)
   - Market heatmap: parallel stock fetching

### Performance Metrics

| Operation                | Response Time |
| ------------------------ | ------------- |
| List stocks              | < 100ms       |
| Get stock details        | < 200ms       |
| Live prediction (1M)     | 2-5s          |
| Live prediction (1Y)     | 5-10s         |
| Market heatmap (40 stocks)| 10-15s       |
| CNN prediction           | 15-30s        |

### Future Optimizations

1. **Redis Caching**
   - Cache predictions for 5 minutes
   - Cache market data for 1 minute

2. **Database Indexing**
   - Index on (symbol, date)
   - Index on (stock_id, prediction_date)

3. **Query Optimization**
   - Limit historical data queries
   - Pagination for large datasets

4. **CDN for Frontend**
   - Static assets on CDN
   - Faster global delivery

---

## Scalability

### Current Architecture Limitations

1. **Single Server**: No load balancing
2. **In-Memory Storage**: Lost on restart
3. **No Database**: File-based storage
4. **No Queue**: Synchronous processing

### Horizontal Scaling Plan

```
┌─────────────────────────────────────────────┐
│           Load Balancer (Nginx)             │
└─────────────────────────────────────────────┘
         │           │           │
    ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
    │ API     │ │ API     │ │ API     │
    │ Server 1│ │ Server 2│ │ Server 3│
    └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │
    ┌────┴────────────┴───────────┴────┐
    │         Redis Cache               │
    └───────────────────────────────────┘
         │           │           │
    ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
    │ Worker 1│ │ Worker 2│ │ Worker 3│
    │ (ML)    │ │ (ML)    │ │ (ML)    │
    └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │
    ┌────┴───────────┴───────────┴────┐
    │      PostgreSQL Database         │
    └──────────────────────────────────┘
```

### Vertical Scaling

1. **More RAM**: Larger model cache
2. **More CPUs**: Parallel model training
3. **GPU**: TensorFlow CNN training

### Microservices Architecture (Future)

```
API Gateway
    ├── Stock Service (CRUD operations)
    ├── Prediction Service (ML models)
    ├── Market Service (Heatmap, Breadth)
    └── User Service (Authentication)
```

---

## Deployment Architecture

### Development

```
Developer Machine
├── Backend: http://localhost:8000
└── Frontend: http://localhost:3000
```

### Docker Compose

```
Docker Host
├── Backend Container (Port 8000)
├── Frontend Container (Port 3000)
└── Network: stock-network
```

### Production (Recommended)

```
┌─────────────────────────────────────┐
│          Cloudflare (CDN)           │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│        Vercel (Frontend)            │
│        - Next.js App                │
│        - Static Assets              │
└─────────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌─────────────────────────────────────┐
│      AWS EC2 / DigitalOcean         │
│      - FastAPI Backend              │
│      - Nginx Reverse Proxy          │
│      - SSL Certificate              │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│      AWS RDS (PostgreSQL)           │
│      - Stock Data                   │
│      - Predictions                  │
└─────────────────────────────────────┘
```

---

## Monitoring & Logging

### Application Logging

```python
import logging

logger = logging.getLogger("stock_api")
logger.info(f"Prediction request: {symbol}, {timeframe}")
logger.error(f"Error fetching data: {error}")
```

### Metrics to Track

1. **API Metrics**
   - Request rate (requests/second)
   - Response time (p50, p95, p99)
   - Error rate (%)

2. **ML Metrics**
   - Model training time
   - Prediction accuracy
   - Model cache hit rate

3. **Business Metrics**
   - Active stocks
   - Popular timeframes
   - User engagement

### Monitoring Tools (Recommended)

- **Application**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Errors**: Sentry
- **Uptime**: UptimeRobot

---

## Conclusion

The Stock Market Data Science Dashboard is built with a **modular, scalable architecture** that separates concerns effectively:

- **Frontend**: React-based UI with modern components
- **Backend**: FastAPI with clean separation of ML, data, and API layers
- **ML Pipeline**: Flexible multi-model system with timeframe-specific optimizations
- **Data Layer**: Multi-source with fallback mechanisms

The architecture supports future enhancements like:
- Real-time WebSocket updates
- Database integration
- Microservices decomposition
- Horizontal scaling
- Advanced ML models (LSTM, Transformers)

---

**Last Updated**: October 14, 2025

