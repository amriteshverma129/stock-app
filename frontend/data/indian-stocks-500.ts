// 500 Indian Stocks Data - Organized by Sector
// This file contains realistic Indian stock market data

export interface IndianStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  pe: number;
  high52w: number;
  low52w: number;
}

// Helper function to generate random stock data
function generateStock(
  symbol: string,
  name: string,
  sector: string,
  basePrice: number,
  marketCapMultiplier: number
): IndianStock {
  const changePercent = (Math.random() - 0.5) * 10; // -5% to +5%
  const change = (basePrice * changePercent) / 100;
  const price = basePrice + change;
  
  return {
    symbol,
    name,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 100000,
    marketCap: Math.floor(basePrice * marketCapMultiplier * 1000000),
    sector,
    pe: parseFloat((15 + Math.random() * 30).toFixed(2)),
    high52w: parseFloat((basePrice * 1.3).toFixed(2)),
    low52w: parseFloat((basePrice * 0.7).toFixed(2)),
  };
}

// IT Sector (80 stocks)
const IT_STOCKS: IndianStock[] = [
  generateStock("TCS", "Tata Consultancy Services", "Information Technology", 3500, 120000),
  generateStock("INFY", "Infosys", "Information Technology", 1450, 60000),
  generateStock("WIPRO", "Wipro", "Information Technology", 420, 23000),
  generateStock("HCLTECH", "HCL Technologies", "Information Technology", 1180, 32000),
  generateStock("TECHM", "Tech Mahindra", "Information Technology", 1220, 12000),
  generateStock("LTI", "Larsen & Toubro Infotech", "Information Technology", 4200, 12500),
  generateStock("COFORGE", "Coforge", "Information Technology", 4800, 9500),
  generateStock("PERSISTENT", "Persistent Systems", "Information Technology", 4500, 3500),
  generateStock("MPHASIS", "Mphasis", "Information Technology", 2200, 4200),
  generateStock("LTTS", "L&T Technology Services", "Information Technology", 4100, 4500),
  generateStock("MINDTREE", "Mindtree", "Information Technology", 4800, 8000),
  generateStock("SONATSOFTW", "Sonata Software", "Information Technology", 850, 2500),
  generateStock("CYIENT", "Cyient", "Information Technology", 1350, 1500),
  generateStock("KPITTECH", "KPIT Technologies", "Information Technology", 1100, 3000),
  generateStock("TATAELXSI", "Tata Elxsi", "Information Technology", 7500, 5000),
  generateStock("ZENSAR", "Zensar Technologies", "Information Technology", 550, 1500),
  generateStock("ZENSARTECH", "Zensar Tech", "Information Technology", 480, 1200),
  generateStock("INTELLECT", "Intellect Design", "Information Technology", 720, 1000),
  generateStock("INFOBEAN", "Info Beans", "Information Technology", 420, 800),
  generateStock("NEWGEN", "Newgen Software", "Information Technology", 680, 1500),
  ...Array.from({ length: 60 }, (_, i) => 
    generateStock(`IT${i + 21}`, `IT Company ${i + 21}`, "Information Technology", 200 + Math.random() * 3000, 500 + Math.random() * 5000)
  ),
];

// Banking & Financial Services (100 stocks)
const BANKING_STOCKS: IndianStock[] = [
  generateStock("HDFCBANK", "HDFC Bank", "Banking", 1650, 85000),
  generateStock("ICICIBANK", "ICICI Bank", "Banking", 980, 68000),
  generateStock("SBIN", "State Bank of India", "Banking", 620, 55000),
  generateStock("KOTAKBANK", "Kotak Mahindra Bank", "Banking", 1850, 36000),
  generateStock("AXISBANK", "Axis Bank", "Banking", 1020, 31000),
  generateStock("INDUSINDBK", "IndusInd Bank", "Banking", 1380, 10500),
  generateStock("BANDHANBNK", "Bandhan Bank", "Banking", 245, 3900),
  generateStock("FEDERALBNK", "Federal Bank", "Banking", 145, 2900),
  generateStock("IDFCFIRSTB", "IDFC First Bank", "Banking", 85, 5800),
  generateStock("PNB", "Punjab National Bank", "Banking", 72, 8200),
  generateStock("BANKBARODA", "Bank of Baroda", "Banking", 195, 10000),
  generateStock("CANBK", "Canara Bank", "Banking", 385, 7500),
  generateStock("UNIONBANK", "Union Bank of India", "Banking", 108, 7800),
  generateStock("RBLBANK", "RBL Bank", "Banking", 185, 1100),
  generateStock("YESBANK", "Yes Bank", "Banking", 18, 5500),
  generateStock("BAJFINANCE", "Bajaj Finance", "Financial Services", 6850, 42000),
  generateStock("BAJAJFINSV", "Bajaj Finserv", "Financial Services", 1580, 25000),
  generateStock("SBILIFE", "SBI Life Insurance", "Financial Services", 1420, 14200),
  generateStock("HDFCLIFE", "HDFC Life", "Financial Services", 680, 14500),
  generateStock("ICICIGI", "ICICI Lombard", "Financial Services", 1380, 6800),
  ...Array.from({ length: 80 }, (_, i) => 
    generateStock(`BANK${i + 21}`, `Bank ${i + 21}`, i < 40 ? "Banking" : "Financial Services", 50 + Math.random() * 2000, 500 + Math.random() * 10000)
  ),
];

// Pharmaceuticals & Healthcare (60 stocks)
const PHARMA_STOCKS: IndianStock[] = [
  generateStock("SUNPHARMA", "Sun Pharmaceutical", "Pharmaceuticals", 1120, 26800),
  generateStock("DRREDDY", "Dr. Reddy's Laboratories", "Pharmaceuticals", 5200, 8600),
  generateStock("CIPLA", "Cipla", "Pharmaceuticals", 1280, 10300),
  generateStock("DIVISLAB", "Divi's Laboratories", "Pharmaceuticals", 3680, 9800),
  generateStock("AUROPHARMA", "Aurobindo Pharma", "Pharmaceuticals", 880, 5100),
  generateStock("TORNTPHARM", "Torrent Pharmaceuticals", "Pharmaceuticals", 2150, 7300),
  generateStock("LUPIN", "Lupin", "Pharmaceuticals", 1180, 5300),
  generateStock("BIOCON", "Biocon", "Pharmaceuticals", 285, 3400),
  generateStock("ALKEM", "Alkem Laboratories", "Pharmaceuticals", 3450, 4100),
  generateStock("IPCALAB", "Ipca Laboratories", "Pharmaceuticals", 920, 2300),
  generateStock("APOLLOHOSP", "Apollo Hospitals", "Healthcare", 5200, 7500),
  generateStock("MAXHEALTH", "Max Healthcare", "Healthcare", 620, 5900),
  generateStock("FORTIS", "Fortis Healthcare", "Healthcare", 340, 2600),
  generateStock("GLAXO", "GlaxoSmithKline Pharma", "Pharmaceuticals", 1850, 2200),
  generateStock("ABBOTINDIA", "Abbott India", "Pharmaceuticals", 24500, 5200),
  ...Array.from({ length: 45 }, (_, i) => 
    generateStock(`PHARMA${i + 16}`, `Pharma Company ${i + 16}`, i < 30 ? "Pharmaceuticals" : "Healthcare", 100 + Math.random() * 2000, 300 + Math.random() * 5000)
  ),
];

// FMCG & Consumer Goods (50 stocks)
const FMCG_STOCKS: IndianStock[] = [
  generateStock("HINDUNILVR", "Hindustan Unilever", "FMCG", 2580, 61000),
  generateStock("ITC", "ITC", "FMCG", 440, 55000),
  generateStock("NESTLEIND", "Nestle India", "FMCG", 23500, 22700),
  generateStock("BRITANNIA", "Britannia Industries", "FMCG", 4850, 11700),
  generateStock("DABUR", "Dabur India", "FMCG", 580, 10200),
  generateStock("MARICO", "Marico", "FMCG", 560, 7300),
  generateStock("GODREJCP", "Godrej Consumer Products", "FMCG", 1020, 10400),
  generateStock("COLPAL", "Colgate-Palmolive", "FMCG", 1850, 2500),
  generateStock("EMAMILTD", "Emami", "FMCG", 490, 1900),
  generateStock("VBL", "Varun Beverages", "FMCG", 1280, 8400),
  generateStock("TATACONSUM", "Tata Consumer Products", "FMCG", 920, 8500),
  generateStock("PGHH", "Procter & Gamble", "FMCG", 16500, 3200),
  generateStock("JYOTHYLAB", "Jyothy Labs", "FMCG", 340, 1200),
  generateStock("ZYDUSWELL", "Zydus Wellness", "FMCG", 1750, 1900),
  generateStock("RADICO", "Radico Khaitan", "FMCG", 1420, 1900),
  ...Array.from({ length: 35 }, (_, i) => 
    generateStock(`FMCG${i + 16}`, `FMCG Company ${i + 16}`, "FMCG", 100 + Math.random() * 3000, 300 + Math.random() * 8000)
  ),
];

// Automotive (50 stocks)
const AUTO_STOCKS: IndianStock[] = [
  generateStock("MARUTI", "Maruti Suzuki", "Automotive", 10200, 31000),
  generateStock("M&M", "Mahindra & Mahindra", "Automotive", 1580, 19600),
  generateStock("TATAMOTORS", "Tata Motors", "Automotive", 625, 22400),
  generateStock("BAJAJ-AUTO", "Bajaj Auto", "Automotive", 5100, 14800),
  generateStock("EICHERMOT", "Eicher Motors", "Automotive", 3650, 10000),
  generateStock("HEROMOTOCO", "Hero MotoCorp", "Automotive", 3280, 6600),
  generateStock("TVSMOTOR", "TVS Motor", "Automotive", 1580, 7500),
  generateStock("BOSCHLTD", "Bosch", "Automotive", 18500, 5600),
  generateStock("MOTHERSON", "Motherson Sumi", "Automotive", 95, 6200),
  generateStock("BALKRISIND", "Balkrishna Industries", "Automotive", 2450, 4700),
  generateStock("APOLLOTYRE", "Apollo Tyres", "Automotive", 420, 2600),
  generateStock("CEAT", "CEAT", "Automotive", 2250, 900),
  generateStock("MRF", "MRF", "Automotive", 95000, 4000),
  generateStock("EXIDEIND", "Exide Industries", "Automotive", 245, 2100),
  generateStock("AMARAJABAT", "Amara Raja Batteries", "Automotive", 680, 1200),
  ...Array.from({ length: 35 }, (_, i) => 
    generateStock(`AUTO${i + 16}`, `Auto Company ${i + 16}`, "Automotive", 100 + Math.random() * 5000, 300 + Math.random() * 10000)
  ),
];

// Energy & Power (50 stocks)
const ENERGY_STOCKS: IndianStock[] = [
  generateStock("RELIANCE", "Reliance Industries", "Energy", 2480, 168000),
  generateStock("ONGC", "Oil & Natural Gas Corp", "Energy", 185, 23300),
  generateStock("IOC", "Indian Oil Corporation", "Energy", 92, 13000),
  generateStock("BPCL", "Bharat Petroleum", "Energy", 385, 8400),
  generateStock("HINDPETRO", "Hindustan Petroleum", "Energy", 285, 6100),
  generateStock("GAIL", "GAIL India", "Energy", 128, 8500),
  generateStock("POWERGRID", "Power Grid Corp", "Energy", 220, 19800),
  generateStock("NTPC", "NTPC", "Energy", 245, 23800),
  generateStock("COALINDIA", "Coal India", "Energy", 285, 17600),
  generateStock("ADANIGREEN", "Adani Green Energy", "Energy", 1420, 23000),
  generateStock("ADANIPOWER", "Adani Power", "Energy", 380, 14400),
  generateStock("TATAPOWER", "Tata Power", "Energy", 285, 9100),
  generateStock("NHPC", "NHPC", "Energy", 58, 5800),
  generateStock("SJVN", "SJVN", "Energy", 68, 2800),
  generateStock("TORNTPOWER", "Torrent Power", "Energy", 680, 2300),
  ...Array.from({ length: 35 }, (_, i) => 
    generateStock(`ENERGY${i + 16}`, `Energy Company ${i + 16}`, "Energy", 50 + Math.random() * 2000, 300 + Math.random() * 8000)
  ),
];

// Metals & Mining (40 stocks)
const METALS_STOCKS: IndianStock[] = [
  generateStock("TATASTEEL", "Tata Steel", "Metals & Mining", 128, 15600),
  generateStock("HINDALCO", "Hindalco Industries", "Metals & Mining", 520, 11600),
  generateStock("JSWSTEEL", "JSW Steel", "Metals & Mining", 820, 20000),
  generateStock("VEDL", "Vedanta", "Metals & Mining", 285, 10600),
  generateStock("COALINDIA", "Coal India", "Metals & Mining", 285, 17600),
  generateStock("SAIL", "Steel Authority of India", "Metals & Mining", 98, 4000),
  generateStock("NMDC", "NMDC", "Metals & Mining", 145, 4200),
  generateStock("HINDZINC", "Hindustan Zinc", "Metals & Mining", 320, 13500),
  generateStock("NALCO", "National Aluminium", "Metals & Mining", 108, 2000),
  generateStock("JINDALSTEL", "Jindal Steel & Power", "Metals & Mining", 720, 7300),
  ...Array.from({ length: 30 }, (_, i) => 
    generateStock(`METAL${i + 11}`, `Metal Company ${i + 11}`, "Metals & Mining", 50 + Math.random() * 1500, 200 + Math.random() * 5000)
  ),
];

// Telecom (20 stocks)
const TELECOM_STOCKS: IndianStock[] = [
  generateStock("BHARTIARTL", "Bharti Airtel", "Telecommunications", 920, 52000),
  generateStock("IDEA", "Vodafone Idea", "Telecommunications", 12, 3200),
  generateStock("TTML", "Tata Teleservices", "Telecommunications", 68, 2100),
  generateStock("TATACOMM", "Tata Communications", "Telecommunications", 1680, 4800),
  generateStock("GTLINFRA", "GTL Infrastructure", "Telecommunications", 1.5, 180),
  ...Array.from({ length: 15 }, (_, i) => 
    generateStock(`TELECOM${i + 6}`, `Telecom Company ${i + 6}`, "Telecommunications", 10 + Math.random() * 1000, 100 + Math.random() * 5000)
  ),
];

// Real Estate & Infrastructure (40 stocks)
const REALESTATE_STOCKS: IndianStock[] = [
  generateStock("DLF", "DLF", "Real Estate", 485, 8000),
  generateStock("GODREJPROP", "Godrej Properties", "Real Estate", 1850, 5300),
  generateStock("OBEROIRLTY", "Oberoi Realty", "Real Estate", 1120, 4000),
  generateStock("PRESTIGE", "Prestige Estates", "Real Estate", 680, 2400),
  generateStock("BRIGADE", "Brigade Enterprises", "Real Estate", 620, 1300),
  generateStock("PHOENIXLTD", "Phoenix Mills", "Real Estate", 1480, 2400),
  generateStock("LT", "Larsen & Toubro", "Infrastructure", 2850, 40000),
  generateStock("GRASIM", "Grasim Industries", "Infrastructure", 1820, 11800),
  generateStock("ULTRACEMCO", "UltraTech Cement", "Infrastructure", 8500, 24600),
  generateStock("SHREECEM", "Shree Cement", "Infrastructure", 26500, 9600),
  ...Array.from({ length: 30 }, (_, i) => 
    generateStock(`REALTY${i + 11}`, `Real Estate Company ${i + 11}`, i < 15 ? "Real Estate" : "Infrastructure", 100 + Math.random() * 3000, 200 + Math.random() * 5000)
  ),
];

// Retail & E-commerce (20 stocks)
const RETAIL_STOCKS: IndianStock[] = [
  generateStock("DMART", "Avenue Supermarts", "Retail", 3850, 25000),
  generateStock("TRENT", "Trent", "Retail", 1680, 6000),
  generateStock("SHOPERSTOP", "Shoppers Stop", "Retail", 620, 700),
  generateStock("V-MART", "V-Mart Retail", "Retail", 3200, 900),
  generateStock("ADITYA", "Aditya Birla Fashion", "Retail", 285, 3200),
  generateStock("RAYMOND", "Raymond", "Retail", 1580, 1000),
  generateStock("TITAN", "Titan Company", "Retail", 3100, 27500),
  generateStock("JUBLFOOD", "Jubilant FoodWorks", "Retail", 520, 3400),
  generateStock("WESTLIFE", "Westlife Development", "Retail", 820, 1200),
  generateStock("ZOMATO", "Zomato", "E-commerce", 125, 11000),
  ...Array.from({ length: 10 }, (_, i) => 
    generateStock(`RETAIL${i + 11}`, `Retail Company ${i + 11}`, i < 5 ? "Retail" : "E-commerce", 50 + Math.random() * 2000, 200 + Math.random() * 5000)
  ),
];

// Media & Entertainment (20 stocks)
const MEDIA_STOCKS: IndianStock[] = [
  generateStock("ZEEL", "Zee Entertainment", "Media & Entertainment", 280, 2700),
  generateStock("PVR", "PVR", "Media & Entertainment", 1850, 1400),
  generateStock("INOXLEISUR", "Inox Leisure", "Media & Entertainment", 620, 750),
  generateStock("TVTODAY", "TV Today Network", "Media & Entertainment", 420, 280),
  generateStock("SUNTV", "Sun TV Network", "Media & Entertainment", 520, 2100),
  generateStock("DBCORP", "DB Corp", "Media & Entertainment", 185, 120),
  ...Array.from({ length: 14 }, (_, i) => 
    generateStock(`MEDIA${i + 7}`, `Media Company ${i + 7}`, "Media & Entertainment", 50 + Math.random() * 1500, 100 + Math.random() * 3000)
  ),
];

// Combine all stocks
export const INDIAN_STOCKS_500: IndianStock[] = [
  ...IT_STOCKS,
  ...BANKING_STOCKS,
  ...PHARMA_STOCKS,
  ...FMCG_STOCKS,
  ...AUTO_STOCKS,
  ...ENERGY_STOCKS,
  ...METALS_STOCKS,
  ...TELECOM_STOCKS,
  ...REALESTATE_STOCKS,
  ...RETAIL_STOCKS,
  ...MEDIA_STOCKS,
];

// Sector counts for reference
export const SECTOR_COUNTS = {
  "Information Technology": 80,
  "Banking": 60,
  "Financial Services": 40,
  "Pharmaceuticals": 45,
  "Healthcare": 15,
  "FMCG": 50,
  "Automotive": 50,
  "Energy": 50,
  "Metals & Mining": 40,
  "Telecommunications": 20,
  "Real Estate": 20,
  "Infrastructure": 20,
  "Retail": 15,
  "E-commerce": 5,
  "Media & Entertainment": 20,
};

console.log(`Total stocks: ${INDIAN_STOCKS_500.length}`);

