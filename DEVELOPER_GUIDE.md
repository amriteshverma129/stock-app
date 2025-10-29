# 👨‍💻 Developer Guide

Complete guide for developers who want to contribute, extend, or understand the codebase.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Code Structure](#code-structure)
4. [Adding New Features](#adding-new-features)
5. [ML Model Development](#ml-model-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Code Style](#code-style)
9. [Debugging](#debugging)
10. [Common Tasks](#common-tasks)
11. [Contributing](#contributing)

---

## Getting Started

### Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18 or higher
- **Git**: For version control
- **IDE**: VS Code, PyCharm, or similar

### Clone Repository

```bash
git clone <repository-url>
cd stock-app
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## Development Environment

### Recommended VS Code Extensions

**Python:**

- Python (Microsoft)
- Pylance
- Python Docstring Generator
- autoDocstring

**JavaScript/TypeScript:**

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

**General:**

- GitLens
- Docker
- Thunder Client (API testing)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Environment Variables

**Backend** - Create `backend/.env`:

```bash
DATA_FOLDER=../data
CACHE_ENABLED=true
LOG_LEVEL=INFO
```

**Frontend** - Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## Code Structure

### Backend Modules

#### `main.py` - API Server

```python
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Stock Market Data Science API")

@app.get("/stocks")
async def get_stocks(category: str = "Nifty50", limit: int = 10):
    """
    Get list of available stocks

    Args:
        category: Stock category (Nifty50, Midcap, etc.)
        limit: Maximum number of stocks to return

    Returns:
        Dictionary with stocks list and count
    """
    # Implementation
    pass
```

#### `ml_models.py` - ML Models

```python
class StockMLModels:
    """Machine Learning models for stock prediction"""

    def __init__(self):
        self.models = {}        # Trained models cache
        self.scalers = {}       # Feature scalers cache
        self.feature_importance = {}

    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare features for ML models

        Args:
            df: Stock price DataFrame with OHLCV data

        Returns:
            Tuple of (features_df, target_series)
        """
        # Feature engineering logic
        pass

    def train_and_predict(self, df: pd.DataFrame, symbol: str) -> Dict:
        """Train model and generate predictions"""
        pass
```

#### `data_processor.py` - Data Processing

```python
class DataProcessor:
    """Process and prepare stock market data"""

    def __init__(self, data_folder: str = '../data'):
        self.data_folder = Path(data_folder)
        self.stocks_cache = {}

    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate technical indicators

        Args:
            df: Price DataFrame

        Returns:
            DataFrame with added technical indicators
        """
        # Calculate MA, RSI, MACD, etc.
        pass
```

### Frontend Components

#### Component Template

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ComponentProps {
  symbol: string;
  timeframe?: string;
}

export function ComponentName({ symbol, timeframe = "1M" }: ComponentProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/endpoint`);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {symbol} - {timeframe}
        </CardTitle>
      </CardHeader>
      <CardContent>{/* Component content */}</CardContent>
    </Card>
  );
}
```

---

## Adding New Features

### 1. Add New API Endpoint

**Step 1: Define Response Model** (`main.py`)

```python
from pydantic import BaseModel

class NewFeatureResponse(BaseModel):
    symbol: str
    result: float
    confidence: str
```

**Step 2: Create Endpoint**

```python
@app.get("/stocks/{symbol}/new-feature")
async def get_new_feature(symbol: str, param: str = "default"):
    """
    New feature endpoint

    Args:
        symbol: Stock symbol
        param: Optional parameter

    Returns:
        NewFeatureResponse
    """
    try:
        # Fetch data
        stock_data = data_processor.get_stock_data(symbol)

        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

        # Process
        result = process_new_feature(stock_data, param)

        return NewFeatureResponse(
            symbol=symbol,
            result=result,
            confidence="High"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Step 3: Test Endpoint**

```bash
curl "http://localhost:8000/stocks/RELIANCE/new-feature?param=value"
```

### 2. Add New Frontend Component

**Step 1: Create Component** (`frontend/components/NewFeature.tsx`)

```typescript
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = "";

export function NewFeature({ symbol }: { symbol: string }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [symbol]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/stocks/${symbol}/new-feature`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching new feature:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Feature - {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        {data && (
          <div>
            <p>Result: {data.result}</p>
            <p>Confidence: {data.confidence}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Add to Main Page** (`frontend/app/page.tsx`)

```typescript
import { NewFeature } from "@/components/NewFeature";

// Inside a tab
<TabsContent value="new-feature">
  <NewFeature symbol={selectedStock} />
</TabsContent>;
```

---

## ML Model Development

### Adding a New ML Model

**Step 1: Create Model Class** (`backend/new_model.py`)

```python
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin
from typing import Dict

class NewMLModel(BaseEstimator, RegressorMixin):
    """
    New machine learning model for stock prediction
    """

    def __init__(self, param1: int = 100, param2: float = 0.01):
        self.param1 = param1
        self.param2 = param2
        self.model = None

    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """
        Prepare features specific to this model

        Args:
            df: Stock price DataFrame

        Returns:
            Feature matrix
        """
        # Custom feature engineering
        features = []

        # Add moving averages
        df['ma7'] = df['Close'].rolling(window=7).mean()
        df['ma21'] = df['Close'].rolling(window=21).mean()

        # Add your custom features
        # ...

        return features

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'NewMLModel':
        """
        Train the model

        Args:
            X: Feature matrix
            y: Target values

        Returns:
            Self
        """
        # Training logic
        self.model = YourModelClass(
            param1=self.param1,
            param2=self.param2
        )
        self.model.fit(X, y)

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions

        Args:
            X: Feature matrix

        Returns:
            Predictions
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        return self.model.predict(X)

    def get_metrics(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """
        Calculate model performance metrics

        Args:
            X_test: Test features
            y_test: Test targets

        Returns:
            Dictionary of metrics
        """
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

        y_pred = self.predict(X_test)

        return {
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred),
            'mape': np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        }
```

**Step 2: Integrate with API** (`main.py`)

```python
from new_model import NewMLModel

new_model_predictor = NewMLModel()

@app.get("/stocks/{symbol}/predict-new-model")
async def predict_with_new_model(symbol: str, timeframe: str = "1M"):
    """Predict using new ML model"""
    try:
        # Fetch data
        df = multi_source.fetch_stock_data(symbol, period_map[timeframe])

        # Prepare features
        X = new_model_predictor.prepare_features(df)

        # Train model
        new_model_predictor.fit(X[:-30], df['Close'].values[:-30])

        # Generate predictions
        predictions = new_model_predictor.predict(X[-30:])

        # Get metrics
        metrics = new_model_predictor.get_metrics(X[-30:], df['Close'].values[-30:])

        return {
            "symbol": symbol,
            "model": "NewMLModel",
            "predictions": predictions.tolist(),
            "metrics": metrics
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Model Comparison

Add your model to the comparison endpoint:

```python
@app.get("/models/compare-all/{symbol}")
async def compare_all_models(symbol: str, timeframe: str = "1M"):
    # Existing models
    rf_prediction = await predict_live_stock(symbol, timeframe)
    cnn_prediction = await predict_with_cnn(symbol, timeframe)

    # Add new model
    new_model_prediction = await predict_with_new_model(symbol, timeframe)

    return {
        "models": [
            {"name": "Random Forest", "metrics": rf_prediction['modelMetrics']},
            {"name": "CNN", "metrics": cnn_prediction['modelMetrics']},
            {"name": "NewMLModel", "metrics": new_model_prediction['metrics']}
        ]
    }
```

---

## Frontend Development

### Adding New Chart

**Step 1: Create Chart Component** (`components/charts/NewChart.tsx`)

```typescript
import { BarStack } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";

interface DataPoint {
  date: string;
  value: number;
}

export function NewChart({ data }: { data: DataPoint[] }) {
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleBand({
    domain: data.map((d) => d.date),
    range: [0, xMax],
    padding: 0.2,
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map((d) => d.value))],
    range: [yMax, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = yMax - yScale(d.value);
          const barX = xScale(d.date);
          const barY = yScale(d.value);

          return (
            <rect
              key={i}
              x={barX}
              y={barY}
              width={xScale.bandwidth()}
              height={barHeight}
              fill="steelblue"
            />
          );
        })}

        {/* Axes */}
        <AxisBottom top={yMax} scale={xScale} />
        <AxisLeft scale={yScale} />
      </Group>
    </svg>
  );
}
```

### Adding New UI Component

Use shadcn/ui CLI:

```bash
cd frontend
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
```

Then use in your component:

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Option 1</DropdownMenuItem>
    <DropdownMenuItem>Option 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

---

## Testing

### Backend Testing

**Create Test File** (`backend/test_api.py`)

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_stocks():
    """Test stocks list endpoint"""
    response = client.get("/stocks?category=Nifty50&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "stocks" in data
    assert "count" in data
    assert data["count"] <= 5

def test_live_stock_prediction():
    """Test live prediction endpoint"""
    response = client.get("/live/stocks/RELIANCE/predict?timeframe=1M")
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "modelMetrics" in data
    assert "recommendation" in data

def test_invalid_stock():
    """Test error handling for invalid stock"""
    response = client.get("/stocks/INVALID/analysis")
    assert response.status_code == 404

def test_invalid_timeframe():
    """Test error handling for invalid timeframe"""
    response = client.get("/live/stocks/RELIANCE/predict?timeframe=INVALID")
    assert response.status_code == 400
```

**Run Tests**

```bash
cd backend
pip install pytest pytest-cov
pytest test_api.py -v
pytest test_api.py --cov=. --cov-report=html
```

### ML Model Testing

```python
def test_model_training():
    """Test ML model training"""
    from ml_models import StockMLModels
    import pandas as pd
    import numpy as np

    # Create sample data
    dates = pd.date_range('2023-01-01', periods=365)
    data = {
        'Open': np.random.uniform(100, 200, 365),
        'High': np.random.uniform(100, 200, 365),
        'Low': np.random.uniform(100, 200, 365),
        'Close': np.random.uniform(100, 200, 365),
        'Volume': np.random.randint(1000000, 10000000, 365)
    }
    df = pd.DataFrame(data, index=dates)

    # Train model
    ml_models = StockMLModels()
    result = ml_models.train_and_predict(df, "TEST")

    # Assertions
    assert "predictions" in result
    assert "metrics" in result
    assert result["metrics"]["r2"] >= -1  # R² can be negative
    assert result["metrics"]["rmse"] > 0
```

### Frontend Testing

**Install Testing Libraries**

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Create Test** (`components/__tests__/LiveStockAnalysis.test.tsx`)

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { LiveStockAnalysis } from "../LiveStockAnalysis";

jest.mock("axios");

describe("LiveStockAnalysis", () => {
  it("renders loading state", () => {
    render(<LiveStockAnalysis symbol="RELIANCE" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("fetches and displays predictions", async () => {
    const mockData = {
      currentPrice: 2850.5,
      recommendation: "BUY",
      predictions: [],
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<LiveStockAnalysis symbol="RELIANCE" />);

    await waitFor(() => {
      expect(screen.getByText("BUY")).toBeInTheDocument();
    });
  });
});
```

---

## Code Style

### Python (PEP 8)

Use `black` for formatting:

```bash
pip install black flake8
black backend/
flake8 backend/ --max-line-length=100
```

**Code Conventions:**

```python
# Good: Descriptive variable names
current_stock_price = 2850.50
moving_average_20 = calculate_ma(df, window=20)

# Bad: Single letter variables
p = 2850.50
ma = calculate_ma(df, window=20)

# Good: Type hints
def calculate_prediction(df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
    pass

# Good: Docstrings
def complex_function(param1: int, param2: str) -> bool:
    """
    Short description of function

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Raises:
        ValueError: When param1 is negative
    """
    pass
```

### TypeScript/React

Use `prettier` for formatting:

```bash
npm install --save-dev prettier
npx prettier --write "**/*.{ts,tsx}"
```

**Code Conventions:**

```typescript
// Good: Functional components with TypeScript
interface StockCardProps {
  symbol: string;
  price: number;
  onChange?: (value: number) => void;
}

export function StockCard({ symbol, price, onChange }: StockCardProps) {
  // Component logic
}

// Good: Custom hooks
function useStockData(symbol: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [symbol]);

  return { data, loading };
}

// Good: Proper error handling
try {
  const response = await axios.get(url);
  setData(response.data);
} catch (error) {
  console.error("Error fetching data:", error);
  setError(error.message);
}
```

---

## Debugging

### Backend Debugging

**Add Logging**

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.get("/stocks/{symbol}/analysis")
async def get_stock_analysis(symbol: str):
    logger.info(f"Fetching analysis for {symbol}")
    try:
        result = process_analysis(symbol)
        logger.debug(f"Analysis result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error in analysis: {e}", exc_info=True)
        raise
```

**Interactive Debugging (IPython)**

```python
# Add breakpoint
import ipdb; ipdb.set_trace()

# Or use built-in breakpoint()
breakpoint()
```

**VS Code Debugging**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload"],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

### Frontend Debugging

**Console Logging**

```typescript
console.log("Symbol:", symbol);
console.table(predictions);
console.dir(complexObject);
```

**React DevTools**

Install React DevTools browser extension for:

- Component inspection
- Props/state viewing
- Performance profiling

**Network Debugging**

```typescript
// Log all API calls
axios.interceptors.request.use((request) => {
  console.log("Starting Request:", request);
  return request;
});

axios.interceptors.response.use((response) => {
  console.log("Response:", response);
  return response;
});
```

---

## Common Tasks

### Add New Stock Symbol

**Step 1: Update `live_data_fetcher.py`**

```python
INDIAN_STOCKS = {
    # ... existing stocks
    'NEWSTOCK': 'NEWSTOCK.NS',  # Add new symbol
}
```

**Step 2: Update `multi_source_fetcher.py`**

```python
def get_all_stocks(self):
    stocks = [
        # ... existing stocks
        {'symbol': 'NEWSTOCK', 'name': 'New Stock Name', 'sector': 'Technology'},
    ]
    return stocks
```

### Change Model Hyperparameters

**In `ml_models.py`**:

```python
# Modify RandomForestRegressor
model = RandomForestRegressor(
    n_estimators=200,      # Increase from 100
    max_depth=15,          # Increase from 10
    min_samples_split=3,   # Decrease from 5
    random_state=42,
    n_jobs=-1
)
```

### Add New Technical Indicator

**In `data_processor.py`**:

```python
def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
    tech_df = df.copy()

    # ... existing indicators

    # Add new indicator: Stochastic Oscillator
    low_14 = tech_df['Low'].rolling(window=14).min()
    high_14 = tech_df['High'].rolling(window=14).max()
    tech_df['stochastic'] = 100 * ((tech_df['Close'] - low_14) / (high_14 - low_14))

    return tech_df
```

### Customize Timeframe Targets

**In `advanced_ml_models.py`**:

```python
def get_price_targets(self, current_price: float, timeframe: str, trend: str) -> Dict:
    # Modify target percentages
    targets = {
        '1M': (0.03, 0.07, 0.12),    # More conservative
        '6M': (0.10, 0.20, 0.35),
        '1Y': (0.20, 0.40, 0.65),
        '5Y': (0.40, 0.80, 1.80)
    }
    # ... rest of function
```

---

## Contributing

### Git Workflow

**1. Create Feature Branch**

```bash
git checkout -b feature/new-ml-model
```

**2. Make Changes**

```bash
# Edit files
git add .
git commit -m "feat: add new LSTM model for predictions"
```

**3. Push Branch**

```bash
git push origin feature/new-ml-model
```

**4. Create Pull Request**

- Go to GitHub/GitLab
- Create Pull Request from `feature/new-ml-model` to `main`
- Add description of changes
- Request review

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add CNN model for long-term predictions
fix: resolve heatmap color scale issue
docs: update API documentation
style: format code with black
refactor: extract feature engineering to separate module
test: add tests for multi-timeframe predictor
chore: update dependencies
```

### Code Review Checklist

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] Error handling implemented
- [ ] Performance considerations addressed

---

## Resources

### Documentation

- **FastAPI**: https://fastapi.tiangolo.com/
- **Next.js**: https://nextjs.org/docs
- **scikit-learn**: https://scikit-learn.org/stable/
- **TensorFlow**: https://www.tensorflow.org/api_docs
- **visx**: https://airbnb.io/visx/docs
- **shadcn/ui**: https://ui.shadcn.com/docs

### Machine Learning

- **Time Series Forecasting**: https://otexts.com/fpp3/
- **Feature Engineering**: https://www.kaggle.com/learn/feature-engineering
- **Model Evaluation**: https://scikit-learn.org/stable/modules/model_evaluation.html

### Stock Market

- **Technical Analysis**: https://www.investopedia.com/technical-analysis-4689657
- **Yahoo Finance API**: https://github.com/ranaroussi/yfinance

---

**Happy Coding! 🚀**

If you have questions or need help, open an issue on GitHub.

---

**Last Updated**: October 14, 2025
