"""
Machine Learning Models for Stock Price Prediction
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


class StockMLModels:
    """Machine Learning models for stock prediction"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features for ML models"""
        features_df = df.copy()
        
        # Technical indicators
        features_df['ma5'] = df['Close'].rolling(window=5).mean()
        features_df['ma10'] = df['Close'].rolling(window=10).mean()
        features_df['ma20'] = df['Close'].rolling(window=20).mean()
        features_df['ma50'] = df['Close'].rolling(window=50).mean()
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        features_df['rsi'] = 100 - (100 / (1 + rs))
        
        # Momentum
        features_df['momentum'] = df['Close'].diff(10)
        features_df['roc'] = df['Close'].pct_change(periods=10) * 100
        
        # Volatility
        features_df['volatility'] = df['Close'].pct_change().rolling(window=20).std()
        
        # Volume features
        features_df['volume_ma'] = df['Volume'].rolling(window=20).mean()
        features_df['volume_ratio'] = df['Volume'] / features_df['volume_ma']
        
        # Price ratios
        features_df['high_low_ratio'] = df['High'] / df['Low']
        features_df['close_open_ratio'] = df['Close'] / df['Open']
        
        # Lagged features
        for i in range(1, 6):
            features_df[f'close_lag_{i}'] = df['Close'].shift(i)
            features_df[f'return_lag_{i}'] = df['Close'].pct_change().shift(i)
        
        # Target: next day's close
        features_df['target'] = df['Close'].shift(-1)
        
        # Drop NaN
        features_df = features_df.dropna()
        
        # Separate features and target
        feature_cols = [col for col in features_df.columns 
                       if col not in ['target', 'Open', 'High', 'Low', 'Close', 'Volume']]
        
        X = features_df[feature_cols]
        y = features_df['target']
        
        return X, y
    
    def train_and_predict(self, df: pd.DataFrame, symbol: str) -> Dict:
        """Train model and generate predictions"""
        X, y = self.prepare_features(df)
        
        # Split data
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train Random Forest (best for stock prediction)
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = model.predict(X_test_scaled)
        
        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        # Store model and scaler
        self.models[symbol] = model
        self.scalers[symbol] = scaler
        
        # Feature importance
        feature_importance = list(zip(X.columns, model.feature_importances_))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        self.feature_importance[symbol] = feature_importance
        
        # Confidence intervals (simplified)
        std_dev = np.std(y_test - y_pred)
        upper_bound = y_pred + (2 * std_dev)
        lower_bound = y_pred - (2 * std_dev)
        
        # Get actual dates for test set
        test_dates = df.index[split_idx + len(df) - len(X):][:len(y_test)]
        
        return {
            "predictions": y_pred,
            "actuals": y_test.values,
            "prediction_dates": test_dates,
            "upper_bound": upper_bound,
            "lower_bound": lower_bound,
            "metrics": {
                "rmse": rmse,
                "mae": mae,
                "r2": r2,
                "mape": mape
            }
        }
    
    def predict_future(self, df: pd.DataFrame, symbol: str, days: int = 30) -> List[Dict]:
        """Predict future prices"""
        if symbol not in self.models:
            # Train model first
            self.train_and_predict(df, symbol)
        
        model = self.models[symbol]
        scaler = self.scalers[symbol]
        
        # Prepare last data point
        X, y = self.prepare_features(df)
        last_features = X.iloc[-1:].values
        last_features_scaled = scaler.transform(last_features)
        
        # Simple forecasting (this is basic, better to use ARIMA/LSTM for time series)
        predictions = []
        last_date = df.index[-1]
        last_price = df['Close'].iloc[-1]
        
        for i in range(days):
            # Predict next price
            next_price = model.predict(last_features_scaled)[0]
            next_date = last_date + timedelta(days=i+1)
            
            # Add some uncertainty
            std_dev = df['Close'].pct_change().std() * last_price
            
            predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted": float(next_price),
                "upperBound": float(next_price + 2 * std_dev),
                "lowerBound": float(next_price - 2 * std_dev)
            })
        
        return predictions
    
    def get_feature_importance(self, symbol: str) -> List[Dict]:
        """Get feature importance for a model"""
        if symbol not in self.feature_importance:
            return []
        
        importance_list = []
        for feature, importance in self.feature_importance[symbol][:10]:  # Top 10
            importance_list.append({
                "feature": feature,
                "importance": float(importance)
            })
        
        return importance_list
    
    def generate_recommendation(self, models_result: Dict, technical: pd.DataFrame) -> Dict:
        """Generate trading recommendation"""
        # Get trends
        current_price = technical['Close'].iloc[-1]
        ma20 = technical['ma20'].iloc[-1]
        ma50 = technical['ma50'].iloc[-1]
        rsi = technical['rsi'].iloc[-1]
        
        # Calculate prediction direction
        predictions = models_result['predictions']
        actuals = models_result['actuals']
        avg_pred_change = np.mean(predictions - actuals[-len(predictions):])
        
        # Scoring system
        score = 0
        
        # MA trends
        if current_price > ma20: score += 1
        if current_price > ma50: score += 1
        if ma20 > ma50: score += 1
        
        # RSI
        if 30 < rsi < 70: score += 1  # Not overbought/oversold
        elif rsi < 30: score += 2  # Oversold - buy signal
        
        # Prediction
        if avg_pred_change > 0: score += 2
        
        # Model performance
        r2 = models_result['metrics']['r2']
        if r2 > 0.5: score += 1
        
        # Generate recommendation
        if score >= 6:
            recommendation = "STRONG BUY"
            confidence = "High"
        elif score >= 4:
            recommendation = "BUY"
            confidence = "Medium"
        elif score >= 2:
            recommendation = "HOLD"
            confidence = "Medium"
        else:
            recommendation = "SELL"
            confidence = "Low"
        
        # Risk level based on volatility
        volatility = technical['volatility'].iloc[-1]
        if volatility > 40:
            risk = "High"
        elif volatility > 25:
            risk = "Medium"
        else:
            risk = "Low"
        
        return {
            "recommendation": recommendation,
            "confidence": confidence,
            "risk": risk
        }
    
    def compare_models(self, df: pd.DataFrame, symbol: str) -> Dict:
        """Compare multiple ML models"""
        X, y = self.prepare_features(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Models to compare
        models_to_test = {
            "Linear Regression": LinearRegression(),
            "Ridge Regression": Ridge(alpha=1.0),
            "Lasso Regression": Lasso(alpha=1.0),
            "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
            "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
        }
        
        results = []
        best_model = {"name": "", "r2": -float('inf')}
        
        for name, model in models_to_test.items():
            # Train
            model.fit(X_train_scaled, y_train)
            
            # Predict
            y_pred = model.predict(X_test_scaled)
            
            # Metrics
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
            
            results.append({
                "name": name,
                "rmse": float(rmse),
                "mae": float(mae),
                "r2": float(r2),
                "mape": float(mape)
            })
            
            # Track best model
            if r2 > best_model["r2"]:
                best_model = {"name": name, "r2": r2}
        
        return {
            "models": results,
            "best_model": best_model["name"]
        }

