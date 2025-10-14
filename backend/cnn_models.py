"""
CNN-based Stock Price Prediction Models
Uses 1D CNN for time series prediction and pattern recognition
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import warnings

warnings.filterwarnings('ignore')

# Try to import TensorFlow/Keras
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, models
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available. Install with: pip install tensorflow")


class CNNStockPredictor:
    """CNN-based stock price prediction"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.history = {}
    
    def prepare_cnn_features(self, df: pd.DataFrame, lookback: int = 60) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare features for CNN (1D convolution on time series)
        
        Args:
            df: Stock data DataFrame
            lookback: Number of past days to use as features
        
        Returns:
            X: Features (sequences)
            y: Targets (next day price)
        """
        # Calculate technical indicators
        df_features = df.copy()
        
        # Price-based features
        df_features['returns'] = df['Close'].pct_change()
        df_features['log_returns'] = np.log(df['Close'] / df['Close'].shift(1))
        
        # Moving averages
        for period in [5, 10, 20, 50]:
            if len(df) >= period:
                df_features[f'ma{period}'] = df['Close'].rolling(window=period).mean()
                df_features[f'ma{period}_ratio'] = df['Close'] / df_features[f'ma{period}']
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df_features['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        exp1 = df['Close'].ewm(span=12, adjust=False).mean()
        exp2 = df['Close'].ewm(span=26, adjust=False).mean()
        df_features['macd'] = exp1 - exp2
        df_features['macd_signal'] = df_features['macd'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands
        bb_ma = df['Close'].rolling(window=20).mean()
        bb_std = df['Close'].rolling(window=20).std()
        df_features['bb_upper'] = bb_ma + (bb_std * 2)
        df_features['bb_lower'] = bb_ma - (bb_std * 2)
        df_features['bb_position'] = (df['Close'] - df_features['bb_lower']) / (df_features['bb_upper'] - df_features['bb_lower'])
        
        # Volatility
        df_features['volatility'] = df['Close'].pct_change().rolling(window=20).std()
        
        # Volume features
        df_features['volume_ma'] = df['Volume'].rolling(window=20).mean()
        df_features['volume_ratio'] = df['Volume'] / df_features['volume_ma']
        
        # Drop NaN values
        df_features = df_features.dropna()
        
        # Select features for CNN
        feature_columns = [
            'Close', 'returns', 'log_returns',
            'ma5', 'ma10', 'ma20', 'ma50',
            'ma5_ratio', 'ma10_ratio', 'ma20_ratio',
            'rsi', 'macd', 'macd_signal',
            'bb_position', 'volatility',
            'volume_ratio'
        ]
        
        # Filter available columns
        feature_columns = [col for col in feature_columns if col in df_features.columns]
        
        # Create sequences
        X_sequences = []
        y_targets = []
        
        data = df_features[feature_columns].values
        
        for i in range(lookback, len(data) - 1):
            X_sequences.append(data[i - lookback:i])
            y_targets.append(df_features['Close'].iloc[i + 1])
        
        return np.array(X_sequences), np.array(y_targets)
    
    def build_cnn_model(self, input_shape: Tuple[int, int]) -> keras.Model:
        """
        Build 1D CNN model for stock prediction
        
        Architecture:
        - 1D Convolution layers to detect patterns
        - MaxPooling to reduce dimensionality
        - Dropout for regularization
        - Dense layers for final prediction
        """
        model = models.Sequential([
            # First conv block
            layers.Conv1D(filters=64, kernel_size=3, activation='relu', 
                         input_shape=input_shape, padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling1D(pool_size=2),
            layers.Dropout(0.2),
            
            # Second conv block
            layers.Conv1D(filters=128, kernel_size=3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling1D(pool_size=2),
            layers.Dropout(0.3),
            
            # Third conv block
            layers.Conv1D(filters=64, kernel_size=3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Flatten and dense layers
            layers.Flatten(),
            layers.Dense(100, activation='relu'),
            layers.Dropout(0.4),
            layers.Dense(50, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(1)  # Output: predicted price
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train_cnn_model(self, df: pd.DataFrame, symbol: str, timeframe: str = '1M', 
                       epochs: int = 50, batch_size: int = 32) -> Dict:
        """
        Train CNN model for stock prediction
        
        Args:
            df: Stock data
            symbol: Stock symbol
            timeframe: Prediction timeframe
            epochs: Training epochs
            batch_size: Batch size
        """
        if not TENSORFLOW_AVAILABLE:
            return {
                'error': 'TensorFlow not installed. Install with: pip install tensorflow',
                'metrics': {'rmse': 0, 'mae': 0, 'r2': 0, 'mape': 0}
            }
        
        # Adjust lookback based on timeframe
        lookback_map = {
            '1M': 60,
            '6M': 90,
            '1Y': 120,
            '5Y': 180
        }
        lookback = lookback_map.get(timeframe, 60)
        
        # Prepare features
        X, y = self.prepare_cnn_features(df, lookback)
        
        if len(X) < 100:
            return {
                'error': f'Insufficient data for CNN training. Need at least 100 samples, got {len(X)}',
                'metrics': {'rmse': 0, 'mae': 0, 'r2': 0, 'mape': 0}
            }
        
        # Split data (80-20)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Scale targets
        scaler = MinMaxScaler()
        y_train_scaled = scaler.fit_transform(y_train.reshape(-1, 1)).flatten()
        y_test_scaled = scaler.transform(y_test.reshape(-1, 1)).flatten()
        
        # Build model
        input_shape = (X_train.shape[1], X_train.shape[2])
        model = self.build_cnn_model(input_shape)
        
        # Early stopping
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train model
        print(f"Training CNN for {symbol} ({timeframe})...")
        history = model.fit(
            X_train, y_train_scaled,
            validation_split=0.2,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stop],
            verbose=0
        )
        
        # Predictions
        y_pred_scaled = model.predict(X_test, verbose=0)
        y_pred = scaler.inverse_transform(y_pred_scaled).flatten()
        
        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        # Store model
        model_key = f"{symbol}_{timeframe}_cnn"
        self.models[model_key] = model
        self.scalers[model_key] = scaler
        self.history[model_key] = history.history
        
        # Confidence intervals
        std_dev = np.std(y_test - y_pred)
        upper_bound = y_pred + (2 * std_dev)
        lower_bound = y_pred - (2 * std_dev)
        
        # Get dates for test set
        test_dates = df.index[-len(y_test):]
        
        return {
            'predictions': y_pred.tolist(),
            'actuals': y_test.tolist(),
            'prediction_dates': [d.strftime('%Y-%m-%d') for d in test_dates],
            'upper_bound': upper_bound.tolist(),
            'lower_bound': lower_bound.tolist(),
            'metrics': {
                'rmse': float(rmse),
                'mae': float(mae),
                'r2': float(r2),
                'mape': float(mape)
            },
            'training_history': {
                'loss': [float(x) for x in history.history.get('loss', [])[-10:]],  # Last 10 epochs
                'val_loss': [float(x) for x in history.history.get('val_loss', [])[-10:]]
            }
        }
    
    def predict_future_cnn(self, df: pd.DataFrame, symbol: str, timeframe: str = '1M', days: int = 30) -> List[Dict]:
        """
        Predict future prices using trained CNN
        
        Args:
            df: Historical stock data
            symbol: Stock symbol
            timeframe: Prediction timeframe
            days: Number of days to predict
        """
        if not TENSORFLOW_AVAILABLE:
            return []
        
        model_key = f"{symbol}_{timeframe}_cnn"
        
        # Train model if not already trained
        if model_key not in self.models:
            result = self.train_cnn_model(df, symbol, timeframe)
            if 'error' in result:
                return []
        
        model = self.models[model_key]
        scaler = self.scalers[model_key]
        
        # Prepare features
        lookback_map = {
            '1M': 60,
            '6M': 90,
            '1Y': 120,
            '5Y': 180
        }
        lookback = lookback_map.get(timeframe, 60)
        
        X, y = self.prepare_cnn_features(df, lookback)
        
        if len(X) == 0:
            return []
        
        # Get last sequence
        last_sequence = X[-1:].copy()
        current_price = df['Close'].iloc[-1]
        
        # Generate predictions
        predictions = []
        last_date = df.index[-1]
        
        for i in range(days):
            # Predict next price
            pred_scaled = model.predict(last_sequence, verbose=0)
            predicted_price = scaler.inverse_transform(pred_scaled)[0][0]
            
            prediction_date = last_date + timedelta(days=i+1)
            
            # Calculate confidence (decreases over time)
            confidence = max(50, 100 - (i / days * 50))
            
            # Calculate uncertainty (increases over time)
            daily_vol = df['Close'].pct_change().std()
            time_factor = np.sqrt((i + 1) / 30)
            std_dev = daily_vol * current_price * time_factor
            
            predictions.append({
                'date': prediction_date.strftime('%Y-%m-%d'),
                'daysAhead': i + 1,
                'predicted': float(predicted_price),
                'upperBound': float(predicted_price + 2 * std_dev),
                'lowerBound': float(predicted_price - 2 * std_dev),
                'confidence': float(confidence)
            })
            
            # Update sequence for next prediction (simplified)
            # In production, you'd properly update all technical indicators
        
        return predictions

