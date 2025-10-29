"""
Indian Stocks Data Generator - 500 stocks across sectors
"""
import random
from datetime import datetime, timedelta
import pandas as pd

# Sector definitions with realistic Indian stocks
INDIAN_STOCKS_DATA = {
    "Information Technology": [
        {"symbol": "TCS", "name": "Tata Consultancy Services", "basePrice": 3500, "marketCap": 1200000000000},
        {"symbol": "INFY", "name": "Infosys", "basePrice": 1450, "marketCap": 600000000000},
        {"symbol": "WIPRO", "name": "Wipro", "basePrice": 420, "marketCap": 230000000000},
        {"symbol": "HCLTECH", "name": "HCL Technologies", "basePrice": 1180, "marketCap": 320000000000},
        {"symbol": "TECHM", "name": "Tech Mahindra", "basePrice": 1220, "marketCap": 120000000000},
        {"symbol": "LTI", "name": "Larsen & Toubro Infotech", "basePrice": 4200, "marketCap": 125000000000},
        {"symbol": "COFORGE", "name": "Coforge", "basePrice": 4800, "marketCap": 95000000000},
        {"symbol": "PERSISTENT", "name": "Persistent Systems", "basePrice": 4500, "marketCap": 35000000000},
        {"symbol": "MPHASIS", "name": "Mphasis", "basePrice": 2200, "marketCap": 42000000000},
        {"symbol": "LTTS", "name": "L&T Technology Services", "basePrice": 4100, "marketCap": 45000000000},
    ] + [{"symbol": f"IT{i}", "name": f"IT Company {i}", "basePrice": random.randint(200, 5000), "marketCap": random.randint(500, 50000) * 1000000} for i in range(11, 81)],
    
    "Banking": [
        {"symbol": "HDFCBANK", "name": "HDFC Bank", "basePrice": 1650, "marketCap": 850000000000},
        {"symbol": "ICICIBANK", "name": "ICICI Bank", "basePrice": 980, "marketCap": 680000000000},
        {"symbol": "SBIN", "name": "State Bank of India", "basePrice": 620, "marketCap": 550000000000},
        {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank", "basePrice": 1850, "marketCap": 360000000000},
        {"symbol": "AXISBANK", "name": "Axis Bank", "basePrice": 1020, "marketCap": 310000000000},
        {"symbol": "INDUSINDBK", "name": "IndusInd Bank", "basePrice": 1380, "marketCap": 105000000000},
        {"symbol": "BANDHANBNK", "name": "Bandhan Bank", "basePrice": 245, "marketCap": 39000000000},
        {"symbol": "FEDERALBNK", "name": "Federal Bank", "basePrice": 145, "marketCap": 29000000000},
        {"symbol": "IDFCFIRSTB", "name": "IDFC First Bank", "basePrice": 85, "marketCap": 58000000000},
        {"symbol": "PNB", "name": "Punjab National Bank", "basePrice": 72, "marketCap": 82000000000},
    ] + [{"symbol": f"BANK{i}", "name": f"Bank {i}", "basePrice": random.randint(50, 2000), "marketCap": random.randint(500, 100000) * 1000000} for i in range(11, 61)],
    
    "Financial Services": [
        {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "basePrice": 6850, "marketCap": 420000000000},
        {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv", "basePrice": 1580, "marketCap": 250000000000},
        {"symbol": "SBILIFE", "name": "SBI Life Insurance", "basePrice": 1420, "marketCap": 142000000000},
        {"symbol": "HDFCLIFE", "name": "HDFC Life", "basePrice": 680, "marketCap": 145000000000},
        {"symbol": "ICICIGI", "name": "ICICI Lombard", "basePrice": 1380, "marketCap": 68000000000},
    ] + [{"symbol": f"FIN{i}", "name": f"Financial Services {i}", "basePrice": random.randint(100, 3000), "marketCap": random.randint(1000, 50000) * 1000000} for i in range(6, 41)],
    
    "Pharmaceuticals": [
        {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical", "basePrice": 1120, "marketCap": 268000000000},
        {"symbol": "DRREDDY", "name": "Dr. Reddy's Laboratories", "basePrice": 5200, "marketCap": 86000000000},
        {"symbol": "CIPLA", "name": "Cipla", "basePrice": 1280, "marketCap": 103000000000},
        {"symbol": "DIVISLAB", "name": "Divi's Laboratories", "basePrice": 3680, "marketCap": 98000000000},
        {"symbol": "AUROPHARMA", "name": "Aurobindo Pharma", "basePrice": 880, "marketCap": 51000000000},
    ] + [{"symbol": f"PHARMA{i}", "name": f"Pharma Company {i}", "basePrice": random.randint(100, 3000), "marketCap": random.randint(500, 50000) * 1000000} for i in range(6, 46)],
    
    "Healthcare": [
        {"symbol": "APOLLOHOSP", "name": "Apollo Hospitals", "basePrice": 5200, "marketCap": 75000000000},
        {"symbol": "MAXHEALTH", "name": "Max Healthcare", "basePrice": 620, "marketCap": 59000000000},
        {"symbol": "FORTIS", "name": "Fortis Healthcare", "basePrice": 340, "marketCap": 26000000000},
    ] + [{"symbol": f"HEALTH{i}", "name": f"Healthcare Company {i}", "basePrice": random.randint(200, 3000), "marketCap": random.randint(1000, 30000) * 1000000} for i in range(4, 16)],
    
    "FMCG": [
        {"symbol": "HINDUNILVR", "name": "Hindustan Unilever", "basePrice": 2580, "marketCap": 610000000000},
        {"symbol": "ITC", "name": "ITC", "basePrice": 440, "marketCap": 550000000000},
        {"symbol": "NESTLEIND", "name": "Nestle India", "basePrice": 23500, "marketCap": 227000000000},
        {"symbol": "BRITANNIA", "name": "Britannia Industries", "basePrice": 4850, "marketCap": 117000000000},
        {"symbol": "DABUR", "name": "Dabur India", "basePrice": 580, "marketCap": 102000000000},
    ] + [{"symbol": f"FMCG{i}", "name": f"FMCG Company {i}", "basePrice": random.randint(100, 4000), "marketCap": random.randint(1000, 80000) * 1000000} for i in range(6, 51)],
    
    "Automotive": [
        {"symbol": "MARUTI", "name": "Maruti Suzuki", "basePrice": 10200, "marketCap": 310000000000},
        {"symbol": "M&M", "name": "Mahindra & Mahindra", "basePrice": 1580, "marketCap": 196000000000},
        {"symbol": "TATAMOTORS", "name": "Tata Motors", "basePrice": 625, "marketCap": 224000000000},
        {"symbol": "BAJAJ-AUTO", "name": "Bajaj Auto", "basePrice": 5100, "marketCap": 148000000000},
        {"symbol": "EICHERMOT", "name": "Eicher Motors", "basePrice": 3650, "marketCap": 100000000000},
    ] + [{"symbol": f"AUTO{i}", "name": f"Auto Company {i}", "basePrice": random.randint(100, 6000), "marketCap": random.randint(500, 100000) * 1000000} for i in range(6, 51)],
    
    "Energy": [
        {"symbol": "RELIANCE", "name": "Reliance Industries", "basePrice": 2480, "marketCap": 1680000000000},
        {"symbol": "ONGC", "name": "Oil & Natural Gas Corp", "basePrice": 185, "marketCap": 233000000000},
        {"symbol": "IOC", "name": "Indian Oil Corporation", "basePrice": 92, "marketCap": 130000000000},
        {"symbol": "BPCL", "name": "Bharat Petroleum", "basePrice": 385, "marketCap": 84000000000},
        {"symbol": "POWERGRID", "name": "Power Grid Corp", "basePrice": 220, "marketCap": 198000000000},
        {"symbol": "NTPC", "name": "NTPC", "basePrice": 245, "marketCap": 238000000000},
    ] + [{"symbol": f"ENERGY{i}", "name": f"Energy Company {i}", "basePrice": random.randint(50, 3000), "marketCap": random.randint(500, 80000) * 1000000} for i in range(7, 51)],
    
    "Metals & Mining": [
        {"symbol": "TATASTEEL", "name": "Tata Steel", "basePrice": 128, "marketCap": 156000000000},
        {"symbol": "HINDALCO", "name": "Hindalco Industries", "basePrice": 520, "marketCap": 116000000000},
        {"symbol": "JSWSTEEL", "name": "JSW Steel", "basePrice": 820, "marketCap": 200000000000},
        {"symbol": "VEDL", "name": "Vedanta", "basePrice": 285, "marketCap": 106000000000},
    ] + [{"symbol": f"METAL{i}", "name": f"Metal Company {i}", "basePrice": random.randint(50, 2000), "marketCap": random.randint(200, 50000) * 1000000} for i in range(5, 41)],
    
    "Telecommunications": [
        {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "basePrice": 920, "marketCap": 520000000000},
        {"symbol": "IDEA", "name": "Vodafone Idea", "basePrice": 12, "marketCap": 32000000000},
        {"symbol": "TATACOMM", "name": "Tata Communications", "basePrice": 1680, "marketCap": 48000000000},
    ] + [{"symbol": f"TELECOM{i}", "name": f"Telecom Company {i}", "basePrice": random.randint(10, 1500), "marketCap": random.randint(100, 50000) * 1000000} for i in range(4, 21)],
    
    "Real Estate": [
        {"symbol": "DLF", "name": "DLF", "basePrice": 485, "marketCap": 80000000000},
        {"symbol": "GODREJPROP", "name": "Godrej Properties", "basePrice": 1850, "marketCap": 53000000000},
        {"symbol": "OBEROIRLTY", "name": "Oberoi Realty", "basePrice": 1120, "marketCap": 40000000000},
    ] + [{"symbol": f"REALTY{i}", "name": f"Real Estate Company {i}", "basePrice": random.randint(100, 3000), "marketCap": random.randint(200, 30000) * 1000000} for i in range(4, 21)],
    
    "Infrastructure": [
        {"symbol": "LT", "name": "Larsen & Toubro", "basePrice": 2850, "marketCap": 400000000000},
        {"symbol": "ULTRACEMCO", "name": "UltraTech Cement", "basePrice": 8500, "marketCap": 246000000000},
        {"symbol": "SHREECEM", "name": "Shree Cement", "basePrice": 26500, "marketCap": 96000000000},
    ] + [{"symbol": f"INFRA{i}", "name": f"Infrastructure Company {i}", "basePrice": random.randint(200, 5000), "marketCap": random.randint(500, 50000) * 1000000} for i in range(4, 21)],
    
    "Retail": [
        {"symbol": "DMART", "name": "Avenue Supermarts", "basePrice": 3850, "marketCap": 250000000000},
        {"symbol": "TRENT", "name": "Trent", "basePrice": 1680, "marketCap": 60000000000},
        {"symbol": "TITAN", "name": "Titan Company", "basePrice": 3100, "marketCap": 275000000000},
    ] + [{"symbol": f"RETAIL{i}", "name": f"Retail Company {i}", "basePrice": random.randint(100, 3000), "marketCap": random.randint(500, 50000) * 1000000} for i in range(4, 16)],
    
    "E-commerce": [
        {"symbol": "ZOMATO", "name": "Zomato", "basePrice": 125, "marketCap": 110000000000},
        {"symbol": "NYKAA", "name": "Nykaa", "basePrice": 180, "marketCap": 35000000000},
    ] + [{"symbol": f"ECOM{i}", "name": f"E-commerce Company {i}", "basePrice": random.randint(50, 500), "marketCap": random.randint(1000, 20000) * 1000000} for i in range(3, 6)],
    
    "Media & Entertainment": [
        {"symbol": "ZEEL", "name": "Zee Entertainment", "basePrice": 280, "marketCap": 27000000000},
        {"symbol": "PVR", "name": "PVR", "basePrice": 1850, "marketCap": 14000000000},
        {"symbol": "SUNTV", "name": "Sun TV Network", "basePrice": 520, "marketCap": 21000000000},
    ] + [{"symbol": f"MEDIA{i}", "name": f"Media Company {i}", "basePrice": random.randint(50, 2000), "marketCap": random.randint(100, 30000) * 1000000} for i in range(4, 21)],
}


def generate_stock_data(symbol, name, base_price, market_cap, sector):
    """Generate realistic stock data for a single stock"""
    change_percent = (random.random() - 0.5) * 10  # -5% to +5%
    change = (base_price * change_percent) / 100
    price = base_price + change
    
    return {
        "symbol": symbol,
        "name": name,
        "current_price": round(price, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "volume": random.randint(100000, 10000000),
        "market_cap": market_cap,
        "pe_ratio": round(15 + random.random() * 30, 2),
        "high_52w": round(base_price * 1.3, 2),
        "low_52w": round(base_price * 0.7, 2),
        "sector": sector,
        "dividend_yield": round(random.random() * 3, 2),
        "beta": round(0.5 + random.random() * 1.5, 2),
        "eps": round(base_price / (15 + random.random() * 30), 2),
    }


def get_all_indian_stocks():
    """Generate all 500 Indian stocks with realistic data"""
    all_stocks = []
    
    for sector, stocks in INDIAN_STOCKS_DATA.items():
        for stock_data in stocks:
            stock_info = generate_stock_data(
                stock_data["symbol"],
                stock_data["name"],
                stock_data["basePrice"],
                stock_data["marketCap"],
                sector
            )
            all_stocks.append(stock_info)
    
    return all_stocks


def generate_historical_data(symbol, base_price, days=365):
    """Generate historical OHLCV data for a stock"""
    data = []
    price = base_price * 0.8  # Start 20% below current price
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days - i)
        
        # Simulate realistic price movement
        volatility = 0.02  # 2% daily volatility
        trend = 0.001  # Slight upward trend
        random_change = (random.random() - 0.5) * volatility
        daily_change = trend + random_change
        
        price *= (1 + daily_change)
        
        open_price = price
        high_price = price * (1 + random.random() * 0.03)
        low_price = price * (1 - random.random() * 0.03)
        close_price = price
        volume = random.randint(1000000, 10000000)
        
        data.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Open": round(open_price, 2),
            "High": round(high_price, 2),
            "Low": round(low_price, 2),
            "Close": round(close_price, 2),
            "Volume": volume
        })
    
    return pd.DataFrame(data)


def get_sector_performance():
    """Calculate sector performance based on stocks"""
    all_stocks = get_all_indian_stocks()
    sectors = {}
    
    for stock in all_stocks:
        sector = stock["sector"]
        if sector not in sectors:
            sectors[sector] = {
                "stocks": [],
                "total_market_cap": 0,
                "total_change": 0,
                "count": 0
            }
        
        sectors[sector]["stocks"].append(stock["symbol"])
        sectors[sector]["total_market_cap"] += stock["market_cap"]
        sectors[sector]["total_change"] += stock["change_percent"]
        sectors[sector]["count"] += 1
    
    sector_performance = []
    for sector_name, data in sectors.items():
        avg_change = data["total_change"] / data["count"]
        sector_performance.append({
            "name": sector_name,
            "change": round(avg_change * data["total_market_cap"] / 1000000000, 2),
            "changePercent": round(avg_change, 2),
            "marketCap": data["total_market_cap"],
            "stockCount": data["count"],
            "topStocks": data["stocks"][:5]
        })
    
    # Sort by stock count descending
    sector_performance.sort(key=lambda x: x["stockCount"], reverse=True)
    return sector_performance


# Cache the stock data
_cached_stocks = None
_cached_sectors = None

def get_cached_stocks():
    """Get cached stock data"""
    global _cached_stocks
    if _cached_stocks is None:
        _cached_stocks = get_all_indian_stocks()
    return _cached_stocks

def get_cached_sectors():
    """Get cached sector data"""
    global _cached_sectors
    if _cached_sectors is None:
        _cached_sectors = get_sector_performance()
    return _cached_sectors

