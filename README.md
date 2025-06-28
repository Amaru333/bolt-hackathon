# 🌍 Global Catastrophe Monitor

A comprehensive real-time disaster monitoring and visualization platform that aggregates data from multiple sources to provide a global view of natural disasters, weather events, and environmental hazards.

## ✨ Features

### 🚀 Real-Time Data Integration

- **USGS Earthquakes** - Real-time earthquake data with magnitude, depth, and felt reports
- **NASA Fire Data** - Active wildfire monitoring and tracking
- **Weather Alerts** - Severe weather warnings and alerts
- **Volcanic Activity** - Global volcanic monitoring from Smithsonian Institution
- **Tsunami Warnings** - NOAA tsunami detection and warning system
- **Air Quality Data** - Real-time air quality monitoring for major cities
- **Disaster News** - Latest disaster-related news and updates

### 🗺️ Interactive Visualization

- **Interactive Map** - Leaflet-based map with custom markers and popups
- **Real-time Updates** - Auto-refresh every 5 minutes
- **Custom Markers** - Color-coded markers by disaster type and severity
- **Detailed Popups** - Comprehensive event information and metadata
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### 📊 Advanced Analytics

- **Live Statistics** - Real-time counts and metrics
- **Time-based Analysis** - 24h, weekly, and monthly event tracking
- **Geographic Insights** - Most affected countries and regions
- **Economic Impact** - Total economic damage assessment
- **Human Impact** - Affected population tracking
- **Event Distribution** - Type and severity breakdowns

### 🔍 Smart Filtering

- **Event Types** - Filter by earthquake, fire, flood, hurricane, tornado, volcano, accident, drought, landslide, tsunami, air quality
- **Severity Levels** - Filter by low, medium, high, critical
- **Date Range** - Custom date filtering
- **Active Events** - Show only currently active disasters
- **Geographic Filtering** - Filter by country and region

### 📱 User Experience

- **Modern UI** - Clean, dark theme with Tailwind CSS
- **Responsive Layout** - Optimized for all screen sizes
- **Real-time Status** - Live connection status for all data sources
- **Error Handling** - Comprehensive error management and recovery
- **Loading States** - Smooth loading animations and indicators

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd global-catastrophe-monitor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional - for enhanced features)

   ```bash
   # Create .env file
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key
   VITE_NEWS_API_KEY=your_news_api_key
   VITE_NASA_API_KEY=your_nasa_api_key
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Data Sources

### Free APIs (No API Key Required)

- **USGS Earthquake API** - Real-time earthquake data
- **Weather.gov API** - US weather alerts and warnings
- **Smithsonian Volcano API** - Global volcanic activity
- **Tsunami.gov API** - Tsunami warnings and alerts

### Enhanced APIs (API Key Required)

- **OpenWeather Air Quality API** - Air quality data for major cities
- **News API** - Disaster-related news articles
- **NASA API** - Climate and satellite data

## 🎯 Key Features

### Real-Time Monitoring

- Automatic data refresh every 5 minutes
- Live status indicators for all data sources
- Error handling and recovery mechanisms
- Connection health monitoring

### Interactive Map

- Custom disaster markers with type-specific icons
- Severity-based color coding
- Detailed popup information
- Smooth zoom and pan controls
- Dark theme map tiles

### Advanced Filtering

- Multi-select event type filtering
- Severity level filtering
- Date range selection
- Active event toggle
- Real-time filter application

### Analytics Dashboard

- Time-based event statistics
- Geographic impact analysis
- Economic impact assessment
- Human impact tracking
- Event type distribution

## 🔧 Configuration

### Environment Variables

```env
# Optional: Enhanced features
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_NASA_API_KEY=your_nasa_api_key
```

### Customization

- Modify `src/utils/mapUtils.ts` to change colors and icons
- Update `src/services/apiService.ts` to add new data sources
- Customize styling in `src/index.css` and Tailwind config

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:

- Touch-friendly interface
- Optimized map controls
- Responsive sidebar
- Mobile-optimized popups
- Fast loading times

## 🔒 Privacy & Security

- No user data collection
- All data is publicly available from official sources
- No tracking or analytics
- Client-side only processing
- Secure API communication

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **USGS** - Earthquake data
- **NASA** - Fire and climate data
- **NOAA** - Weather and tsunami data
- **Smithsonian Institution** - Volcanic activity data
- **OpenWeather** - Air quality data
- **News API** - Disaster news

## 📞 Support

For questions, issues, or feature requests:

- Create an issue on GitHub
- Check the documentation
- Review the enhancement plan

## 🔮 Future Enhancements

See [ENHANCEMENT_PLAN.md](./ENHANCEMENT_PLAN.md) for a comprehensive roadmap of planned features and improvements.

---

**Built with ❤️ for global disaster monitoring and response coordination**
