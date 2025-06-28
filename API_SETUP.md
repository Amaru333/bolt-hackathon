# 🔑 API Setup Guide

This guide will help you set up the API keys needed for the enhanced features of the Global Catastrophe Monitor.

## 📋 Required API Keys

### 1. OpenWeather API Key (Recommended)

**Purpose**: Air quality data for major cities
**Cost**: Free tier available (1000 calls/day)
**Setup**:

1. Go to [OpenWeather API](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "My API Keys"
4. Copy your API key
5. Add to `.env` file: `VITE_OPENWEATHER_API_KEY=your_key_here`

### 2. News API Key (Recommended)

**Purpose**: Disaster-related news articles
**Cost**: Free tier available (100 requests/day)
**Setup**:

1. Go to [News API](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key
4. Add to `.env` file: `VITE_NEWS_API_KEY=your_key_here`

### 3. NASA API Key (Optional)

**Purpose**: Additional climate and satellite data
**Cost**: Free
**Setup**:

1. Go to [NASA API](https://api.nasa.gov/)
2. Generate an API key
3. Add to `.env` file: `VITE_NASA_API_KEY=your_key_here`

## 🚀 Quick Setup

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Add Your API Keys

Edit the `.env` file and replace the placeholder values:

```env
VITE_OPENWEATHER_API_KEY=your_actual_openweather_key
VITE_NEWS_API_KEY=your_actual_news_api_key
VITE_NASA_API_KEY=your_actual_nasa_api_key
```

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "API key not configured" Errors

**Solution**: Make sure your `.env` file is in the project root and contains the correct API keys.

#### 2. CORS Errors

**Solution**: The app uses a proxy service for some APIs. If you still get CORS errors, the app will use fallback data.

#### 3. Rate Limiting

**Solution**:

- OpenWeather: Free tier allows 1000 calls/day
- News API: Free tier allows 100 requests/day
- NASA API: No rate limits for basic usage

#### 4. Invalid API Keys

**Solution**: Verify your API keys are correct and active in your respective accounts.

### Testing API Keys

You can test your API keys manually:

#### OpenWeather Test

```bash
curl "https://api.openweathermap.org/data/2.5/air_pollution?lat=34.0522&lon=-118.2437&appid=YOUR_API_KEY"
```

#### News API Test

```bash
curl "https://newsapi.org/v2/everything?q=earthquake&apiKey=YOUR_API_KEY"
```

#### NASA API Test

```bash
curl "https://api.nasa.gov/planetary/earth/assets?lat=1.5&lon=100.75&date=2014-02-01&dim=0.15&api_key=YOUR_API_KEY"
```

## 📊 What Works Without API Keys

The following features work without any API keys:

- ✅ USGS Earthquake data
- ✅ Weather.gov alerts
- ✅ Basic volcanic activity (fallback data)
- ✅ Basic tsunami warnings (fallback data)
- ✅ All map functionality
- ✅ All filtering and analytics

## 🎯 What Requires API Keys

- 🔑 **Air Quality Data** - Requires OpenWeather API key
- 🔑 **Disaster News** - Requires News API key
- 🔑 **Enhanced Climate Data** - Requires NASA API key

## 💡 Tips

1. **Start with free tiers** - All APIs offer free tiers that are sufficient for development
2. **Monitor usage** - Check your API usage in your respective dashboards
3. **Use fallback data** - The app gracefully handles missing API keys
4. **Environment variables** - Never commit your `.env` file to version control

## 🔒 Security Notes

- Keep your API keys secure
- Don't share your `.env` file
- Use environment variables in production
- Monitor API usage to avoid unexpected charges

## 📞 Support

If you encounter issues:

1. Check the browser console for specific error messages
2. Verify your API keys are correct
3. Check your API usage limits
4. Ensure your `.env` file is properly formatted

---

**Note**: The application will work perfectly fine without any API keys, but you'll get enhanced data with them configured.
