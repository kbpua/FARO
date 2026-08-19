# 💖 DateSpot - Anonymous Date Finder Web App (MVP)

A single-page web application that helps users discover romantic cafes, candlelit restaurants, vibrant rooftops, sweet dessert parlors, and scenic date venues based on their current location or searched destination.

**100% Anonymous**: Works completely without user accounts or login. All saved favorites, itineraries, notes, and visited date logs are persisted privately in browser `localStorage`.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### 1. Installation
Install all dependencies for root, server, and client in one step:
```bash
npm run install:all
```
*(Or run `npm install` inside both `server/` and `client/` directories)*

### 2. (Optional) Configure Google Places API Key
The app runs out-of-the-box with a rich built-in date spot engine and OpenStreetMap Nominatim geocoding. If you have a Google Places API key, create or update `server/.env`:
```env
PORT=5000
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 3. Launch App
Run both the Express backend API proxy and the Vite React frontend concurrently:
```bash
npm start
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Proxy**: [http://localhost:5000](http://localhost:5000)

---

## 🌟 Key Features

### 📍 Location & Discovery
- **"Near Me" GPS Locating**: One-click device geolocation via HTML5 Geolocation API.
- **Address & City Geocoding**: Search any city or neighborhood (e.g. *Manila, Tokyo, Paris, New York, London*) powered by OpenStreetMap Nominatim.
- **Quick City Presets**: One-tap jump to popular destinations.
- **Search Radius Control**: Interactive slider from 1 km (walking distance) to 25 km (scenic drive).

### ✨ Date Vibe & Category Filtering
- **Romantic Vibe Tags**:
  - *First Date Friendly*
  - *Cozy & Quiet*
  - *Romantic & Dimly Lit*
  - *Lively & Fun*
  - *Scenic View*
  - *Budget-Friendly ($)*
  - *Special Occasion ($$$)*
- **Categories**: Cafes & Coffee, Romantic Dining, Rooftops & Bars, Desserts & Sweets, Mall & Casual, Scenic & Parks.
- **Multi-Level Filters**: Price level ($ - $$$$), Minimum rating (4.0+, 4.5+), and Open Now filter.

### 🗺️ Interactive Leaflet Map & Split View
- Free, zero-API-key Leaflet maps with React-Leaflet.
- Custom romantic price & glowing pin markers.
- View modes: Split View, Map Only, and List Only.
- Hover & selection synchronization between map pins and cards.

### 🔍 Comprehensive Place Details
- High-res photo gallery with carousel navigation.
- **Extracted Pros & Cons**: Automatic sentiment extraction from reviews (e.g. *"Great cozy atmosphere"*, *"Delicious pasta"*, *"Can get crowded on weekends"*).
- Verified Google rating & total ratings count.
- Full weekday opening hours table and current open/closed status.
- Direct 1-tap Google Maps directions link and clickable phone dialer (`tel:`).

### 📅 Multi-Stop Date Planner / Itinerary Builder
- Assemble a 2 or 3-step date schedule (e.g., *5:00 PM Coffee* ➔ *7:00 PM Dinner* ➔ *9:00 PM Gelato*).
- Reorder stops with Move Up / Move Down buttons.
- Add private notes for each stop (e.g. *"Reserved window table"*).
- **One-Click Share / Copy**: Copies a formatted date itinerary to the clipboard with emoji accents and Google Maps links.

### 🎲 "Surprise Date" Roulette
- Can't decide where to go? Spin the Date Roulette with sound & confetti animations!
- Filter by specific date vibe or spin across all categories.

### 📖 Anonymous Visited Date Journal & Notes
- Save date spots to Favorites with one tap.
- Log date visits with personal 1-5 star ratings, date visited, and private memories stored in browser `localStorage`.

---

## 🛠️ Architecture & Tech Stack

```
DateApp/
├── server/
│   ├── server.js            # Express proxy with 4 endpoints & fallback generator
│   ├── mockData.js          # Curated date spot database with Unsplash photos & pros/cons
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/      # Navbar, Hero, SearchBar, DateMap, PlaceCard, Modals, Itinerary
│   │   ├── store/           # Zustand store with persist middleware for localStorage
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript domain types
│   │   ├── hooks/           # useGeolocation, useDebounce
│   │   ├── utils/           # distance, formatters, vibeHelpers
│   │   ├── App.tsx          # Main single-page application
│   │   └── main.tsx
│   ├── vite.config.ts       # Vite proxy to backend port 5000
│   └── tailwind.config.js   # Romantic color theme and design tokens
└── package.json             # Root orchestrator with concurrently
```

### Backend Endpoints
1. `GET /api/places/nearby?lat=...&lng=...&radius=...&type=...&keyword=...`
2. `GET /api/places/details?placeId=...`
3. `GET /api/places/photo?photoRef=...`
4. `GET /api/geocode?address=...`
5. `GET /api/health`

---

## Deploy on Vercel

This repo is configured to deploy as:
- **Frontend**: Vite static build from `client/dist`
- **Backend**: Express API as Vercel Serverless Function via `api/[...path].js`

### 1) Push this repo to GitHub
Commit current changes, then push to a GitHub repository.

### 2) Import project in Vercel
- Go to [Vercel](https://vercel.com/new)
- Import your GitHub repository
- Keep Root Directory as the repository root (`DateApp`)

### 3) Environment Variables
Add these in Vercel Project Settings → Environment Variables:
- `FOURSQUARE_API_KEY` (optional)
- `GOOGLE_PLACES_API_KEY` (optional)
- `UNSPLASH_ACCESS_KEY` (optional)

### 4) Deploy
Vercel will use `vercel.json`:
- `installCommand`: `npm run install:all`
- `buildCommand`: `npm run build`
- `outputDirectory`: `client/dist`
- routes `/api/*` to serverless Express and all other routes to SPA `index.html`

### 5) Verify
After deploy:
- App home loads on your Vercel domain
- API health works at: `/api/health`
- Search works at: `/api/places`
