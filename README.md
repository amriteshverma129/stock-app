# 📊 Stock Market Data Science Dashboard

Modern full-stack **data science platform** for Indian stock market analysis with **real-time data** and **multi-timeframe ML predictions**.

**Stack:** FastAPI + Next.js + Scikit-learn + shadcn/ui + visx + yfinance

> 🚀 **Want to deploy this for FREE?** → [START_HERE.md](START_HERE.md) | [Quick Deploy (5 min)](QUICK_DEPLOY.md)

## 🆕 NEW Features!

- 🔥 **Market Heatmap** - Visual grid + XY scatter plots (like professional stock apps)
- 📊 **Interactive Charts** - visx-powered scatter plots and bar charts
- 🔴 **100% Live Data** - Real-time from Yahoo Finance (no data/ folder needed!)
- 🌐 **Multi-Source** - Yahoo Finance with fallback support
- ⏱️ **4 Timeframes**: 1 Month, 6 Months, 1 Year, 5 Years
- 🎯 **Dynamic price targets** based on timeframe
- 🤖 **Optimized ML models** for each timeframe
- 📈 **40+ Stocks** - Nifty 50 companies with sector grouping

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up
```

Then visit:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs

### Option 2: Manual Setup

**1. Start Backend:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on: **http://localhost:8000**

**2. Start Frontend** (in new terminal):

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 📁 Project Structure

```
stock-app/
├── backend/              # FastAPI + ML Models
│   ├── main.py          # API endpoints
│   ├── ml_models.py     # Machine learning
│   ├── data_processor.py # Data processing
│   └── requirements.txt
│
├── frontend/            # Next.js + React
│   ├── app/            # Pages & layouts
│   ├── components/     # UI components
│   └── package.json
│
└── data/               # Stock data (JSON)
```

---

## 🎯 Features

### Backend (FastAPI)

- 🤖 **ML Models**: Random Forest, Gradient Boosting
- 📊 **Technical Indicators**: MA, RSI, MACD, Bollinger Bands
- 🔮 **Predictions**: 30-day price forecasts
- 📈 **Analysis**: Feature importance, model comparison

### Frontend (Next.js)

- 🎨 **Modern UI**: shadcn/ui components
- 📊 **Charts**: Interactive visx visualizations
- 🔄 **Real-time**: Live data updates
- 📱 **Responsive**: Mobile-friendly design

---

## 📡 API Endpoints

| Endpoint                        | Description             |
| ------------------------------- | ----------------------- |
| `GET /stocks`                   | List all stocks         |
| `GET /stocks/{symbol}`          | Stock details + history |
| `GET /stocks/{symbol}/analysis` | Full ML analysis        |
| `GET /stocks/{symbol}/predict`  | 30-day forecast         |
| `GET /market/summary`           | Market overview         |
| `GET /models/compare`           | Compare ML models       |

**Docs**: http://localhost:8000/docs

---

## 🛠️ Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Backend  | FastAPI, Scikit-learn, Pandas    |
| Frontend | Next.js 14, TypeScript, Tailwind |
| ML       | Random Forest, Gradient Boosting |
| UI       | shadcn/ui, visx charts           |

---

## 🔧 Development

### Test Backend API

```bash
# List stocks
curl http://localhost:8000/stocks?category=Nifty50&limit=5

# Get stock analysis
curl http://localhost:8000/stocks/RELIANCE/analysis
```

### Environment Variables

**Backend** `.env`:

```bash
DATA_FOLDER=../data
```

**Frontend** `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Deploy for FREE! 🆓

Deploy your app to production in 5 minutes at **zero cost**:

- **Quick Deploy**: See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 5-minute setup
- **Free Platforms**: See [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md) - Complete free hosting guide
- **Production**: See [DEPLOYMENT.md](DEPLOYMENT.md) - Advanced deployment options

**Recommended Free Stack:**

- Frontend: Vercel (Free)
- Backend: Render (Free)
- **Total Cost: $0/month** ✅

---

## 📚 Documentation

- [🚀 Quick Deploy](QUICK_DEPLOY.md) - Deploy in 5 minutes
- [🎯 Vercel Setup](VERCEL_SETUP.md) - Step-by-step Vercel configuration (with troubleshooting)
- [🆓 Free Deployment](FREE_DEPLOYMENT.md) - Complete free hosting guide
- [⚙️ Deployment Guide](DEPLOYMENT.md) - Production deployment
- [🏗️ Architecture](ARCHITECTURE.md) - System architecture
- [📖 Developer Guide](DEVELOPER_GUIDE.md) - Development docs
- [📡 API Documentation](API_DOCUMENTATION.md) - API reference
- [🔧 API Docs](http://localhost:8000/docs) - Interactive API docs

---

## ⚠️ Disclaimer

**Educational purposes only. Not financial advice.**

Always consult qualified financial advisors before investing.

---

## 📄 License

MIT License

---

**Built with ❤️ for data science & trading enthusiasts**
