"""
Data Processing Module for Stock Market Analysis
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class DataProcessor:
    """Process and prepare stock market data"""
    
    def __init__(self, data_folder: str = '../data'):
        self.data_folder = Path(data_folder)
        self.stocks_cache = {}
    
    def load_stocks(self, category: str = 'Nifty50', limit: Optional[int] = None) -> Dict:
        """Load stock data from JSON files"""
        folder_path = self.data_folder / category
        
        if not folder_path.exists():
            return {}
        
        json_files = list(folder_path.glob('*.json'))
        
        if limit:
            json_files = json_files[:limit]
        
        stocks = {}
        for json_file in json_files:
            stock_symbol = json_file.stem
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                    stocks[stock_symbol] = data
                    self.stocks_cache[stock_symbol] = data
            except Exception as e:
                print(f"Error loading {stock_symbol}: {e}")
        
        return stocks
    
    def get_stock_data(self, symbol: str) -> Optional[List]:
        """Get data for a specific stock"""
        if symbol in self.stocks_cache:
            return self.stocks_cache[symbol]
        
        # Try to load from different categories
        categories = ['Nifty50', 'Midcap-select', 'Automotive', 'Nifty-Midcap-100']
        
        for category in categories:
            file_path = self.data_folder / category / f"{symbol}.json"
            if file_path.exists():
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        self.stocks_cache[symbol] = data
                        return data
                except Exception as e:
                    print(f"Error loading {symbol}: {e}")
        
        return None
    
    def process_stock_data(self, symbol: str, stock_data: List) -> pd.DataFrame:
        """Process raw stock data into DataFrame"""
        if not stock_data:
            return pd.DataFrame()
        
        latest_data = stock_data[-1]
        
        # Extract 1-year price data
        price_data_1y = latest_data.get('price_graph_1Y', [])
        
        if not price_data_1y:
            return pd.DataFrame()
        
        # Create DataFrame
        df = pd.DataFrame({'Close': price_data_1y})
        
        # Create date index
        df['Date'] = pd.date_range(
            end=datetime.now(),
            periods=len(price_data_1y),
            freq='D'
        )
        df.set_index('Date', inplace=True)
        
        # Generate OHLC data (simplified - using close prices)
        df['Open'] = df['Close'].shift(1).fillna(df['Close'])
        df['High'] = df['Close'] * (1 + np.random.uniform(0, 0.015, len(df)))
        df['Low'] = df['Close'] * (1 - np.random.uniform(0, 0.015, len(df)))
        
        # Add actual OHLC for latest day if available
        if 'open' in latest_data:
            df.iloc[-1, df.columns.get_loc('Open')] = latest_data.get('open', df.iloc[-1]['Close'])
        if 'high' in latest_data:
            df.iloc[-1, df.columns.get_loc('High')] = latest_data.get('high', df.iloc[-1]['Close'])
        if 'low' in latest_data:
            df.iloc[-1, df.columns.get_loc('Low')] = latest_data.get('low', df.iloc[-1]['Close'])
        
        # Add volume
        df['Volume'] = np.random.randint(1000000, 10000000, len(df))
        
        return df
    
    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators"""
        tech_df = df.copy()
        
        # Moving averages
        tech_df['ma20'] = tech_df['Close'].rolling(window=20).mean()
        tech_df['ma50'] = tech_df['Close'].rolling(window=50).mean()
        tech_df['ma200'] = tech_df['Close'].rolling(window=200).mean()
        
        # RSI
        delta = tech_df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        tech_df['rsi'] = 100 - (100 / (1 + rs))
        
        # Momentum
        tech_df['momentum'] = tech_df['Close'].diff(10)
        
        # Volatility
        tech_df['volatility'] = tech_df['Close'].pct_change().rolling(window=20).std() * np.sqrt(252) * 100
        
        # MACD
        exp1 = tech_df['Close'].ewm(span=12, adjust=False).mean()
        exp2 = tech_df['Close'].ewm(span=26, adjust=False).mean()
        tech_df['macd'] = exp1 - exp2
        tech_df['signal'] = tech_df['macd'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands
        tech_df['bb_middle'] = tech_df['Close'].rolling(window=20).mean()
        bb_std = tech_df['Close'].rolling(window=20).std()
        tech_df['bb_upper'] = tech_df['bb_middle'] + (bb_std * 2)
        tech_df['bb_lower'] = tech_df['bb_middle'] - (bb_std * 2)
        
        # Rate of Change
        tech_df['roc'] = tech_df['Close'].pct_change(periods=10) * 100
        
        return tech_df

