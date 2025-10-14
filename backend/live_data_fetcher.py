"""
Live Data Fetcher for Indian Stock Market
Fetches real-time data from Yahoo Finance and NSE
"""

import yfinance as yf
import pandas as pd
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional
import json


class LiveDataFetcher:
    """Fetch real-time stock data"""
    
    # Indian stock symbols mapping (NSE to Yahoo Finance)
    INDIAN_STOCKS = {
        'RELIANCE': 'RELIANCE.NS',
        'TCS': 'TCS.NS',
        'HDFCBANK': 'HDFCBANK.NS',
        'INFY': 'INFY.NS',
        'ICICIBANK': 'ICICIBANK.NS',
        'HINDUNILVR': 'HINDUNILVR.NS',
        'ITC': 'ITC.NS',
        'SBIN': 'SBIN.NS',
        'BHARTIARTL': 'BHARTIARTL.NS',
        'KOTAKBANK': 'KOTAKBANK.NS',
        'BAJFINANCE': 'BAJFINANCE.NS',
        'ASIANPAINT': 'ASIANPAINT.NS',
        'MARUTI': 'MARUTI.NS',
        'LT': 'LT.NS',
        'TITAN': 'TITAN.NS',
        'SUNPHARMA': 'SUNPHARMA.NS',
        'WIPRO': 'WIPRO.NS',
        'NTPC': 'NTPC.NS',
        'POWERGRID': 'POWERGRID.NS',
        'TATASTEEL': 'TATASTEEL.NS',
        'AXISBANK': 'AXISBANK.NS',
        'HCLTECH': 'HCLTECH.NS',
        'ULTRACEMCO': 'ULTRACEMCO.NS',
        'ADANIENT': 'ADANIENT.NS',
        'JSWSTEEL': 'JSWSTEEL.NS',
        'DIVISLAB': 'DIVISLAB.NS',
        'BPCL': 'BPCL.NS',
        'COALINDIA': 'COALINDIA.NS',
        'LTIM': 'LTIM.NS',
        'GRASIM': 'GRASIM.NS',
    }
    
    @staticmethod
    def get_yahoo_symbol(symbol: str) -> str:
        """Convert NSE symbol to Yahoo Finance symbol"""
        if symbol in LiveDataFetcher.INDIAN_STOCKS:
            return LiveDataFetcher.INDIAN_STOCKS[symbol]
        # Default: add .NS suffix for NSE stocks
        return f"{symbol}.NS"
    
    @staticmethod
    def fetch_live_data(symbol: str, period: str = '1y') -> Optional[pd.DataFrame]:
        """
        Fetch live stock data from Yahoo Finance
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE')
            period: Time period ('1mo', '6mo', '1y', '5y')
        
        Returns:
            DataFrame with OHLCV data
        """
        try:
            yahoo_symbol = LiveDataFetcher.get_yahoo_symbol(symbol)
            
            # Fetch data
            stock = yf.Ticker(yahoo_symbol)
            df = stock.history(period=period)
            
            if df.empty:
                print(f"No data found for {symbol}")
                return None
            
            # Rename columns to match our format
            df = df.rename(columns={
                'Open': 'Open',
                'High': 'High',
                'Low': 'Low',
                'Close': 'Close',
                'Volume': 'Volume'
            })
            
            # Keep only necessary columns
            df = df[['Open', 'High', 'Low', 'Close', 'Volume']]
            
            return df
            
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return None
    
    @staticmethod
    def get_stock_info(symbol: str) -> Dict:
        """
        Get current stock information
        
        Args:
            symbol: Stock symbol
        
        Returns:
            Dictionary with stock info
        """
        try:
            yahoo_symbol = LiveDataFetcher.get_yahoo_symbol(symbol)
            stock = yf.Ticker(yahoo_symbol)
            info = stock.info
            
            return {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'currentPrice': info.get('currentPrice', 0) or info.get('regularMarketPrice', 0),
                'previousClose': info.get('previousClose', 0),
                'open': info.get('open', 0) or info.get('regularMarketOpen', 0),
                'dayHigh': info.get('dayHigh', 0),
                'dayLow': info.get('dayLow', 0),
                'volume': info.get('volume', 0),
                'marketCap': info.get('marketCap', 0) / 10000000 if info.get('marketCap') else None,  # Convert to Crores
                'peRatio': info.get('trailingPE', 0) or info.get('forwardPE', 0),
                'pbRatio': info.get('priceToBook', 0),
                'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                '52WeekHigh': info.get('fiftyTwoWeekHigh', 0),
                '52WeekLow': info.get('fiftyTwoWeekLow', 0),
            }
            
        except Exception as e:
            print(f"Error getting info for {symbol}: {e}")
            return {}
    
    @staticmethod
    def get_popular_indian_stocks() -> list:
        """Get list of popular Indian stocks"""
        return [
            {'symbol': 'RELIANCE', 'name': 'Reliance Industries'},
            {'symbol': 'TCS', 'name': 'Tata Consultancy Services'},
            {'symbol': 'HDFCBANK', 'name': 'HDFC Bank'},
            {'symbol': 'INFY', 'name': 'Infosys'},
            {'symbol': 'ICICIBANK', 'name': 'ICICI Bank'},
            {'symbol': 'HINDUNILVR', 'name': 'Hindustan Unilever'},
            {'symbol': 'ITC', 'name': 'ITC Limited'},
            {'symbol': 'SBIN', 'name': 'State Bank of India'},
            {'symbol': 'BHARTIARTL', 'name': 'Bharti Airtel'},
            {'symbol': 'KOTAKBANK', 'name': 'Kotak Mahindra Bank'},
            {'symbol': 'BAJFINANCE', 'name': 'Bajaj Finance'},
            {'symbol': 'ASIANPAINT', 'name': 'Asian Paints'},
            {'symbol': 'MARUTI', 'name': 'Maruti Suzuki'},
            {'symbol': 'LT', 'name': 'Larsen & Toubro'},
            {'symbol': 'TITAN', 'name': 'Titan Company'},
        ]

