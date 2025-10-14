"""
Multi-Source Data Fetcher for Indian Stocks
Fetches from Yahoo Finance, NSE India, and other sources with fallback
"""

import yfinance as yf
import pandas as pd
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import json
from bs4 import BeautifulSoup


class MultiSourceFetcher:
    """Fetch stock data from multiple sources with fallback"""
    
    # Comprehensive list of Indian stocks
    NIFTY_50 = {
        'RELIANCE': {'name': 'Reliance Industries', 'sector': 'Energy'},
        'TCS': {'name': 'Tata Consultancy Services', 'sector': 'IT'},
        'HDFCBANK': {'name': 'HDFC Bank', 'sector': 'Banking'},
        'INFY': {'name': 'Infosys', 'sector': 'IT'},
        'ICICIBANK': {'name': 'ICICI Bank', 'sector': 'Banking'},
        'HINDUNILVR': {'name': 'Hindustan Unilever', 'sector': 'FMCG'},
        'ITC': {'name': 'ITC Limited', 'sector': 'FMCG'},
        'SBIN': {'name': 'State Bank of India', 'sector': 'Banking'},
        'BHARTIARTL': {'name': 'Bharti Airtel', 'sector': 'Telecom'},
        'KOTAKBANK': {'name': 'Kotak Mahindra Bank', 'sector': 'Banking'},
        'BAJFINANCE': {'name': 'Bajaj Finance', 'sector': 'Finance'},
        'ASIANPAINT': {'name': 'Asian Paints', 'sector': 'Paint'},
        'MARUTI': {'name': 'Maruti Suzuki', 'sector': 'Auto'},
        'LT': {'name': 'Larsen & Toubro', 'sector': 'Infrastructure'},
        'TITAN': {'name': 'Titan Company', 'sector': 'Jewelry'},
        'SUNPHARMA': {'name': 'Sun Pharma', 'sector': 'Pharma'},
        'WIPRO': {'name': 'Wipro', 'sector': 'IT'},
        'NTPC': {'name': 'NTPC', 'sector': 'Power'},
        'POWERGRID': {'name': 'Power Grid', 'sector': 'Power'},
        'TATASTEEL': {'name': 'Tata Steel', 'sector': 'Metals'},
        'AXISBANK': {'name': 'Axis Bank', 'sector': 'Banking'},
        'HCLTECH': {'name': 'HCL Technologies', 'sector': 'IT'},
        'ULTRACEMCO': {'name': 'UltraTech Cement', 'sector': 'Cement'},
        'ADANIENT': {'name': 'Adani Enterprises', 'sector': 'Conglomerate'},
        'JSWSTEEL': {'name': 'JSW Steel', 'sector': 'Metals'},
        'DIVISLAB': {'name': "Dr. Reddy's Laboratories", 'sector': 'Pharma'},
        'BPCL': {'name': 'Bharat Petroleum', 'sector': 'Oil & Gas'},
        'COALINDIA': {'name': 'Coal India', 'sector': 'Mining'},
        'LTIM': {'name': 'LTIMindtree', 'sector': 'IT'},
        'GRASIM': {'name': 'Grasim Industries', 'sector': 'Cement'},
        'TATAMOTORS': {'name': 'Tata Motors', 'sector': 'Auto'},
        'TECHM': {'name': 'Tech Mahindra', 'sector': 'IT'},
        'ADANIPORTS': {'name': 'Adani Ports', 'sector': 'Infrastructure'},
        'ONGC': {'name': 'ONGC', 'sector': 'Oil & Gas'},
        'HINDALCO': {'name': 'Hindalco', 'sector': 'Metals'},
        'BRITANNIA': {'name': 'Britannia Industries', 'sector': 'FMCG'},
        'NESTLEIND': {'name': 'Nestle India', 'sector': 'FMCG'},
        'BAJAJFINSV': {'name': 'Bajaj Finserv', 'sector': 'Finance'},
        'HEROMOTOCO': {'name': 'Hero MotoCorp', 'sector': 'Auto'},
        'EICHERMOT': {'name': 'Eicher Motors', 'sector': 'Auto'},
    }
    
    @staticmethod
    def get_yahoo_symbol(symbol: str) -> str:
        """Convert to Yahoo Finance symbol"""
        return f"{symbol}.NS"
    
    @staticmethod
    def fetch_from_yahoo(symbol: str, period: str = '1y') -> Optional[pd.DataFrame]:
        """Fetch data from Yahoo Finance"""
        try:
            yahoo_symbol = MultiSourceFetcher.get_yahoo_symbol(symbol)
            stock = yf.Ticker(yahoo_symbol)
            df = stock.history(period=period)
            
            if df.empty:
                return None
            
            df = df[['Open', 'High', 'Low', 'Close', 'Volume']]
            return df
            
        except Exception as e:
            print(f"Yahoo Finance error for {symbol}: {e}")
            return None
    
    @staticmethod
    def fetch_stock_data(symbol: str, period: str = '1y') -> Optional[pd.DataFrame]:
        """
        Fetch stock data with multi-source fallback
        Priority: Yahoo Finance → (Add more sources)
        """
        # Try Yahoo Finance first
        df = MultiSourceFetcher.fetch_from_yahoo(symbol, period)
        
        if df is not None and not df.empty:
            return df
        
        # Add more sources here as fallback
        # e.g., NSE India API, Alpha Vantage, etc.
        
        return None
    
    @staticmethod
    def get_stock_info(symbol: str) -> Dict:
        """Get comprehensive stock information"""
        try:
            yahoo_symbol = MultiSourceFetcher.get_yahoo_symbol(symbol)
            stock = yf.Ticker(yahoo_symbol)
            info = stock.info
            
            stock_metadata = MultiSourceFetcher.NIFTY_50.get(symbol, {})
            
            current_price = info.get('currentPrice', 0) or info.get('regularMarketPrice', 0)
            prev_close = info.get('previousClose', 0)
            change = current_price - prev_close
            change_pct = (change / prev_close * 100) if prev_close else 0
            
            return {
                'symbol': symbol,
                'name': stock_metadata.get('name', info.get('longName', symbol)),
                'sector': stock_metadata.get('sector', 'Unknown'),
                'currentPrice': current_price,
                'previousClose': prev_close,
                'change': change,
                'changePercent': change_pct,
                'open': info.get('open', 0) or info.get('regularMarketOpen', 0),
                'dayHigh': info.get('dayHigh', 0),
                'dayLow': info.get('dayLow', 0),
                'volume': info.get('volume', 0),
                'avgVolume': info.get('averageVolume', 0),
                'marketCap': info.get('marketCap', 0) / 10000000 if info.get('marketCap') else 0,
                'peRatio': info.get('trailingPE', 0) or info.get('forwardPE', 0),
                'pbRatio': info.get('priceToBook', 0),
                'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'week52High': info.get('fiftyTwoWeekHigh', 0),
                'week52Low': info.get('fiftyTwoWeekLow', 0),
                'beta': info.get('beta', 1.0),
                'eps': info.get('trailingEps', 0),
                'bookValue': info.get('bookValue', 0),
            }
            
        except Exception as e:
            print(f"Error getting info for {symbol}: {e}")
            return {'symbol': symbol, 'name': symbol, 'sector': 'Unknown', 'currentPrice': 0}
    
    @staticmethod
    def get_all_stocks() -> List[Dict]:
        """Get all available stocks with metadata"""
        stocks = []
        for symbol, metadata in MultiSourceFetcher.NIFTY_50.items():
            stocks.append({
                'symbol': symbol,
                'name': metadata['name'],
                'sector': metadata['sector']
            })
        return stocks
    
    @staticmethod
    def get_market_heatmap() -> Dict:
        """
        Get market heatmap data (all stocks with current performance)
        Used for market breadth visualization
        """
        heatmap_data = []
        
        for symbol in MultiSourceFetcher.NIFTY_50.keys():
            try:
                info = MultiSourceFetcher.get_stock_info(symbol)
                
                if info.get('currentPrice', 0) > 0:
                    heatmap_data.append({
                        'symbol': symbol,
                        'name': info['name'],
                        'sector': info['sector'],
                        'price': info['currentPrice'],
                        'change': info.get('change', 0),
                        'changePercent': info.get('changePercent', 0),
                        'volume': info.get('volume', 0),
                        'marketCap': info.get('marketCap', 0),
                    })
            except Exception as e:
                print(f"Error fetching {symbol} for heatmap: {e}")
                continue
        
        # Calculate sector performance
        sector_data = {}
        for item in heatmap_data:
            sector = item['sector']
            if sector not in sector_data:
                sector_data[sector] = {'count': 0, 'avgChange': 0, 'stocks': []}
            
            sector_data[sector]['count'] += 1
            sector_data[sector]['avgChange'] += item['changePercent']
            sector_data[sector]['stocks'].append(item)
        
        # Calculate averages
        for sector in sector_data:
            sector_data[sector]['avgChange'] /= sector_data[sector]['count']
        
        return {
            'stocks': heatmap_data,
            'sectors': [
                {
                    'name': sector,
                    'count': data['count'],
                    'avgChange': data['avgChange'],
                    'stocks': data['stocks']
                }
                for sector, data in sector_data.items()
            ],
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def get_market_breadth() -> Dict:
        """Calculate market breadth statistics"""
        advancing = 0
        declining = 0
        unchanged = 0
        total_volume = 0
        total_market_cap = 0
        
        for symbol in list(MultiSourceFetcher.NIFTY_50.keys())[:20]:  # Sample 20 for speed
            try:
                info = MultiSourceFetcher.get_stock_info(symbol)
                change_pct = info.get('changePercent', 0)
                
                if change_pct > 0:
                    advancing += 1
                elif change_pct < 0:
                    declining += 1
                else:
                    unchanged += 1
                
                total_volume += info.get('volume', 0)
                total_market_cap += info.get('marketCap', 0)
                
            except Exception as e:
                print(f"Error in breadth calculation for {symbol}: {e}")
                continue
        
        total = advancing + declining + unchanged
        
        return {
            'advancing': advancing,
            'declining': declining,
            'unchanged': unchanged,
            'total': total,
            'advanceDeclineRatio': advancing / declining if declining > 0 else advancing,
            'totalVolume': total_volume,
            'totalMarketCap': total_market_cap,
            'timestamp': datetime.now().isoformat()
        }

