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
    
    # Comprehensive list of 100+ Indian stocks
    NIFTY_50 = {
        # IT Sector - 15 stocks
        'TCS': {'name': 'Tata Consultancy Services', 'sector': 'IT'},
        'INFY': {'name': 'Infosys', 'sector': 'IT'},
        'WIPRO': {'name': 'Wipro', 'sector': 'IT'},
        'HCLTECH': {'name': 'HCL Technologies', 'sector': 'IT'},
        'TECHM': {'name': 'Tech Mahindra', 'sector': 'IT'},
        'LTIM': {'name': 'LTIMindtree', 'sector': 'IT'},
        'PERSISTENT': {'name': 'Persistent Systems', 'sector': 'IT'},
        'COFORGE': {'name': 'Coforge', 'sector': 'IT'},
        'MPHASIS': {'name': 'Mphasis', 'sector': 'IT'},
        'LTTS': {'name': 'L&T Technology Services', 'sector': 'IT'},
        'TATAELXSI': {'name': 'Tata Elxsi', 'sector': 'IT'},
        'ZOMATO': {'name': 'Zomato', 'sector': 'IT'},
        'NAUKRI': {'name': 'Info Edge', 'sector': 'IT'},
        'ROUTE': {'name': 'Route Mobile', 'sector': 'IT'},
        'OFSS': {'name': 'Oracle Financial Services Software', 'sector': 'IT'},
        
        # Banking - 15 stocks
        'HDFCBANK': {'name': 'HDFC Bank', 'sector': 'Banking'},
        'ICICIBANK': {'name': 'ICICI Bank', 'sector': 'Banking'},
        'SBIN': {'name': 'State Bank of India', 'sector': 'Banking'},
        'KOTAKBANK': {'name': 'Kotak Mahindra Bank', 'sector': 'Banking'},
        'AXISBANK': {'name': 'Axis Bank', 'sector': 'Banking'},
        'INDUSINDBK': {'name': 'IndusInd Bank', 'sector': 'Banking'},
        'BANDHANBNK': {'name': 'Bandhan Bank', 'sector': 'Banking'},
        'FEDERALBNK': {'name': 'Federal Bank', 'sector': 'Banking'},
        'IDFCFIRSTB': {'name': 'IDFC First Bank', 'sector': 'Banking'},
        'PNB': {'name': 'Punjab National Bank', 'sector': 'Banking'},
        'BANKBARODA': {'name': 'Bank of Baroda', 'sector': 'Banking'},
        'CANBK': {'name': 'Canara Bank', 'sector': 'Banking'},
        'UNIONBANK': {'name': 'Union Bank of India', 'sector': 'Banking'},
        'AUBANK': {'name': 'AU Small Finance Bank', 'sector': 'Banking'},
        'RBLBANK': {'name': 'RBL Bank', 'sector': 'Banking'},
        
        # Auto - 12 stocks
        'MARUTI': {'name': 'Maruti Suzuki', 'sector': 'Auto'},
        'TATAMOTORS': {'name': 'Tata Motors', 'sector': 'Auto'},
        'HEROMOTOCO': {'name': 'Hero MotoCorp', 'sector': 'Auto'},
        'EICHERMOT': {'name': 'Eicher Motors', 'sector': 'Auto'},
        'BAJAJ-AUTO': {'name': 'Bajaj Auto', 'sector': 'Auto'},
        'M&M': {'name': 'Mahindra & Mahindra', 'sector': 'Auto'},
        'ASHOKLEY': {'name': 'Ashok Leyland', 'sector': 'Auto'},
        'TVSMOTOR': {'name': 'TVS Motor Company', 'sector': 'Auto'},
        'ESCORTS': {'name': 'Escorts Kubota', 'sector': 'Auto'},
        'BOSCHLTD': {'name': 'Bosch', 'sector': 'Auto'},
        'MOTHERSON': {'name': 'Samvardhana Motherson International', 'sector': 'Auto'},
        'EXIDEIND': {'name': 'Exide Industries', 'sector': 'Auto'},
        
        # Energy & Oil - 12 stocks
        'RELIANCE': {'name': 'Reliance Industries', 'sector': 'Energy'},
        'BPCL': {'name': 'Bharat Petroleum', 'sector': 'Energy'},
        'ONGC': {'name': 'Oil and Natural Gas Corporation', 'sector': 'Energy'},
        'COALINDIA': {'name': 'Coal India', 'sector': 'Energy'},
        'POWERGRID': {'name': 'Power Grid Corporation', 'sector': 'Energy'},
        'NTPC': {'name': 'NTPC', 'sector': 'Energy'},
        'IOC': {'name': 'Indian Oil Corporation', 'sector': 'Energy'},
        'GAIL': {'name': 'GAIL India', 'sector': 'Energy'},
        'ADANIGREEN': {'name': 'Adani Green Energy', 'sector': 'Energy'},
        'ADANIPORTS': {'name': 'Adani Ports', 'sector': 'Energy'},
        'ADANIENT': {'name': 'Adani Enterprises', 'sector': 'Energy'},
        'TATAPOWER': {'name': 'Tata Power', 'sector': 'Energy'},
        
        # FMCG - 12 stocks
        'HINDUNILVR': {'name': 'Hindustan Unilever', 'sector': 'FMCG'},
        'ITC': {'name': 'ITC Limited', 'sector': 'FMCG'},
        'BRITANNIA': {'name': 'Britannia Industries', 'sector': 'FMCG'},
        'NESTLEIND': {'name': 'Nestle India', 'sector': 'FMCG'},
        'DABUR': {'name': 'Dabur India', 'sector': 'FMCG'},
        'MARICO': {'name': 'Marico', 'sector': 'FMCG'},
        'GODREJCP': {'name': 'Godrej Consumer Products', 'sector': 'FMCG'},
        'COLPAL': {'name': 'Colgate-Palmolive India', 'sector': 'FMCG'},
        'TATACONSUM': {'name': 'Tata Consumer Products', 'sector': 'FMCG'},
        'EMAMILTD': {'name': 'Emami', 'sector': 'FMCG'},
        'VBL': {'name': 'Varun Beverages', 'sector': 'FMCG'},
        'PGHH': {'name': 'Procter & Gamble Hygiene', 'sector': 'FMCG'},
        
        # Pharma - 10 stocks
        'SUNPHARMA': {'name': 'Sun Pharmaceutical', 'sector': 'Pharma'},
        'DRREDDY': {'name': 'Dr. Reddy\'s Laboratories', 'sector': 'Pharma'},
        'CIPLA': {'name': 'Cipla', 'sector': 'Pharma'},
        'DIVISLAB': {'name': 'Divi\'s Laboratories', 'sector': 'Pharma'},
        'BIOCON': {'name': 'Biocon', 'sector': 'Pharma'},
        'LUPIN': {'name': 'Lupin', 'sector': 'Pharma'},
        'AUROPHARMA': {'name': 'Aurobindo Pharma', 'sector': 'Pharma'},
        'TORNTPHARM': {'name': 'Torrent Pharmaceuticals', 'sector': 'Pharma'},
        'ALKEM': {'name': 'Alkem Laboratories', 'sector': 'Pharma'},
        'ABBOTINDIA': {'name': 'Abbott India', 'sector': 'Pharma'},
        
        # Financial Services - 12 stocks
        'BAJFINANCE': {'name': 'Bajaj Finance', 'sector': 'Financial Services'},
        'BAJAJFINSV': {'name': 'Bajaj Finserv', 'sector': 'Financial Services'},
        'HDFCLIFE': {'name': 'HDFC Life Insurance', 'sector': 'Financial Services'},
        'SBILIFE': {'name': 'SBI Life Insurance', 'sector': 'Financial Services'},
        'ICICIGI': {'name': 'ICICI Lombard General Insurance', 'sector': 'Financial Services'},
        'ICICIPRULI': {'name': 'ICICI Prudential Life Insurance', 'sector': 'Financial Services'},
        'HDFCAMC': {'name': 'HDFC Asset Management', 'sector': 'Financial Services'},
        'MUTHOOTFIN': {'name': 'Muthoot Finance', 'sector': 'Financial Services'},
        'CHOLAFIN': {'name': 'Cholamandalam Investment', 'sector': 'Financial Services'},
        'M&MFIN': {'name': 'Mahindra & Mahindra Financial Services', 'sector': 'Financial Services'},
        'PFC': {'name': 'Power Finance Corporation', 'sector': 'Financial Services'},
        'RECLTD': {'name': 'REC Limited', 'sector': 'Financial Services'},
        
        # Metals - 8 stocks
        'TATASTEEL': {'name': 'Tata Steel', 'sector': 'Metals'},
        'HINDALCO': {'name': 'Hindalco Industries', 'sector': 'Metals'},
        'JSWSTEEL': {'name': 'JSW Steel', 'sector': 'Metals'},
        'VEDL': {'name': 'Vedanta', 'sector': 'Metals'},
        'SAIL': {'name': 'Steel Authority of India', 'sector': 'Metals'},
        'JINDALSTEL': {'name': 'Jindal Steel & Power', 'sector': 'Metals'},
        'NMDC': {'name': 'NMDC', 'sector': 'Metals'},
        'HINDZINC': {'name': 'Hindustan Zinc', 'sector': 'Metals'},
        
        # Real Estate & Infra - 10 stocks
        'LT': {'name': 'Larsen & Toubro', 'sector': 'Infrastructure'},
        'ULTRACEMCO': {'name': 'UltraTech Cement', 'sector': 'Infrastructure'},
        'GRASIM': {'name': 'Grasim Industries', 'sector': 'Infrastructure'},
        'AMBUJACEM': {'name': 'Ambuja Cements', 'sector': 'Infrastructure'},
        'ACC': {'name': 'ACC', 'sector': 'Infrastructure'},
        'SHREECEM': {'name': 'Shree Cement', 'sector': 'Infrastructure'},
        'DLF': {'name': 'DLF', 'sector': 'Real Estate'},
        'GODREJPROP': {'name': 'Godrej Properties', 'sector': 'Real Estate'},
        'OBEROIRLTY': {'name': 'Oberoi Realty', 'sector': 'Real Estate'},
        'PRESTIGE': {'name': 'Prestige Estates Projects', 'sector': 'Real Estate'},
        
        # Telecom & Media - 6 stocks
        'BHARTIARTL': {'name': 'Bharti Airtel', 'sector': 'Telecom'},
        'IDEA': {'name': 'Vodafone Idea', 'sector': 'Telecom'},
        'ZEEL': {'name': 'Zee Entertainment', 'sector': 'Media'},
        'PVRINOX': {'name': 'PVR INOX', 'sector': 'Media'},
        'SUNTV': {'name': 'Sun TV Network', 'sector': 'Media'},
        'TVTODAY': {'name': 'TV Today Network', 'sector': 'Media'},
        
        # Consumer Durables - 6 stocks
        'TITAN': {'name': 'Titan Company', 'sector': 'Consumer Durables'},
        'ASIANPAINT': {'name': 'Asian Paints', 'sector': 'Consumer Durables'},
        'HAVELLS': {'name': 'Havells India', 'sector': 'Consumer Durables'},
        'VOLTAS': {'name': 'Voltas', 'sector': 'Consumer Durables'},
        'CROMPTON': {'name': 'Crompton Greaves Consumer Electricals', 'sector': 'Consumer Durables'},
        'WHIRLPOOL': {'name': 'Whirlpool of India', 'sector': 'Consumer Durables'},
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

