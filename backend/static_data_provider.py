"""
Static Data Provider for Stock Market Application
Provides realistic static data instead of live API calls
"""

import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import random
import os


class StaticDataProvider:
    """Provides static stock data for development and testing"""
    
    def __init__(self):
        self.data_file = os.path.join(os.path.dirname(__file__), 'static_stock_data.json')
        self.static_data = self._load_static_data()
    
    def _load_static_data(self) -> Dict:
        """Load static data from JSON file"""
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Static data file not found: {self.data_file}")
            return {}
        except json.JSONDecodeError as e:
            print(f"Error parsing static data: {e}")
            return {}
    
    def get_stock_list(self) -> List[Dict]:
        """Get list of available stocks"""
        stocks = []
        for symbol, data in self.static_data.get('stocks', {}).items():
            stocks.append({
                'symbol': symbol,
                'name': data['name'],
                'sector': data['sector'],
                'current_price': data['current_price'],
                'change': data['change'],
                'change_percent': data['change_percent'],
                'volume': data['volume']
            })
        return stocks
    
    def get_stock_info(self, symbol: str) -> Optional[Dict]:
        """Get detailed stock information"""
        if symbol not in self.static_data.get('stocks', {}):
            return None
        
        stock_data = self.static_data['stocks'][symbol]
        return {
            'symbol': symbol,
            'name': stock_data['name'],
            'sector': stock_data['sector'],
            'current_price': stock_data['current_price'],
            'previous_close': stock_data['previous_close'],
            'change': stock_data['change'],
            'change_percent': stock_data['change_percent'],
            'volume': stock_data['volume'],
            'market_cap': stock_data['market_cap'],
            'pe_ratio': stock_data['pe_ratio'],
            '52_week_high': stock_data['52_week_high'],
            '52_week_low': stock_data['52_week_low']
        }
    
    def get_stock_data(self, symbol: str, period: str = '1y') -> Optional[pd.DataFrame]:
        """
        Get historical stock data as DataFrame
        
        Args:
            symbol: Stock symbol
            period: Time period ('1mo', '6mo', '1y', '5y')
        
        Returns:
            DataFrame with OHLCV data
        """
        if symbol not in self.static_data.get('stocks', {}):
            return None
        
        stock_data = self.static_data['stocks'][symbol]
        historical_data = stock_data.get('data', {})
        
        if not historical_data:
            return None
        
        # Convert to DataFrame
        df_data = []
        for date_str, data in historical_data.items():
            df_data.append({
                'Date': pd.to_datetime(date_str),
                'Open': data['open'],
                'High': data['high'],
                'Low': data['low'],
                'Close': data['close'],
                'Volume': data['volume']
            })
        
        df = pd.DataFrame(df_data)
        df.set_index('Date', inplace=True)
        df.sort_index(inplace=True)
        
        # Generate more data points based on period
        if period in ['1y', '5y']:
            df = self._generate_extended_data(df, period)
        
        return df
    
    def _generate_extended_data(self, df: pd.DataFrame, period: str) -> pd.DataFrame:
        """Generate extended historical data for longer periods"""
        if df.empty:
            return df
        
        # Get the last price and date
        last_date = df.index[-1]
        last_price = df['Close'].iloc[-1]
        
        # Generate additional data points
        additional_data = []
        current_date = last_date
        current_price = last_price
        
        # Generate data for the specified period
        days_to_generate = 365 if period == '1y' else 1825  # 5 years
        
        for i in range(days_to_generate):
            current_date += timedelta(days=1)
            
            # Simulate price movement with some randomness
            price_change = random.uniform(-0.05, 0.05)  # ±5% daily change
            new_price = current_price * (1 + price_change)
            
            # Generate OHLC data
            open_price = current_price
            close_price = new_price
            high_price = max(open_price, close_price) * random.uniform(1.0, 1.02)
            low_price = min(open_price, close_price) * random.uniform(0.98, 1.0)
            volume = random.randint(500000, 2000000)
            
            additional_data.append({
                'Date': current_date,
                'Open': round(open_price, 2),
                'High': round(high_price, 2),
                'Low': round(low_price, 2),
                'Close': round(close_price, 2),
                'Volume': volume
            })
            
            current_price = close_price
        
        # Combine with existing data
        extended_df = pd.DataFrame(additional_data)
        extended_df.set_index('Date', inplace=True)
        
        return pd.concat([df, extended_df]).sort_index()
    
    def get_market_overview(self) -> Dict:
        """Get market overview data"""
        indices = self.static_data.get('indices', {})
        sentiment = self.static_data.get('market_sentiment', {})
        
        return {
            'indices': indices,
            'sentiment': sentiment,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_sector_performance(self) -> List[Dict]:
        """Get sector-wise performance data"""
        sectors = {}
        
        # Group stocks by sector
        for symbol, data in self.static_data.get('stocks', {}).items():
            sector = data['sector']
            if sector not in sectors:
                sectors[sector] = {
                    'sector': sector,
                    'stocks': [],
                    'total_change': 0,
                    'avg_change': 0
                }
            
            sectors[sector]['stocks'].append(symbol)
            sectors[sector]['total_change'] += data['change_percent']
        
        # Calculate average change per sector
        sector_performance = []
        for sector, data in sectors.items():
            avg_change = data['total_change'] / len(data['stocks'])
            sector_performance.append({
                'sector': sector,
                'stock_count': len(data['stocks']),
                'avg_change': round(avg_change, 2),
                'performance': 'Bullish' if avg_change > 0 else 'Bearish'
            })
        
        return sorted(sector_performance, key=lambda x: x['avg_change'], reverse=True)
    
    def get_top_gainers(self, limit: int = 10) -> List[Dict]:
        """Get top gaining stocks"""
        stocks = []
        for symbol, data in self.static_data.get('stocks', {}).items():
            if data['change_percent'] > 0:
                stocks.append({
                    'symbol': symbol,
                    'name': data['name'],
                    'current_price': data['current_price'],
                    'change': data['change'],
                    'change_percent': data['change_percent']
                })
        
        return sorted(stocks, key=lambda x: x['change_percent'], reverse=True)[:limit]
    
    def get_top_losers(self, limit: int = 10) -> List[Dict]:
        """Get top losing stocks"""
        stocks = []
        for symbol, data in self.static_data.get('stocks', {}).items():
            if data['change_percent'] < 0:
                stocks.append({
                    'symbol': symbol,
                    'name': data['name'],
                    'current_price': data['current_price'],
                    'change': data['change'],
                    'change_percent': data['change_percent']
                })
        
        return sorted(stocks, key=lambda x: x['change_percent'])[:limit]
    
    def get_market_heatmap_data(self) -> List[Dict]:
        """Get data for market heatmap visualization"""
        heatmap_data = []
        
        for symbol, data in self.static_data.get('stocks', {}).items():
            heatmap_data.append({
                'symbol': symbol,
                'name': data['name'],
                'sector': data['sector'],
                'current_price': data['current_price'],
                'change_percent': data['change_percent'],
                'volume': data['volume'],
                'market_cap': data['market_cap']
            })
        
        return heatmap_data
    
    def is_available(self) -> bool:
        """Check if static data is available"""
        return bool(self.static_data and self.static_data.get('stocks'))
    
    def get_available_symbols(self) -> List[str]:
        """Get list of available stock symbols"""
        return list(self.static_data.get('stocks', {}).keys())


# Global instance
static_provider = StaticDataProvider()
