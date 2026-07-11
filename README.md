# SmartShop_AI
# SmartShop AI 🛍️⚡

> **AI-powered product comparison and shopping intelligence platform — built with IBM Granite AI, React, Node.js & MongoDB**

[![IBM Granite](https://img.shields.io/badge/IBM-Granite%20AI-0f62fe?logo=ibm&logoColor=white)](https://www.ibm.com/products/watsonx-ai)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://www.mongodb.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Product Search & Filter** | Full-text search across categories, price ranges, ratings, and stores |
| 📊 **Multi-Store Comparison** | Side-by-side comparison of up to 4 products across Amazon, Walmart, Best Buy & more |
| 🤖 **IBM Granite AI Assistant** | Conversational shopping assistant powered by `ibm/granite-13b-chat-v2` |
| 🛡️ **Fake Review Detection** | NLP-based detection of incentivized, generic and AI-generated reviews |
| 📉 **Price Drop Prediction** | Historical trend analysis to predict future price reductions |
| 💡 **Personalized Insights** | Budget-aware recommendations and savings tips tailored to your preferences |
| 🔖 **Save & Compare** | Persistent product lists, compare bar, and favorites dashboard |
| 👤 **Authentication** | JWT-secured registration & login with profile preferences |

---

## 🏗️ Architecture

```
smartshopai/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── app.js         # Express app (middleware, routes)
│   │   ├── server.js      # Entry point
│   │   ├── config/
│   │   │   └── database.js       # MongoDB connection
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT protect / optionalAuth
│   │   ├── models/
│   │   │   ├── User.js           # User schema (auth, preferences)
│   │   │   ├── Product.js        # Product, review, store schemas
│   │   │   └── Compare.js        # CompareSession, Insight schemas
│   │   ├── routes/
│   │   │   ├── auth.js           # /api/auth/*
│   │   │   ├── products.js       # /api/products/*
│   │   │   ├── compare.js        # /api/compare/*
│   │   │   ├── ai.js             # /api/ai/*
│   │   │   ├── reviews.js        # /api/reviews/*
│   │   │   ├── prices.js         # /api/prices/*
│   │   │   ├── users.js          # /api/users/*
│   │   │   └── insights.js       # /api/insights/*
│   │   ├── services/
│   │   │   └── granite.js        # IBM watsonx.ai Granite integration
│   │   └── utils/
│   │       └── seed.js           # Database seed script
│
├── frontend/              # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx        # Router config
│   │   ├── main.jsx       # App entry point
│   │   ├── index.css      # Tailwind + custom styles
│   │   ├── api/
│   │   │   └── index.js          # Axios client + all API calls
│   │   ├── store/
│   │   │   └── index.js          # Zustand stores (auth, compare, UI)
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Navbar + footer + chat widget
│   │   │   ├── ChatWidget.jsx    # Floating AI chat widget
│   │   │   ├── CompareBar.jsx    # Bottom sticky compare bar
│   │   │   ├── ProductCard.jsx   # Product grid card
│   │   │   └── ui/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── StarRating.jsx
│   │   └── pages/
│   │       ├── Home.jsx          # Hero, features, trending
│   │       ├── Products.jsx      # Search, filter, paginated grid
│   │       ├── ProductDetail.jsx # Detail, stores, specs, reviews
│   │       ├── Compare.jsx       # Side-by-side + AI analysis
│   │       ├── Assistant.jsx     # Full-page AI chat
│   │       ├── PriceTracker.jsx  # Charts + drop predictions
│   │       ├── ReviewAnalysis.jsx # Fake review deep-dive
│   │       ├── Dashboard.jsx     # User profile + saved + insights
│   │       ├── Login.jsx
│   │       └── Register.jsx
│
├── .env.example           # Environment variable template
└── package.json           # Root workspace config
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** ≥ 18  
- **MongoDB** running locally on port 27017 (or a MongoDB Atlas URI)
- **IBM watsonx.ai** account (optional — the app runs in mock mode without it)

### 2. Clone & install

```bash
git clone https://github.com/your-repo/smartshop-ai.git
cd smartshop-ai

# Install all workspaces
npm install
npm install --workspace=backend
npm install --workspace=frontend
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGODB_URI=mongodb://localhost:27017/smartshopai
JWT_SECRET=your-super-secret-key-32chars-min

# IBM Granite / watsonx.ai (optional — mock mode works without these)
IBM_WATSONX_API_KEY=your_api_key
IBM_WATSONX_PROJECT_ID=your_project_id
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
IBM_GRANITE_MODEL_ID=ibm/granite-13b-chat-v2
```

### 4. Seed the database

```bash
npm run seed --workspace=backend
```

This inserts 8 products with realistic price history, store listings, and reviews.

### 5. Start development servers

```bash
npm run dev
```

- **Backend:** http://localhost:5000  
- **Frontend:** http://localhost:5173

---

## 🤖 IBM Granite AI Integration

SmartShop AI uses the [`ibm/granite-13b-chat-v2`](https://www.ibm.com/products/watsonx-ai) model via the watsonx.ai API for five intelligent features:

### API Flow

```
Frontend → /api/ai/* → granite.js service → IBM watsonx.ai REST API
                                          ↓ (if creds missing)
                                       Mock responses
```

### AI Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/chat` | POST | Conversational shopping assistant |
| `/api/ai/recommend` | POST | Budget-aware product recommendations |
| `/api/ai/analyze-reviews` | POST | Fake review detection |
| `/api/ai/price-prediction` | POST | Price drop prediction |
| `/api/ai/shopping-insights` | POST | Personalized insights |

### How Granite is prompted

Each feature uses a structured system + user prompt pattern:

```js
// Example: fake review detection
const system = `You are a fake review detection specialist. 
Analyze reviews for: repetitive language, vague praise, 
sentiment-rating mismatches, and timing clusters.`;

const response = await callGranite(system, reviewsText, { maxTokens: 600 });
```

---

## 📡 API Reference

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/preferences` | Update preferences |

### Products
| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | Search & filter products |
| GET | `/api/products/trending` | Trending products |
| GET | `/api/products/:id` | Product detail |

### Compare
| Method | Path | Description |
|---|---|---|
| POST | `/api/compare` | Compare 2–4 products with AI |
| GET | `/api/compare/:sessionId` | Get saved session |

### Prices
| Method | Path | Description |
|---|---|---|
| GET | `/api/prices/:id/history` | Price history |
| GET | `/api/prices/alerts/drops` | Products expected to drop |

### Reviews
| Method | Path | Description |
|---|---|---|
| GET | `/api/reviews/:productId` | Reviews + fake analysis |
| POST | `/api/reviews/:productId` | Submit a review |

---

## 🗄️ MongoDB Schemas

### Product
```
{
  name, brand, category, description,
  stores: [{ store, price, originalPrice, discount, inStock, ... }],
  reviews: [{ author, rating, text, fakeScore, sentiment, ... }],
  priceHistory: [{ price, store, timestamp }],
  pricePrediction: { willDrop, predictedDropPercent, confidence, trend },
  lowestPrice, highestPrice, averageRating, aiSummary
}
```

### User
```
{
  name, email, password (hashed),
  preferences: { budget, categories, favoriteStores, priceAlerts },
  savedProducts: [ref → Product],
  searchHistory: [{ query, timestamp }]
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Zustand |
| **Data Fetching** | TanStack React Query v5, Axios |
| **Charts** | Chart.js + react-chartjs-2 |
| **Backend** | Node.js 18+, Express 4, Morgan, Helmet |
| **Database** | MongoDB 7 + Mongoose 8 |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **AI** | IBM Granite granite-13b-chat-v2 via watsonx.ai API |
| **Caching** | node-cache (server-side AI response cache) |
| **Validation** | express-validator |

---

## 📸 Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero, features overview, trending products |
| Products | `/products` | Search, filter, sort with pagination |
| Product Detail | `/products/:id` | Full detail, store prices, specs, reviews |
| Compare | `/compare` | Side-by-side table + IBM Granite analysis |
| AI Assistant | `/assistant` | Full-page chat with IBM Granite |
| Price Tracker | `/price-tracker` | Line charts + price drop alerts |
| Review Analysis | `/reviews/:id` | Fake review detection deep-dive |
| Dashboard | `/dashboard` | Saved products, insights, preferences |
| Login / Register | `/login`, `/register` | JWT authentication |

---

## 🔒 Security

- All sensitive routes protected with JWT middleware
- Passwords hashed with bcryptjs (12 rounds)
- Rate limiting (100 req / 15 min per IP)
- Helmet.js security headers
- CORS configured per environment

---

## 📝 License

MIT © SmartShop AI — Built with IBM Granite
