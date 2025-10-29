"""
Advanced ML Models with Multi-Timeframe Predictions
Supports 1M, 6M, 1Y, 5Y predictions
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import warnings

warnings.filterwarnings('ignore')


class MultiTimeframePredictor:
    """ML models for multiple prediction timeframes"""
    
    TIMEFRAME_DAYS = {
        '1M': 30,
        '6M': 180,
        '1Y': 365,
        '5Y': 1825
    }
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
    
    def prepare_features(self, df: pd.DataFrame, timeframe: str = '1M') -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare features based on timeframe
        
        Args:
            df: Stock data DataFrame
            timeframe: '1M', '6M', '1Y', or '5Y'
        """
        features_df = df.copy()
        
        # Adjust feature windows based on timeframe
        if timeframe == '5Y':
            ma_periods = [20, 50, 100, 200]
            momentum_period = 20
            vol_window = 60
        elif timeframe == '1Y':
            ma_periods = [10, 20, 50, 100]
            momentum_period = 15
            vol_window = 30
        elif timeframe == '6M':
            ma_periods = [5, 10, 20, 50]
            momentum_period = 10
            vol_window = 20
        else:  # 1M
            ma_periods = [3, 5, 10, 20]
            momentum_period = 5
            vol_window = 10
        
        # Moving averages
        for period in ma_periods:
            if len(df) >= period:
                features_df[f'ma{period}'] = df['Close'].rolling(window=period).mean()
        
        # RSI (Relative Strength Index)
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        features_df['rsi'] = 100 - (100 / (1 + rs))
        
        # Momentum and ROC
        features_df['momentum'] = df['Close'].diff(momentum_period)
        features_df['roc'] = df['Close'].pct_change(periods=momentum_period) * 100
        
        # Volatility
        features_df['volatility'] = df['Close'].pct_change().rolling(window=vol_window).std()
        
        # Volume features
        features_df['volume_ma'] = df['Volume'].rolling(window=20).mean()
        features_df['volume_ratio'] = df['Volume'] / features_df['volume_ma']
        
        # MACD
        exp1 = df['Close'].ewm(span=12, adjust=False).mean()
        exp2 = df['Close'].ewm(span=26, adjust=False).mean()
        features_df['macd'] = exp1 - exp2
        features_df['macd_signal'] = features_df['macd'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands
        bb_window = 20
        features_df['bb_middle'] = df['Close'].rolling(window=bb_window).mean()
        bb_std = df['Close'].rolling(window=bb_window).std()
        features_df['bb_upper'] = features_df['bb_middle'] + (bb_std * 2)
        features_df['bb_lower'] = features_df['bb_middle'] - (bb_std * 2)
        features_df['bb_position'] = (df['Close'] - features_df['bb_lower']) / (features_df['bb_upper'] - features_df['bb_lower'])
        
        # Price ratios
        features_df['high_low_ratio'] = df['High'] / df['Low']
        features_df['close_open_ratio'] = df['Close'] / df['Open']
        
        # Lagged features (adjusted for timeframe)
        lag_days = min(10, max(3, len(df) // 100))
        for i in range(1, lag_days + 1):
            features_df[f'close_lag_{i}'] = df['Close'].shift(i)
            features_df[f'return_lag_{i}'] = df['Close'].pct_change().shift(i)
        
        # Target: future price (varies by timeframe)
        target_shift = self.TIMEFRAME_DAYS.get(timeframe, 30) // 30  # Approximate monthly intervals
        features_df['target'] = df['Close'].shift(-target_shift)
        
        # Drop NaN
        features_df = features_df.dropna()
        
        # Separate features and target
        feature_cols = [col for col in features_df.columns 
                       if col not in ['target', 'Open', 'High', 'Low', 'Close', 'Volume']]
        
        X = features_df[feature_cols]
        y = features_df['target']
        
        return X, y
    
    def train_model(self, df: pd.DataFrame, symbol: str, timeframe: str = '1M') -> Dict:
        """
        Train model for specific timeframe
        
        Args:
            df: Stock data
            symbol: Stock symbol
            timeframe: '1M', '6M', '1Y', or '5Y'
        """
        X, y = self.prepare_features(df, timeframe)
        
        min_samples = {
            '1M': 30,
            '6M': 60,
            '1Y': 100,
            '5Y': 200
        }
        
        if len(X) < min_samples.get(timeframe, 50):
            return {
                'error': f'Insufficient data for {timeframe} training. Need at least {min_samples.get(timeframe, 50)} samples, got {len(X)}',
                'metrics': {'rmse': 0, 'mae': 0, 'r2': 0, 'mape': 0}
            }
        
        # Split data
        split_ratio = 0.8
        split_idx = int(len(X) * split_ratio)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Choose model based on timeframe
        if timeframe in ['5Y', '1Y']:
            # For long-term: Use Gradient Boosting (better for trends)
            model = GradientBoostingRegressor(
                n_estimators=150,
                max_depth=8,
                learning_rate=0.05,
                random_state=42
            )
        else:
            # For short-term: Use Random Forest (better for volatility)
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )
        
        # Train
        model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = model.predict(X_test_scaled)
        
        # Metrics
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        # Store model
        model_key = f"{symbol}_{timeframe}"
        self.models[model_key] = model
        self.scalers[model_key] = scaler
        
        # Feature importance
        if hasattr(model, 'feature_importances_'):
            feature_importance = list(zip(X.columns, model.feature_importances_))
            feature_importance.sort(key=lambda x: x[1], reverse=True)
            self.feature_importance[model_key] = feature_importance
        
        # Confidence intervals
        std_dev = np.std(y_test - y_pred)
        upper_bound = y_pred + (2 * std_dev)
        lower_bound = y_pred - (2 * std_dev)
        
        # Get dates for test set
        test_dates = df.index[split_idx:split_idx + len(y_test)]
        
        return {
            'predictions': y_pred.tolist(),
            'actuals': y_test.values.tolist(),
            'prediction_dates': [d.strftime('%Y-%m-%d') for d in test_dates],
            'upper_bound': upper_bound.tolist(),
            'lower_bound': lower_bound.tolist(),
            'metrics': {
                'rmse': float(rmse),
                'mae': float(mae),
                'r2': float(r2),
                'mape': float(mape)
            },
            'feature_columns': X.columns.tolist()
        }
    
    def predict_future(self, df: pd.DataFrame, symbol: str, timeframe: str = '1M') -> List[Dict]:
        """
        Predict future prices for given timeframe
        
        Args:
            df: Historical stock data
            symbol: Stock symbol
            timeframe: '1M', '6M', '1Y', or '5Y'
        """
        model_key = f"{symbol}_{timeframe}"
        
        # Train model if not already trained
        if model_key not in self.models:
            self.train_model(df, symbol, timeframe)
        
        if model_key not in self.models:
            return []
        
        model = self.models[model_key]
        scaler = self.scalers[model_key]
        
        # Prepare features
        X, y = self.prepare_features(df, timeframe)
        
        if len(X) == 0:
            return []
        
        # Get last features
        last_features = X.iloc[-1:].values
        last_features_scaled = scaler.transform(last_features)
        
        # Number of prediction points
        total_days = self.TIMEFRAME_DAYS[timeframe]
        prediction_points = self.get_prediction_points(timeframe)
        days_per_point = total_days // prediction_points
        
        # Generate predictions
        predictions = []
        last_date = df.index[-1]
        current_price = df['Close'].iloc[-1]
        
        # Calculate daily volatility for confidence intervals
        daily_vol = df['Close'].pct_change().std()
        
        for i in range(prediction_points):
            days_ahead = (i + 1) * days_per_point
            prediction_date = last_date + timedelta(days=days_ahead)
            
            # Predict price (simplified - using last features)
            predicted_price = model.predict(last_features_scaled)[0]
            
            # Add trend component for longer timeframes
            if timeframe in ['1Y', '5Y']:
                # Calculate trend from historical data
                trend_days = min(90, len(df) // 2)
                recent_trend = (df['Close'].iloc[-1] - df['Close'].iloc[-trend_days]) / trend_days
                predicted_price += recent_trend * days_ahead
            
            # Confidence intervals (widen over time)
            time_factor = np.sqrt(days_ahead / 30)  # Increase uncertainty with time
            std_dev = daily_vol * current_price * time_factor
            
            predictions.append({
                'date': prediction_date.strftime('%Y-%m-%d'),
                'daysAhead': days_ahead,
                'predicted': float(predicted_price),
                'upperBound': float(predicted_price + 2 * std_dev),
                'lowerBound': float(predicted_price - 2 * std_dev),
                'confidence': float(max(0, 100 - (days_ahead / total_days * 50)))  # Decrease confidence over time
            })
        
        return predictions
    
    @staticmethod
    def get_prediction_points(timeframe: str) -> int:
        """Get number of prediction points for timeframe"""
        points = {
            '1M': 30,    # Daily predictions
            '6M': 26,    # Weekly predictions (~26 weeks)
            '1Y': 52,    # Weekly predictions (~52 weeks)
            '5Y': 60     # Monthly predictions (60 months)
        }
        return points.get(timeframe, 30)
    
    def get_price_targets(self, current_price: float, timeframe: str, trend: str) -> Dict:
        """
        Calculate price targets based on timeframe
        
        Args:
            current_price: Current stock price
            timeframe: '1M', '6M', '1Y', '5Y'
            trend: 'Bullish' or 'Bearish'
        """
        # Target percentages based on timeframe
        targets = {
            '1M': (0.05, 0.10, 0.15),      # 5%, 10%, 15%
            '6M': (0.15, 0.25, 0.40),      # 15%, 25%, 40%
            '1Y': (0.25, 0.50, 0.75),      # 25%, 50%, 75%
            '5Y': (0.50, 1.00, 2.00)       # 50%, 100%, 200%
        }
        
        conservative, moderate, aggressive = targets.get(timeframe, (0.10, 0.20, 0.30))
        
        # Adjust for bearish trend
        if trend == 'Bearish':
            conservative *= 0.5
            moderate *= 0.5
            aggressive *= 0.5
        
        return {
            'conservative': current_price * (1 + conservative),
            'moderate': current_price * (1 + moderate),
            'aggressive': current_price * (1 + aggressive),
            'conservative_pct': conservative * 100,
            'moderate_pct': moderate * 100,
            'aggressive_pct': aggressive * 100
        }
    
    def analyze_trend(self, df: pd.DataFrame, timeframe: str) -> str:
        """Determine if trend is bullish or bearish"""
        if timeframe == '5Y':
            period = min(200, len(df) // 2)
        elif timeframe == '1Y':
            period = min(100, len(df) // 2)
        elif timeframe == '6M':
            period = min(50, len(df) // 2)
        else:  # 1M
            period = min(20, len(df) // 2)
        
        if len(df) < period:
            return 'Neutral'
        
        recent_avg = df['Close'].iloc[-period // 2:].mean()
        older_avg = df['Close'].iloc[-period:-period // 2].mean()
        
        return 'Bullish' if recent_avg > older_avg else 'Bearish'

