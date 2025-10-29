"""
FastAPI Backend for Stock Market Data Science Dashboard
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime, timedelta
from pydantic import BaseModel

from ml_models import StockMLModels
from data_processor import DataProcessor
from static_data_provider import StaticDataProvider
from advanced_ml_models import MultiTimeframePredictor
from cnn_models import CNNStockPredictor
from indian_stocks_data import get_cached_stocks, get_cached_sectors, generate_historical_data

app = FastAPI(title="Stock Market Data Science API")

# CORS middleware
# Add your deployed frontend URL here after deployment
allowed_origins = ["*" ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
data_processor = DataProcessor(data_folder='../data')
ml_models = StockMLModels()
static_provider = StaticDataProvider()
timeframe_predictor = MultiTimeframePredictor()
cnn_predictor = CNNStockPredictor()

# Response models
class StockInfo(BaseModel):
    symbol: str
    name: str
    currentPrice: float
    change: float
    changePercent: float
    marketCap: Optional[float]
    peRatio: Optional[float]
    volume: Optional[int]

class PricePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class Prediction(BaseModel):
    date: str
    predicted: float
    actual: Optional[float]
    upperBound: float
    lowerBound: float

class TechnicalIndicators(BaseModel):
    ma20: float
    ma50: float
    ma200: float
    rsi: float
    momentum: float
    volatility: float

class ModelMetrics(BaseModel):
    rmse: float
    mae: float
    r2: float
    mape: float

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class PortfolioPosition(BaseModel):
    symbol: str
    quantity: float
    avgPrice: float
    purchaseDate: Optional[str] = None

class PortfolioCalculation(BaseModel):
    symbol: str
    name: str
    quantity: float
    avgPrice: float
    currentPrice: float
    marketValue: float
    costBasis: float
    gain: float
    gainPercent: float
    weight: float
    purchaseDate: Optional[str] = None
    holdingDays: Optional[int] = None

class StockAnalysis(BaseModel):
    stockInfo: StockInfo
    priceHistory: List[PricePoint]
    predictions: List[Prediction]
    technicalIndicators: TechnicalIndicators
    modelMetrics: ModelMetrics
    featureImportance: List[FeatureImportance]
    recommendation: str
    confidence: str
    riskLevel: str


@app.get("/")
async def root():
    return {
        "message": "Stock Market Data Science API",
        "version": "1.0.0",
        "endpoints": [
            "/stocks",
            "/stocks/{symbol}",
            "/stocks/{symbol}/analysis",
            "/stocks/{symbol}/predict",
            "/market/summary",
            "/models/compare"
        ]
    }


@app.get("/stocks")
async def get_stocks(category: str = "Nifty50", limit: int = 10):
    """Get list of available stocks"""
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        stocks = static_provider.get_stock_list()[:limit]
        
        stock_list = []
        for stock in stocks:
            stock_list.append({
                "symbol": stock["symbol"],
                "name": stock["name"],
                "currentPrice": stock["current_price"],
                "change": stock["change"],
                "changePercent": stock["change_percent"],
                "marketCap": None,  # Will be added from detailed info if needed
                "peRatio": None,    # Will be added from detailed info if needed
                "volume": stock["volume"]
            })
        
        return {"stocks": stock_list, "count": len(stock_list)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stocks/{symbol}")
async def get_stock_details(symbol: str, days: int = 365):
    """Get detailed stock information"""
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        # Get stock info
        stock_info = static_provider.get_stock_info(symbol)
        if not stock_info:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Get historical data
        period = '1y' if days >= 365 else '6mo' if days >= 180 else '1mo'
        df = static_provider.get_stock_data(symbol, period)
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No historical data for {symbol}")
        
        # Limit to requested days
        df = df.tail(days)
        
        # Convert to price points
        price_history = []
        for idx, row in df.iterrows():
            price_history.append({
                "date": idx.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"])
            })
        
        return {
            "stockInfo": {
                "symbol": stock_info["symbol"],
                "name": stock_info["name"],
                "currentPrice": stock_info["current_price"],
                "change": stock_info["change"],
                "changePercent": stock_info["change_percent"],
                "marketCap": stock_info["market_cap"],
                "peRatio": stock_info["pe_ratio"],
                "volume": stock_info["volume"]
            },
            "priceHistory": price_history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stocks/{symbol}/analysis")
async def get_stock_analysis(symbol: str):
    """Get comprehensive stock analysis with ML predictions"""
    try:
        stock_data = data_processor.get_stock_data(symbol)
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Process data
        df = data_processor.process_stock_data(symbol, stock_data)
        
        # Calculate technical indicators
        technical = data_processor.calculate_technical_indicators(df)
        
        # Train ML models and get predictions
        models_result = ml_models.train_and_predict(df, symbol)
        
        # Get feature importance
        feature_importance = ml_models.get_feature_importance(symbol)
        
        # Generate recommendation
        recommendation_data = ml_models.generate_recommendation(
            models_result, technical
        )
        
        # Latest stock info
        latest = stock_data[-1] if stock_data else {}
        
        stock_info = {
            "symbol": symbol,
            "name": symbol.replace("-", " ").title(),
            "currentPrice": float(df["Close"].iloc[-1]),
            "change": float(df["Close"].iloc[-1] - df["Close"].iloc[-2]),
            "changePercent": float(((df["Close"].iloc[-1] - df["Close"].iloc[-2]) / df["Close"].iloc[-2]) * 100),
            "marketCap": latest.get("marketCap"),
            "peRatio": latest.get("peRatio"),
            "volume": int(df["Volume"].iloc[-1])
        }
        
        # Price history (last 90 days)
        df_recent = df.tail(90)
        price_history = []
        for idx, row in df_recent.iterrows():
            price_history.append({
                "date": idx.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"])
            })
        
        # Predictions
        predictions = []
        for date, pred, actual, upper, lower in zip(
            models_result["prediction_dates"],
            models_result["predictions"],
            models_result["actuals"],
            models_result["upper_bound"],
            models_result["lower_bound"]
        ):
            predictions.append({
                "date": date.strftime("%Y-%m-%d") if isinstance(date, datetime) else date,
                "predicted": float(pred),
                "actual": float(actual) if actual is not None else None,
                "upperBound": float(upper),
                "lowerBound": float(lower)
            })
        
        # Technical indicators (current values)
        technical_indicators = {
            "ma20": float(technical["ma20"].iloc[-1]),
            "ma50": float(technical["ma50"].iloc[-1]),
            "ma200": float(technical["ma200"].iloc[-1]) if len(df) >= 200 else 0.0,
            "rsi": float(technical["rsi"].iloc[-1]),
            "momentum": float(technical["momentum"].iloc[-1]),
            "volatility": float(technical["volatility"].iloc[-1])
        }
        
        # Model metrics
        model_metrics = {
            "rmse": float(models_result["metrics"]["rmse"]),
            "mae": float(models_result["metrics"]["mae"]),
            "r2": float(models_result["metrics"]["r2"]),
            "mape": float(models_result["metrics"]["mape"])
        }
        
        return {
            "stockInfo": stock_info,
            "priceHistory": price_history,
            "predictions": predictions,
            "technicalIndicators": technical_indicators,
            "modelMetrics": model_metrics,
            "featureImportance": feature_importance,
            "recommendation": recommendation_data["recommendation"],
            "confidence": recommendation_data["confidence"],
            "riskLevel": recommendation_data["risk"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stocks/{symbol}/predict")
async def predict_stock(symbol: str, days: int = 30):
    """Get stock price predictions"""
    try:
        stock_data = data_processor.get_stock_data(symbol)
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        df = data_processor.process_stock_data(symbol, stock_data)
        
        # Get predictions
        predictions = ml_models.predict_future(df, symbol, days)
        
        return {
            "symbol": symbol,
            "predictions": predictions,
            "forecastDays": days
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/market/summary")
async def get_market_summary(category: str = "Nifty50", limit: int = 10):
    """Get market summary and top movers"""
    try:
        stocks = data_processor.load_stocks(category, limit)
        
        summary_data = []
        for symbol, data in stocks.items():
            df = data_processor.process_stock_data(symbol, data)
            
            if len(df) < 2:
                continue
            
            current_price = float(df["Close"].iloc[-1])
            prev_price = float(df["Close"].iloc[-2])
            change = current_price - prev_price
            change_pct = (change / prev_price) * 100
            
            latest = data[-1] if data else {}
            
            summary_data.append({
                "symbol": symbol,
                "name": symbol.replace("-", " ").title(),
                "currentPrice": current_price,
                "change": change,
                "changePercent": change_pct,
                "marketCap": latest.get("marketCap"),
                "volume": int(df["Volume"].iloc[-1])
            })
        
        # Sort by change percent
        summary_data.sort(key=lambda x: x["changePercent"], reverse=True)
        
        # Calculate market stats
        total_changes = [s["changePercent"] for s in summary_data]
        avg_change = np.mean(total_changes)
        
        return {
            "marketStats": {
                "averageChange": float(avg_change),
                "advancers": len([s for s in summary_data if s["changePercent"] > 0]),
                "decliners": len([s for s in summary_data if s["changePercent"] < 0]),
                "unchanged": len([s for s in summary_data if s["changePercent"] == 0])
            },
            "topGainers": summary_data[:5],
            "topLosers": summary_data[-5:],
            "allStocks": summary_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/compare")
async def compare_models(symbol: str):
    """Compare different ML models for a stock"""
    try:
        stock_data = data_processor.get_stock_data(symbol)
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        df = data_processor.process_stock_data(symbol, stock_data)
        
        # Compare multiple models
        comparison = ml_models.compare_models(df, symbol)
        
        return {
            "symbol": symbol,
            "models": comparison["models"],
            "bestModel": comparison["best_model"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/stocks")
async def get_live_stocks():
    """Get list of all available Indian stocks"""
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        stocks = static_provider.get_stock_list()
        return {"stocks": stocks, "count": len(stocks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/market/heatmap")
async def get_market_heatmap():
    """Get market heatmap data - all stocks with current performance"""
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        heatmap_data = static_provider.get_market_heatmap_data()
        return heatmap_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/market/breadth")
async def get_market_breadth():
    """Get market breadth statistics - advance/decline ratio, volume, etc."""
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        # Get market overview data
        market_data = static_provider.get_market_overview()
        return market_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/stocks/{symbol}")
async def get_live_stock_data(symbol: str, period: str = "1y"):
    """
    Get live stock data from static data source
    
    Args:
        symbol: Stock symbol (e.g., RELIANCE, TCS)
        period: Time period (1mo, 6mo, 1y, 5y)
    """
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        # Get stock info
        stock_info = static_provider.get_stock_info(symbol)
        if not stock_info:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Get historical data
        df = static_provider.get_stock_data(symbol, period)
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Convert DataFrame to price history
        price_history = []
        for idx, row in df.iterrows():
            price_history.append({
                "date": idx.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"])
            })
        
        return {
            "stockInfo": stock_info,
            "priceHistory": price_history,
            "period": period
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/stocks/{symbol}/predict")
async def predict_live_stock(symbol: str, timeframe: str = "1M"):
    """
    Multi-timeframe predictions for live stock data
    
    Args:
        symbol: Stock symbol
        timeframe: '1M', '6M', '1Y', or '5Y'
    """
    try:
        if timeframe not in ['1M', '6M', '1Y', '5Y']:
            raise HTTPException(status_code=400, detail="Timeframe must be 1M, 6M, 1Y, or 5Y")
        
        # Map timeframe to Yahoo Finance period (get more data for training)
        period_map = {
            '1M': '6mo',   # Get 6 months for 1-month prediction
            '6M': '2y',    # Get 2 years for 6-month prediction
            '1Y': '5y',    # Get 5 years for 1-year prediction
            '5Y': 'max'    # Get all available data for 5-year prediction
        }
        
        # Get static data
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        df = static_provider.get_stock_data(symbol, period_map[timeframe])
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Train model and get predictions
        training_result = timeframe_predictor.train_model(df, symbol, timeframe)
        
        if 'error' in training_result:
            raise HTTPException(status_code=400, detail=training_result['error'])
        
        # Generate future predictions
        future_predictions = timeframe_predictor.predict_future(df, symbol, timeframe)
        
        # Get current trend
        trend = timeframe_predictor.analyze_trend(df, timeframe)
        
        # Calculate price targets
        current_price = float(df['Close'].iloc[-1])
        price_targets = timeframe_predictor.get_price_targets(current_price, timeframe, trend)
        
        # Generate recommendation
        if trend == 'Bullish' and training_result['metrics']['r2'] > 0.5:
            recommendation = 'BUY'
            confidence = 'High'
        elif trend == 'Bullish':
            recommendation = 'BUY'
            confidence = 'Medium'
        elif trend == 'Bearish' and training_result['metrics']['r2'] > 0.5:
            recommendation = 'SELL'
            confidence = 'High'
        else:
            recommendation = 'HOLD'
            confidence = 'Low'
        
        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "currentPrice": current_price,
            "predictions": future_predictions,
            "modelMetrics": training_result['metrics'],
            "trend": trend,
            "priceTargets": price_targets,
            "recommendation": recommendation,
            "confidence": confidence,
            "predictionPoints": len(future_predictions)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/stocks/{symbol}/analysis")
async def get_live_stock_analysis(symbol: str):
    """Complete analysis with all timeframe predictions"""
    try:
        # Fetch stock info (multi-source)
        stock_info = multi_source.get_stock_info(symbol)
        
        if not stock_info or stock_info.get('currentPrice', 0) == 0:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Get predictions for all timeframes
        timeframes = ['1M', '6M', '1Y', '5Y']
        all_predictions = {}
        
        for tf in timeframes:
            try:
                prediction = await predict_live_stock(symbol, tf)
                all_predictions[tf] = prediction
            except Exception as e:
                print(f"Error predicting {tf} for {symbol}: {e}")
                all_predictions[tf] = None
        
        return {
            "stockInfo": stock_info,
            "predictions": all_predictions,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/stocks/{symbol}/predict-cnn")
async def predict_with_cnn(symbol: str, timeframe: str = "1M"):
    """
    CNN-based predictions for stock prices
    
    Args:
        symbol: Stock symbol
        timeframe: '1M', '6M', '1Y', or '5Y'
    """
    try:
        if timeframe not in ['1M', '6M', '1Y', '5Y']:
            raise HTTPException(status_code=400, detail="Timeframe must be 1M, 6M, 1Y, or 5Y")
        
        # Map timeframe to data period
        period_map = {
            '1M': '1y',
            '6M': '2y',
            '1Y': '5y',
            '5Y': 'max'
        }
        
        # Fetch live data
        df = multi_source.fetch_stock_data(symbol, period_map[timeframe])
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Train CNN model
        training_result = cnn_predictor.train_cnn_model(df, symbol, timeframe, epochs=50)
        
        if 'error' in training_result:
            raise HTTPException(status_code=400, detail=training_result['error'])
        
        # Generate future predictions
        days_map = {'1M': 30, '6M': 180, '1Y': 365, '5Y': 1825}
        prediction_days = days_map.get(timeframe, 30)
        
        future_predictions = cnn_predictor.predict_future_cnn(df, symbol, timeframe, prediction_days)
        
        # Get trend
        current_price = float(df['Close'].iloc[-1])
        last_pred = future_predictions[-1] if future_predictions else None
        
        if last_pred:
            predicted_price = last_pred['predicted']
            expected_return = ((predicted_price - current_price) / current_price) * 100
            trend = 'Bullish' if expected_return > 0 else 'Bearish'
            
            # Recommendation based on CNN prediction
            if expected_return > 10 and training_result['metrics']['r2'] > 0.6:
                recommendation = 'STRONG BUY'
                confidence = 'High'
            elif expected_return > 5:
                recommendation = 'BUY'
                confidence = 'Medium'
            elif expected_return < -10 and training_result['metrics']['r2'] > 0.6:
                recommendation = 'STRONG SELL'
                confidence = 'High'
            elif expected_return < -5:
                recommendation = 'SELL'
                confidence = 'Medium'
            else:
                recommendation = 'HOLD'
                confidence = 'Low'
        else:
            trend = 'Neutral'
            recommendation = 'HOLD'
            confidence = 'Low'
            predicted_price = current_price
            expected_return = 0
        
        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "model": "CNN (1D Convolutional Neural Network)",
            "currentPrice": current_price,
            "predictedPrice": predicted_price,
            "expectedReturn": expected_return,
            "predictions": future_predictions,
            "modelMetrics": training_result['metrics'],
            "trainingHistory": training_result.get('training_history', {}),
            "trend": trend,
            "recommendation": recommendation,
            "confidence": confidence,
            "predictionPoints": len(future_predictions)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/compare-all/{symbol}")
async def compare_all_models(symbol: str, timeframe: str = "1M"):
    """
    Compare Random Forest, Gradient Boosting, and CNN models
    
    Args:
        symbol: Stock symbol
        timeframe: '1M', '6M', '1Y', or '5Y'
    """
    try:
        # Get predictions from all models
        rf_gb_prediction = await predict_live_stock(symbol, timeframe)
        
        # Try CNN prediction
        try:
            cnn_prediction = await predict_with_cnn(symbol, timeframe)
            cnn_available = True
        except:
            cnn_available = False
            cnn_prediction = None
        
        comparison = {
            "symbol": symbol,
            "timeframe": timeframe,
            "models": [
                {
                    "name": "Random Forest / Gradient Boosting",
                    "metrics": rf_gb_prediction['modelMetrics'],
                    "recommendation": rf_gb_prediction['recommendation'],
                    "confidence": rf_gb_prediction['confidence'],
                    "available": True
                }
            ]
        }
        
        if cnn_available and cnn_prediction:
            comparison["models"].append({
                "name": "CNN (Convolutional Neural Network)",
                "metrics": cnn_prediction['modelMetrics'],
                "recommendation": cnn_prediction['recommendation'],
                "confidence": cnn_prediction['confidence'],
                "available": True,
                "trainingLoss": cnn_prediction.get('trainingHistory', {}).get('loss', [])
            })
            
            # Determine best model
            rf_r2 = rf_gb_prediction['modelMetrics']['r2']
            cnn_r2 = cnn_prediction['modelMetrics']['r2']
            
            comparison["bestModel"] = "CNN" if cnn_r2 > rf_r2 else "Random Forest/Gradient Boosting"
            comparison["bestR2"] = max(rf_r2, cnn_r2)
        else:
            comparison["models"].append({
                "name": "CNN (Convolutional Neural Network)",
                "available": False,
                "note": "Install TensorFlow to enable: pip install tensorflow"
            })
            comparison["bestModel"] = "Random Forest/Gradient Boosting"
        
        return comparison
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/portfolio/calculate")
async def calculate_portfolio(positions: List[PortfolioPosition]):
    """
    Calculate portfolio metrics for given positions
    
    Args:
        positions: List of portfolio positions with symbol, quantity, avgPrice, and optional purchaseDate
    
    Returns:
        Detailed portfolio calculations including current values, gains, and weights
    """
    try:
        if not static_provider.is_available():
            raise HTTPException(status_code=503, detail="Static data not available")
        
        calculated_positions = []
        total_market_value = 0
        total_cost_basis = 0
        
        # First pass: calculate individual positions
        for position in positions:
            # Get current stock price
            stock_info = static_provider.get_stock_info(position.symbol)
            if not stock_info:
                continue
            
            current_price = stock_info["current_price"]
            cost_basis = position.quantity * position.avgPrice
            market_value = position.quantity * current_price
            gain = market_value - cost_basis
            gain_percent = (gain / cost_basis * 100) if cost_basis > 0 else 0
            
            # Calculate holding days if purchase date provided
            holding_days = None
            if position.purchaseDate:
                try:
                    purchase_date = datetime.fromisoformat(position.purchaseDate.replace('Z', '+00:00'))
                    holding_days = (datetime.now() - purchase_date).days
                except:
                    holding_days = None
            
            calculated_positions.append({
                "symbol": position.symbol,
                "name": stock_info["name"],
                "quantity": position.quantity,
                "avgPrice": position.avgPrice,
                "currentPrice": current_price,
                "marketValue": market_value,
                "costBasis": cost_basis,
                "gain": gain,
                "gainPercent": gain_percent,
                "weight": 0,  # Will be calculated in second pass
                "purchaseDate": position.purchaseDate,
                "holdingDays": holding_days
            })
            
            total_market_value += market_value
            total_cost_basis += cost_basis
        
        # Second pass: calculate weights
        for pos in calculated_positions:
            pos["weight"] = (pos["marketValue"] / total_market_value * 100) if total_market_value > 0 else 0
        
        total_gain = total_market_value - total_cost_basis
        total_gain_percent = (total_gain / total_cost_basis * 100) if total_cost_basis > 0 else 0
        
        return {
            "positions": calculated_positions,
            "summary": {
                "totalValue": total_market_value,
                "totalCost": total_cost_basis,
                "totalGain": total_gain,
                "totalGainPercent": total_gain_percent,
                "positionCount": len(calculated_positions)
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/portfolio/stock-search")
async def search_stocks_for_portfolio(query: str = "", limit: int = 20):
    """
    Search stocks for adding to portfolio
    
    Args:
        query: Search term (symbol or name)
        limit: Maximum number of results
    
    Returns:
        List of matching stocks with current prices
    """
    try:
        all_stocks = get_cached_stocks()
        
        # Filter by query if provided
        if query:
            query_lower = query.lower()
            filtered_stocks = [
                s for s in all_stocks
                if query_lower in s["symbol"].lower() or query_lower in s["name"].lower()
            ]
        else:
            filtered_stocks = all_stocks
        
        # Limit results
        results = filtered_stocks[:limit]
        
        return {
            "stocks": results,
            "count": len(results),
            "total": len(all_stocks)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/market/stocks-all")
async def get_all_indian_stocks():
    """
    Get all 500 Indian stocks with current data
    
    Returns:
        Complete list of 500 Indian stocks with prices, changes, sectors, etc.
    """
    try:
        stocks = get_cached_stocks()
        sectors = get_cached_sectors()
        
        return {
            "stocks": stocks,
            "sectors": sectors,
            "totalStocks": len(stocks),
            "totalSectors": len(sectors),
            "lastUpdate": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

