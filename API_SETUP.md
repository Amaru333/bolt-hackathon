# 🔑 API Setup Guide

This application uses several free APIs to provide comprehensive disaster monitoring. Here's how to set them up:

## 🌬️ **Air Quality Data (WAQI - World Air Quality Index)**

**Status: ✅ FREE - No Credit Card Required**

WAQI provides real-time air quality data from monitoring stations worldwide.

### Setup:

1. Visit: https://aqicn.org/data-platform/token/
2. Sign up for a free account
3. Get your API token
4. Add to `.env` file: `VITE_WAQI_API_KEY=your_token_here`

**Benefits:**

- Completely free
- No credit card required
- Real-time data from 10,000+ stations
- Global coverage
- Historical data available

---

## 📰 **Disaster News (News API)**

**Status: ✅ FREE Tier Available**

Provides recent news articles about disasters and emergencies.

### Setup:

1. Visit: https://newsapi.org/
2. Sign up for free account
3. Get your API key
4. Add to `.env` file: `VITE_NEWS_API_KEY=your_key_here`

**Free Tier Limits:**

- 1,000 requests per day
- Perfect for development and small-scale use

---

## 🛰️ **NASA Climate Data (NASA API)**

**Status: ✅ FREE - No Credit Card Required**

Provides satellite imagery and climate data.

### Setup:

1. Visit: https://api.nasa.gov/
2. Sign up for free account
3. Get your API key
4. Add to `.env` file: `VITE_NASA_API_KEY=your_key_here`

**Benefits:**

- Completely free
- No usage limits
- High-quality satellite data

---

## 🌤️ **Weather Data (WeatherAPI)**

**Status: ✅ FREE Tier Available - No Credit Card Required**

Provides current weather conditions and severe weather alerts for major cities.

### Setup:

1. Visit: https://www.weatherapi.com/
2. Sign up for free account
3. Get your API key
4. Add to `.env` file: `VITE_WEATHER_API_KEY=your_key_here`

**Free Tier Limits:**

- 1,000,000 requests per month
- Perfect for development and small-scale use
- No credit card required

**Benefits:**

- No credit card required
- Generous free tier
- Real-time weather data
- Severe weather detection

---

## 🆓 **Free APIs (No Setup Required)**

These APIs work without any API keys:

### ✅ **Earthquakes (USGS)**

- Real-time earthquake data
- No API key needed
- Global coverage

### ✅ **Wildfires (NASA FIRMS)**

- Satellite fire detection
- No API key needed
- Near real-time data

### ✅ **Weather Alerts (NOAA)**

- US weather warnings
- No API key needed
- Severe weather alerts

### ✅ **Volcanic Activity (Smithsonian)**

- Global volcano monitoring
- No API key needed
- Eruption data

### ✅ **Tsunami Warnings (NOAA)**

- Pacific tsunami alerts
- No API key needed
- Real-time warnings

---

## 🚀 **Quick Start**

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env`:**

   ```env
   VITE_WAQI_API_KEY=your_waqi_token_here
   VITE_NEWS_API_KEY=your_news_api_key_here
   VITE_NASA_API_KEY=your_nasa_api_key_here
   VITE_WEATHER_API_KEY=your_weather_api_key_here
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

---

## 📊 **Data Sources Summary**

| Data Type      | API Provider | Cost      | Credit Card | Setup Required |
| -------------- | ------------ | --------- | ----------- | -------------- |
| Air Quality    | WAQI         | Free      | ❌ No       | ✅ Yes         |
| Weather        | WeatherAPI   | Free tier | ❌ No       | ✅ Yes         |
| News           | News API     | Free tier | ❌ No       | ✅ Yes         |
| Climate        | NASA         | Free      | ❌ No       | ✅ Yes         |
| Earthquakes    | USGS         | Free      | ❌ No       | ❌ No          |
| Wildfires      | NASA FIRMS   | Free      | ❌ No       | ❌ No          |
| Weather Alerts | NOAA         | Free      | ❌ No       | ❌ No          |
| Volcanoes      | Smithsonian  | Free      | ❌ No       | ❌ No          |
| Tsunamis       | NOAA         | Free      | ❌ No       | ❌ No          |

---

## 🔧 **Troubleshooting**

### Missing API Keys

- The app works without API keys using fallback data
- You'll see sample data for air quality, news, and climate
- Real-time data requires valid API keys

### Rate Limits

- News API: 1,000 requests/day (free tier)
- WAQI: Generous limits for free tier
- NASA: No limits

### Data Quality

- All APIs provide high-quality, verified data
- Fallback data is realistic but not real-time
- Real-time data updates every 5 minutes

---

## 💡 **Alternative APIs**

If you prefer different providers:

### Air Quality Alternatives:

- **EPA AirNow** (US only, free)
- **BreezoMeter** (free tier available)
- **IQAir** (free tier with registration)

### News Alternatives:

- **GNews** (free tier available)
- **MediaStack** (free tier available)

### Weather Alternatives:

- **WeatherAPI** (free tier, no credit card required) ✅ **RECOMMENDED**
- **OpenWeather** (free tier, requires credit card)
- **AccuWeather** (free tier available)
- **Tomorrow.io** (free tier available)

---

## 🎯 **Recommendations**

1. **Start with WAQI** - Best free air quality API
2. **Add WeatherAPI** - Excellent weather data, no credit card required
3. **Add News API** - Great for disaster news
4. **Include NASA API** - Excellent for climate data
5. **Use fallback data** - App works without any keys

The application is designed to work seamlessly with or without API keys, providing a great user experience in both scenarios!

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
