# 🧸 Geneva Guide - Interactive Family Travel Companion

An interactive, AI-powered travel guide for families visiting Geneva, Switzerland.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run deploy
```

## 🔧 Development Commands

```bash
# Update cache versions (automatic cache busting)
npm run cache-bust

# Build production CSS (replaces Tailwind CDN)
npm run build-css-prod

# Watch CSS changes during development  
npm run build-css

# Deploy to Netlify
npm run deploy
```

## 🐛 Common Issues & Solutions

### ❌ "day.mainPlan.map is not a function" Error
**Fixed!** This was caused by Firebase data structure mismatches. The code now includes defensive programming:
- Checks if `day.mainPlan` is an array before calling `.map()`
- Shows fallback content if data is missing
- Handles loading states gracefully

### ❌ Tailwind CDN Warning in Production
**Solution**: Use the production build system:
```bash
npm install
npm run build-css-prod
```
Then update `index.html` to use `/css/tailwind.css` instead of the CDN.

### ❌ Favicon 404 Error
**Fixed!** The favicon references have been cleaned up:
- Uses only `/favicon.svg` (exists and works)
- Removed broken `/favicon.ico` reference

### ❌ Font Loading Issues
The Google Fonts warnings are harmless and don't break functionality. They're related to font file internals and can be ignored.

## 🔄 Automatic Cache Busting

The project includes an automated cache-busting system:

1. **Manual**: Run `npm run cache-bust` to update all version numbers
2. **Automatic**: Every deployment runs cache-busting automatically
3. **No more manual version updates!**

## 🎯 Features

- ✅ **Photo Album**: Upload and manage family photos
- ✅ **Interactive Packing**: Smart packing list with progress tracking
- ✅ **Family Memories**: Digital travel journal
- ✅ **Bulletin Board**: Notes and reminders
- ✅ **AI Assistant**: Powered by Google Gemini
- ✅ **Weather Integration**: Real-time Geneva weather
- ✅ **Interactive Map**: All activities with distance calculations
- ✅ **Firebase Integration**: Real-time data synchronization

## 🌐 Deployment

Deploys automatically to Netlify on every push.

### Required Environment Variables:
```bash
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_openweather_api_key
```

## 📁 Project Structure

```
geneva-guide-main/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Custom styles
│   ├── js/
│   │   ├── Main.js         # App initialization
│   │   ├── ui.js           # UI rendering
│   │   ├── handlers.js     # Event handlers
│   │   ├── services.js     # External APIs
│   │   ├── utils.js        # Utility functions
│   │   ├── Gemini.js       # AI integration
│   │   └── Map.js          # Map functionality
│   └── favicon.svg         # Site favicon
├── netlify/
│   └── functions/          # Serverless functions
├── src/
│   └── input.css          # Tailwind input file
├── build-cache.js         # Cache busting script
└── netlify.toml           # Deployment config
```

## 🛠️ Technologies Used

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3
- **Styling**: Tailwind CSS, Custom CSS
- **Backend**: Netlify Functions (Node.js)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage  
- **Maps**: Leaflet.js
- **AI**: Google Gemini API
- **Weather**: OpenWeatherMap API
- **Deployment**: Netlify

---

Built with ❤️ for families exploring Geneva 🇨🇭
