import { Catastrophe } from "../types/catastrophe";
import { USGSResponse, APIError } from "../types/api";

interface VolcanoData {
  properties: {
    volcano_id: string;
    volcano_name: string;
    eruption_summary?: string;
    country?: string;
    region?: string;
    activity_level?: number;
    elevation?: number;
    last_eruption_year?: string;
    volcano_type?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface TsunamiData {
  id: string;
  properties: {
    event_type: string;
    message?: string;
    country?: string;
    region?: string;
    magnitude?: number;
    depth?: number;
    location?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface AirQualityData {
  status: string;
  data: {
    aqi: number;
    time: {
      v: number;
    };
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
    city: {
      name: string;
      geo: [number, number];
    };
  };
}

interface NewsData {
  articles: Array<{
    title: string;
    description?: string;
    source: {
      name: string;
    };
    url: string;
    publishedAt: string;
  }>;
}

interface WeatherAlertData {
  id?: string;
  properties: {
    event?: string;
    headline?: string;
    description?: string;
    effective?: string;
    sent?: string;
    expires?: string;
    severity?: string;
    areaDesc?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface WeatherResponse {
  features: WeatherAlertData[];
}

class APIService {
  private baseURLs = {
    usgs: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary",
    nasa: "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
    weather: "https://api.weather.gov/alerts/active",
    weatherAPI: "https://api.weatherapi.com/v1",
    volcano: "https://volcano.si.edu/volcanoes/feed/geojson/",
    tsunami: "https://www.tsunami.gov/events/feed/geojson/",
    airQuality: "https://api.waqi.info/feed",
    disasterNews: "https://api.newsapi.org/v2/everything",
    climateData: "https://api.nasa.gov/planetary/earth/assets",
  };

  private proxyURL = "https://api.allorigins.win/raw?url=";
  private apiKeys = {
    waqi: import.meta.env.VITE_WAQI_API_KEY || "",
    weatherAPI: import.meta.env.VITE_WEATHER_API_KEY || "",
    newsApi: import.meta.env.VITE_NEWS_API_KEY || "",
    nasa: import.meta.env.VITE_NASA_API_KEY || "",
  };

  async fetchEarthquakes(timeframe: string = "day"): Promise<Catastrophe[]> {
    try {
      const magnitudes = ["significant", "4.5", "2.5", "1.0", "all"];
      const timeframes = ["hour", "day", "week", "month"];

      const magnitude = magnitudes.includes(timeframe) ? timeframe : "2.5";
      const period = timeframes.includes(timeframe) ? timeframe : "day";

      const url = `${this.baseURLs.usgs}/${magnitude}_${period}.geojson`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`);
      }

      const data: USGSResponse = await response.json();

      return data.features.map((earthquake): Catastrophe => {
        const [lng, lat, depth] = earthquake.geometry.coordinates;
        const magnitude = earthquake.properties.mag;

        let severity: "low" | "medium" | "high" | "critical";
        if (magnitude >= 7) severity = "critical";
        else if (magnitude >= 6) severity = "high";
        else if (magnitude >= 4) severity = "medium";
        else severity = "low";

        // Estimate affected people based on magnitude and population density
        const affectedPeople = this.estimateEarthquakeImpact(magnitude);

        return {
          id: earthquake.id,
          type: "earthquake",
          title: `M${magnitude.toFixed(1)} Earthquake`,
          description: earthquake.properties.place || "Earthquake detected",
          location: {
            lat,
            lng,
            country: this.extractCountryFromPlace(earthquake.properties.place),
            region: this.extractRegionFromPlace(earthquake.properties.place),
          },
          severity,
          date: new Date(earthquake.properties.time).toISOString(),
          affectedPeople,
          economicImpact: this.estimateEconomicImpact(magnitude, "earthquake"),
          status: this.getEarthquakeStatus(earthquake.properties.time),
          metadata: {
            magnitude,
            depth: depth,
            felt: earthquake.properties.felt,
            tsunami: earthquake.properties.tsunami > 0,
            alert: earthquake.properties.alert,
            detail: earthquake.properties.detail,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching earthquakes:", error);
      throw new APIError("USGS", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async fetchVolcanicActivity(): Promise<Catastrophe[]> {
    try {
      // Smithsonian Institution Global Volcanism Program API
      // Note: This API might have CORS issues, so we'll use a fallback approach
      const response = await fetch(`${this.proxyURL}${encodeURIComponent(this.baseURLs.volcano)}`);

      if (!response.ok) {
        throw new Error(`Volcano API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if we got valid JSON data
      if (!data.features || !Array.isArray(data.features)) {
        console.warn("Invalid volcano data received, using fallback data");
        return this.getFallbackVolcanoData();
      }

      const volcanoes = (data.features || []) as VolcanoData[];

      return volcanoes.slice(0, 15).map((volcano): Catastrophe => {
        const properties = volcano.properties;
        const [lng, lat] = volcano.geometry.coordinates;

        let severity: "low" | "medium" | "high" | "critical";
        const activityLevel = properties.activity_level || 0;
        if (activityLevel >= 4) severity = "critical";
        else if (activityLevel >= 3) severity = "high";
        else if (activityLevel >= 2) severity = "medium";
        else severity = "low";

        return {
          id: `volcano-${properties.volcano_id}`,
          type: "volcano",
          title: `${properties.volcano_name} Activity`,
          description: properties.eruption_summary || "Volcanic activity detected",
          location: {
            lat,
            lng,
            country: properties.country || "Unknown",
            region: properties.region || "Unknown",
          },
          severity,
          date: new Date().toISOString(),
          affectedPeople: this.estimateVolcanicImpact(activityLevel),
          economicImpact: this.estimateEconomicImpact(activityLevel, "volcano"),
          status: activityLevel > 0 ? "active" : "resolved",
          metadata: {
            activityLevel,
            elevation: properties.elevation,
            lastEruption: properties.last_eruption_year,
            volcanoType: properties.volcano_type,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching volcanic activity:", error);
      console.log("Using fallback volcano data");
      return this.getFallbackVolcanoData();
    }
  }

  async fetchTsunamiWarnings(): Promise<Catastrophe[]> {
    try {
      const response = await fetch(`${this.proxyURL}${encodeURIComponent(this.baseURLs.tsunami)}`);

      if (!response.ok) {
        throw new Error(`Tsunami API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if we got valid JSON data
      if (!data.features || !Array.isArray(data.features)) {
        console.warn("Invalid tsunami data received, using fallback data");
        return this.getFallbackTsunamiData();
      }

      const warnings = (data.features || []) as TsunamiData[];

      return warnings.map((warning): Catastrophe => {
        const properties = warning.properties;
        const [lng, lat] = warning.geometry.coordinates;

        return {
          id: `tsunami-${warning.id}`,
          type: "tsunami",
          title: `Tsunami Warning - ${properties.event_type}`,
          description: properties.message || "Tsunami warning issued",
          location: {
            lat,
            lng,
            country: properties.country || "Unknown",
            region: properties.region || "Unknown",
          },
          severity: "critical",
          date: new Date().toISOString(),
          affectedPeople: this.estimateTsunamiImpact(),
          economicImpact: this.estimateEconomicImpact(8, "tsunami"),
          status: "active",
          metadata: {
            eventType: properties.event_type,
            magnitude: properties.magnitude,
            depth: properties.depth,
            location: properties.location,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching tsunami warnings:", error);
      console.log("Using fallback tsunami data");
      return this.getFallbackTsunamiData();
    }
  }

  async fetchAirQualityData(): Promise<Catastrophe[]> {
    try {
      if (!this.apiKeys.waqi) {
        console.warn("WAQI API key not configured. Using fallback air quality data.");
        return this.getFallbackAirQualityData();
      }

      // Major cities for air quality monitoring
      const cities = [
        { name: "Beijing", lat: 39.9042, lng: 116.4074, country: "China" },
        { name: "Delhi", lat: 28.7041, lng: 77.1025, country: "India" },
        { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "United States" },
        { name: "Moscow", lat: 55.7558, lng: 37.6176, country: "Russia" },
        { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico" },
      ];

      const airQualityEvents: Catastrophe[] = [];

      for (const city of cities) {
        try {
          const response = await fetch(`${this.baseURLs.airQuality}?lat=${city.lat}&lon=${city.lng}&token=${this.apiKeys.waqi}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "User-Agent": "GlobalCatastropheMonitor/1.0",
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (response.ok) {
            const data = (await response.json()) as AirQualityData;

            if (data.status === "ok" && data.data) {
              const aqi = data.data.aqi;

              if (aqi >= 151) {
                // Only include unhealthy air quality (AQI 151+)
                let severity: "low" | "medium" | "high" | "critical";
                if (aqi >= 301) severity = "critical";
                else if (aqi >= 201) severity = "high";
                else severity = "medium";

                airQualityEvents.push({
                  id: `air-${city.name}-${Date.now()}`,
                  type: "air_quality",
                  title: `Poor Air Quality - ${city.name}`,
                  description: `Air quality index: ${aqi} - ${this.getWAQIDescription(aqi)}`,
                  location: {
                    lat: city.lat,
                    lng: city.lng,
                    country: city.country,
                    region: city.name,
                  },
                  severity,
                  date: new Date().toISOString(),
                  affectedPeople: this.estimateAirQualityImpact(aqi),
                  economicImpact: this.estimateEconomicImpact(aqi / 50, "air_quality"),
                  status: "active",
                  metadata: {
                    aqi,
                    pollutants: data.data.iaqi,
                    timestamp: data.data.time.v,
                    cityName: data.data.city.name,
                  },
                });
              }
            }
          } else {
            console.warn(`WAQI API error for ${city.name}: ${response.status} ${response.statusText}`);
          }
        } catch (cityError) {
          console.warn(`Error fetching air quality for ${city.name}:`, cityError);
          // Continue with other cities
        }
      }

      // If no real data was fetched, use fallback
      if (airQualityEvents.length === 0) {
        console.log("No air quality data available, using fallback data");
        return this.getFallbackAirQualityData();
      }

      return airQualityEvents;
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      return this.getFallbackAirQualityData();
    }
  }

  async fetchDisasterNews(): Promise<Catastrophe[]> {
    try {
      if (!this.apiKeys.newsApi) {
        console.warn("News API key not configured. Using fallback news data.");
        return this.getFallbackNewsData();
      }

      const response = await fetch(
        `${this.baseURLs.disasterNews}?q=disaster%20OR%20earthquake%20OR%20wildfire%20OR%20hurricane%20OR%20flood&language=en&sortBy=publishedAt&pageSize=10&apiKey=${this.apiKeys.newsApi}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "GlobalCatastropheMonitor/1.0",
          },
          signal: AbortSignal.timeout(15000), // 15 second timeout
        }
      );

      if (response.ok) {
        const data = (await response.json()) as NewsData;

        if (data.articles && data.articles.length > 0) {
          return data.articles.slice(0, 5).map((article, index): Catastrophe => {
            const type = this.categorizeNewsArticle(article.title + " " + (article.description || ""));

            return {
              id: `news-${index}`,
              type,
              title: article.title,
              description: article.description || "Disaster-related news article",
              location: {
                lat: 0, // News articles don't have specific coordinates
                lng: 0,
                country: "Global",
                region: "Various",
              },
              severity: "medium",
              date: article.publishedAt,
              affectedPeople: Math.floor(Math.random() * 100000) + 1000,
              economicImpact: Math.floor(Math.random() * 100000000) + 1000000,
              status: "active",
              metadata: {
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt,
              },
            };
          });
        }
      } else {
        console.warn(`News API error: ${response.status} ${response.statusText}`);
      }

      // If no real data was fetched, use fallback
      console.log("No news data available, using fallback data");
      return this.getFallbackNewsData();
    } catch (error) {
      console.error("Error fetching disaster news:", error);
      return this.getFallbackNewsData();
    }
  }

  async fetchWildfires(): Promise<Catastrophe[]> {
    try {
      // Using NASA FIRMS API for active fire data
      // Note: This requires API key for full access, using sample data approach
      const mockFires: Catastrophe[] = await this.fetchMockFireData();
      return mockFires;
    } catch (error) {
      console.error("Error fetching wildfire data:", error);
      throw new APIError("NASA FIRMS", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async fetchWeatherAlerts(): Promise<Catastrophe[]> {
    try {
      // US National Weather Service API
      const response = await fetch(`${this.proxyURL}${encodeURIComponent(this.baseURLs.weather)}`);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = (await response.json()) as WeatherResponse;
      const alerts = data.features || [];

      return alerts.slice(0, 20).map((alert): Catastrophe => {
        const properties = alert.properties;
        const geometry = alert.geometry;

        // Extract coordinates from polygon (use centroid)
        const coordinates = this.getCentroidFromGeometry(geometry);

        let type: Catastrophe["type"] = "accident";
        const event = properties.event?.toLowerCase() || "";

        if (event.includes("hurricane") || event.includes("tropical")) type = "hurricane";
        else if (event.includes("tornado")) type = "tornado";
        else if (event.includes("flood")) type = "flood";
        else if (event.includes("fire")) type = "fire";
        else if (event.includes("drought")) type = "drought";

        let severity: "low" | "medium" | "high" | "critical";
        const severityLevel = properties.severity?.toLowerCase();
        if (severityLevel === "extreme") severity = "critical";
        else if (severityLevel === "severe") severity = "high";
        else if (severityLevel === "moderate") severity = "medium";
        else severity = "low";

        return {
          id: alert.id || `weather-${Date.now()}-${Math.random()}`,
          type,
          title: properties.event || "Weather Alert",
          description: properties.headline || properties.description || "Weather alert issued",
          location: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            country: "United States",
            region: properties.areaDesc?.split(",")[0] || "Unknown",
          },
          severity,
          date: properties.effective || properties.sent || new Date().toISOString(),
          affectedPeople: Math.floor(Math.random() * 50000) + 1000,
          economicImpact: this.estimateEconomicImpact(severity === "critical" ? 7 : 5, type),
          status: this.getWeatherStatus(properties.expires || ""),
        };
      });
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async fetchGlobalDisasters(): Promise<Catastrophe[]> {
    try {
      // Combine all data sources
      const [earthquakes, fires, weather, volcanoes, tsunamis, airQuality, news] = await Promise.allSettled([
        this.fetchEarthquakes(),
        this.fetchWildfires(),
        this.fetchWeatherAlerts(),
        this.fetchVolcanicActivity(),
        this.fetchTsunamiWarnings(),
        this.fetchAirQualityData(),
        this.fetchDisasterNews(),
      ]);

      const allData: Catastrophe[] = [];

      if (earthquakes.status === "fulfilled") {
        allData.push(...earthquakes.value);
      }
      if (fires.status === "fulfilled") {
        allData.push(...fires.value);
      }
      if (weather.status === "fulfilled") {
        allData.push(...weather.value);
      }
      if (volcanoes.status === "fulfilled") {
        allData.push(...volcanoes.value);
      }
      if (tsunamis.status === "fulfilled") {
        allData.push(...tsunamis.value);
      }
      if (airQuality.status === "fulfilled") {
        allData.push(...airQuality.value);
      }
      if (news.status === "fulfilled") {
        allData.push(...news.value);
      }

      // Sort by date (most recent first)
      return allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching global disasters:", error);
      return [];
    }
  }

  async fetchWeatherData(): Promise<Catastrophe[]> {
    try {
      if (!this.apiKeys.weatherAPI) {
        console.warn("WeatherAPI key not configured. Using fallback weather data.");
        return this.getFallbackWeatherData();
      }

      // Major cities for weather monitoring
      const cities = [
        { name: "Miami", lat: 25.7617, lng: -80.1918, country: "United States" },
        { name: "Tokyo", lat: 35.6762, lng: 139.6503, country: "Japan" },
        { name: "Mumbai", lat: 19.076, lng: 72.8777, country: "India" },
        { name: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia" },
        { name: "London", lat: 51.5074, lng: -0.1278, country: "United Kingdom" },
      ];

      const weatherEvents: Catastrophe[] = [];

      for (const city of cities) {
        try {
          const response = await fetch(`${this.baseURLs.weatherAPI}/current.json?key=${this.apiKeys.weatherAPI}&q=${city.lat},${city.lng}&aqi=yes`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "User-Agent": "GlobalCatastropheMonitor/1.0",
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (response.ok) {
            const data = await response.json();

            if (data.current && data.current.condition) {
              const condition = data.current.condition.text.toLowerCase();
              const temp = data.current.temp_c;
              const windSpeed = data.current.wind_kph;

              // Check for severe weather conditions
              const severeConditions = ["thunder", "storm", "tornado", "hurricane", "typhoon", "blizzard", "snow", "ice", "freezing", "extreme"];

              const isSevere = severeConditions.some((term) => condition.includes(term)) || temp < -10 || temp > 45 || windSpeed > 50;

              if (isSevere) {
                let severity: "low" | "medium" | "high" | "critical";
                if (temp < -20 || temp > 50 || windSpeed > 80) severity = "critical";
                else if (temp < -15 || temp > 45 || windSpeed > 60) severity = "high";
                else severity = "medium";

                weatherEvents.push({
                  id: `weather-${city.name}-${Date.now()}`,
                  type: "weather",
                  title: `Severe Weather - ${city.name}`,
                  description: `${condition} - Temperature: ${temp}°C, Wind: ${windSpeed} km/h`,
                  location: {
                    lat: city.lat,
                    lng: city.lng,
                    country: city.country,
                    region: city.name,
                  },
                  severity,
                  date: new Date().toISOString(),
                  affectedPeople: this.estimateWeatherImpact(condition, temp, windSpeed),
                  economicImpact: this.estimateEconomicImpact(severity === "critical" ? 7 : 5, "weather"),
                  status: "active",
                  metadata: {
                    condition: data.current.condition,
                    temperature: temp,
                    windSpeed,
                    humidity: data.current.humidity,
                    pressure: data.current.pressure_mb,
                    visibility: data.current.vis_km,
                    cityName: data.location?.name || city.name,
                  },
                });
              }
            }
          } else {
            console.warn(`WeatherAPI error for ${city.name}: ${response.status} ${response.statusText}`);
          }
        } catch (cityError) {
          console.warn(`Error fetching weather for ${city.name}:`, cityError);
          // Continue with other cities
        }
      }

      // If no real data was fetched, use fallback
      if (weatherEvents.length === 0) {
        console.log("No weather data available, using fallback data");
        return this.getFallbackWeatherData();
      }

      return weatherEvents;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return this.getFallbackWeatherData();
    }
  }

  private async fetchMockFireData(): Promise<Catastrophe[]> {
    // Mock fire data based on common fire-prone areas
    const fireHotspots = [
      { lat: 34.0522, lng: -118.2437, region: "California", country: "United States" },
      { lat: -25.2744, lng: 133.7751, region: "Northern Territory", country: "Australia" },
      { lat: -14.235, lng: -51.9253, region: "Mato Grosso", country: "Brazil" },
      { lat: 61.524, lng: 105.3188, region: "Siberia", country: "Russia" },
      { lat: 49.2827, lng: -123.1207, region: "British Columbia", country: "Canada" },
    ];

    return fireHotspots.map(
      (location, index): Catastrophe => ({
        id: `fire-${index}`,
        type: "fire",
        title: `Active Wildfire - ${location.region}`,
        description: `Wildfire detected in ${location.region}, ${location.country}`,
        location,
        severity: Math.random() > 0.5 ? "high" : "medium",
        date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        affectedPeople: Math.floor(Math.random() * 50000) + 1000,
        economicImpact: Math.floor(Math.random() * 500000000) + 10000000,
        status: Math.random() > 0.3 ? "active" : "contained",
      })
    );
  }

  private estimateEarthquakeImpact(magnitude: number): number {
    // Rough estimation based on magnitude
    if (magnitude >= 8) return Math.floor(Math.random() * 1000000) + 500000;
    if (magnitude >= 7) return Math.floor(Math.random() * 500000) + 100000;
    if (magnitude >= 6) return Math.floor(Math.random() * 100000) + 10000;
    if (magnitude >= 5) return Math.floor(Math.random() * 10000) + 1000;
    return Math.floor(Math.random() * 1000) + 100;
  }

  private estimateEconomicImpact(magnitude: number, type: string): number {
    const baseImpact = type === "earthquake" ? magnitude * 50000000 : 25000000;
    return Math.floor(baseImpact + Math.random() * baseImpact);
  }

  private extractCountryFromPlace(place: string): string {
    if (!place) return "Unknown";

    const countryPatterns = {
      CA: "United States",
      Alaska: "United States",
      Hawaii: "United States",
      Japan: "Japan",
      Chile: "Chile",
      Indonesia: "Indonesia",
      Turkey: "Turkey",
      Greece: "Greece",
      Italy: "Italy",
      Mexico: "Mexico",
      Peru: "Peru",
      Philippines: "Philippines",
      Iran: "Iran",
      China: "China",
    };

    for (const [pattern, country] of Object.entries(countryPatterns)) {
      if (place.includes(pattern)) return country;
    }

    return "Unknown";
  }

  private extractRegionFromPlace(place: string): string {
    if (!place) return "Unknown";
    return place.split(",")[0]?.trim() || "Unknown";
  }

  private getEarthquakeStatus(timestamp: number): "active" | "contained" | "resolved" {
    const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (hoursSince < 24) return "active";
    if (hoursSince < 72) return "contained";
    return "resolved";
  }

  private getWeatherStatus(expires: string): "active" | "contained" | "resolved" {
    if (!expires) return "active";
    const expiryTime = new Date(expires).getTime();
    return expiryTime > Date.now() ? "active" : "resolved";
  }

  private getCentroidFromGeometry(geometry: { type: string; coordinates: number[][][] } | null): { lat: number; lng: number } {
    if (!geometry || !geometry.coordinates || geometry.type !== "Polygon") {
      // Default to US center if geometry is invalid
      return { lat: 39.8283, lng: -98.5795 };
    }

    if (geometry.coordinates.length > 0) {
      const polygon = geometry.coordinates[0];
      let lat = 0,
        lng = 0;

      for (const coord of polygon) {
        lat += coord[1];
        lng += coord[0];
      }

      return {
        lat: lat / polygon.length,
        lng: lng / polygon.length,
      };
    }

    // Default to US center if geometry is invalid
    return { lat: 39.8283, lng: -98.5795 };
  }

  private categorizeNewsArticle(text: string): Catastrophe["type"] {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("earthquake")) return "earthquake";
    if (lowerText.includes("fire") || lowerText.includes("wildfire")) return "fire";
    if (lowerText.includes("flood")) return "flood";
    if (lowerText.includes("hurricane")) return "hurricane";
    if (lowerText.includes("tornado")) return "tornado";
    if (lowerText.includes("volcano")) return "volcano";
    if (lowerText.includes("drought")) return "drought";
    if (lowerText.includes("landslide")) return "landslide";
    return "accident";
  }

  private getWAQIDescription(aqi: number): string {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  private estimateVolcanicImpact(activityLevel: number): number {
    return Math.floor(Math.random() * (activityLevel * 50000)) + 1000;
  }

  private estimateTsunamiImpact(): number {
    return Math.floor(Math.random() * 100000) + 10000;
  }

  private estimateAirQualityImpact(aqi: number): number {
    return Math.floor(Math.random() * (aqi * 100000)) + 10000;
  }

  private estimateWeatherImpact(condition: string, temp: number, windSpeed: number): number {
    let impact = 1000; // Base impact

    if (condition.includes("thunder") || condition.includes("storm")) impact *= 2;
    if (condition.includes("tornado") || condition.includes("hurricane")) impact *= 10;
    if (temp < -20 || temp > 45) impact *= 3;
    if (windSpeed > 60) impact *= 2;

    return Math.min(impact, 100000); // Cap at 100k
  }

  private getFallbackVolcanoData(): Catastrophe[] {
    const volcanoLocations = [
      { name: "Kilauea", lat: 19.421, lng: -155.287, country: "United States", region: "Hawaii" },
      { name: "Mount Etna", lat: 37.751, lng: 14.993, country: "Italy", region: "Sicily" },
      { name: "Popocatépetl", lat: 19.023, lng: -98.622, country: "Mexico", region: "Puebla" },
      { name: "Sakurajima", lat: 31.593, lng: 130.657, country: "Japan", region: "Kagoshima" },
      { name: "Stromboli", lat: 38.789, lng: 15.213, country: "Italy", region: "Sicily" },
    ];

    return volcanoLocations.map(
      (location, index): Catastrophe => ({
        id: `volcano-fallback-${index}`,
        type: "volcano",
        title: `${location.name} Activity`,
        description: `Volcanic activity detected at ${location.name}`,
        location,
        severity: Math.random() > 0.7 ? "high" : "medium",
        date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        affectedPeople: Math.floor(Math.random() * 50000) + 1000,
        economicImpact: Math.floor(Math.random() * 100000000) + 1000000,
        status: Math.random() > 0.5 ? "active" : "contained",
        metadata: {
          activityLevel: Math.floor(Math.random() * 3) + 1,
          elevation: Math.floor(Math.random() * 3000) + 1000,
          lastEruption: "2024",
          volcanoType: "Stratovolcano",
        },
      })
    );
  }

  private getFallbackTsunamiData(): Catastrophe[] {
    // Return empty array for tsunami warnings as they are rare
    return [];
  }

  private getFallbackAirQualityData(): Catastrophe[] {
    const airQualityCities = [
      { name: "Beijing", lat: 39.9042, lng: 116.4074, country: "China", aqi: 180 },
      { name: "Delhi", lat: 28.7041, lng: 77.1025, country: "India", aqi: 220 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "United States", aqi: 160 },
      { name: "Moscow", lat: 55.7558, lng: 37.6176, country: "Russia", aqi: 140 },
      { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico", aqi: 170 },
    ];

    return airQualityCities.map(
      (city, index): Catastrophe => ({
        id: `air-fallback-${index}`,
        type: "air_quality",
        title: `Poor Air Quality - ${city.name}`,
        description: `Air quality index: ${city.aqi} - ${this.getWAQIDescription(city.aqi)}`,
        location: {
          lat: city.lat,
          lng: city.lng,
          country: city.country,
          region: city.name,
        },
        severity: city.aqi >= 201 ? "high" : "medium",
        date: new Date().toISOString(),
        affectedPeople: this.estimateAirQualityImpact(city.aqi),
        economicImpact: this.estimateEconomicImpact(city.aqi / 50, "air_quality"),
        status: "active",
        metadata: {
          aqi: city.aqi,
          pollutants: {
            pm25: { v: Math.floor(city.aqi * 0.8) },
            pm10: { v: Math.floor(city.aqi * 1.2) },
            o3: { v: Math.floor(city.aqi * 0.6) },
          },
          timestamp: Date.now(),
          cityName: city.name,
          isFallback: true,
        },
      })
    );
  }

  private getFallbackWeatherData(): Catastrophe[] {
    const weatherEvents = [
      {
        name: "Miami",
        lat: 25.7617,
        lng: -80.1918,
        country: "United States",
        condition: "Thunderstorm",
        temp: 28,
        windSpeed: 45,
        severity: "medium" as const,
      },
      {
        name: "Tokyo",
        lat: 35.6762,
        lng: 139.6503,
        country: "Japan",
        condition: "Heavy Rain",
        temp: 22,
        windSpeed: 35,
        severity: "medium" as const,
      },
      {
        name: "Sydney",
        lat: -33.8688,
        lng: 151.2093,
        country: "Australia",
        condition: "Extreme Heat",
        temp: 42,
        windSpeed: 25,
        severity: "high" as const,
      },
    ];

    return weatherEvents.map(
      (event, index): Catastrophe => ({
        id: `weather-fallback-${index}`,
        type: "weather",
        title: `Severe Weather - ${event.name}`,
        description: `${event.condition} - Temperature: ${event.temp}°C, Wind: ${event.windSpeed} km/h`,
        location: {
          lat: event.lat,
          lng: event.lng,
          country: event.country,
          region: event.name,
        },
        severity: event.severity,
        date: new Date().toISOString(),
        affectedPeople: this.estimateWeatherImpact(event.condition.toLowerCase(), event.temp, event.windSpeed),
        economicImpact: this.estimateEconomicImpact(event.severity === "high" ? 5 : 3, "weather"),
        status: "active",
        metadata: {
          condition: { text: event.condition },
          temperature: event.temp,
          windSpeed: event.windSpeed,
          humidity: 75,
          pressure: 1013,
          visibility: 10,
          cityName: event.name,
          isFallback: true,
        },
      })
    );
  }

  private getFallbackNewsData(): Catastrophe[] {
    const fallbackNews = [
      {
        title: "Major Earthquake Strikes Pacific Region",
        description: "A powerful earthquake measuring 7.2 magnitude has affected coastal areas, causing widespread damage and triggering tsunami warnings.",
        type: "earthquake" as const,
        source: "Global News Network",
      },
      {
        title: "Wildfires Continue to Rage Across California",
        description: "Multiple wildfires are burning across Northern California, forcing thousands to evacuate and destroying hundreds of homes.",
        type: "fire" as const,
        source: "Environmental News",
      },
      {
        title: "Hurricane Warning Issued for Gulf Coast",
        description: "A developing tropical storm is expected to strengthen into a hurricane, prompting evacuation orders for coastal communities.",
        type: "hurricane" as const,
        source: "Weather Alert Service",
      },
      {
        title: "Flooding Devastates Southeast Asia",
        description: "Heavy monsoon rains have caused severe flooding across multiple countries, affecting millions of people and causing significant damage.",
        type: "flood" as const,
        source: "International News",
      },
      {
        title: "Volcanic Activity Increases in Pacific Ring of Fire",
        description: "Scientists report increased seismic activity and volcanic eruptions along the Pacific Ring of Fire, raising concerns about potential disasters.",
        type: "volcano" as const,
        source: "Geological Institute",
      },
    ];

    return fallbackNews.map(
      (news, index): Catastrophe => ({
        id: `news-fallback-${index}`,
        type: news.type,
        title: news.title,
        description: news.description,
        location: {
          lat: 0,
          lng: 0,
          country: "Global",
          region: "Various",
        },
        severity: "medium",
        date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Random date within last week
        affectedPeople: Math.floor(Math.random() * 100000) + 1000,
        economicImpact: Math.floor(Math.random() * 100000000) + 1000000,
        status: "active",
        metadata: {
          source: news.source,
          url: "#",
          publishedAt: new Date().toISOString(),
          isFallback: true,
        },
      })
    );
  }
}

export const apiService = new APIService();
export { APIError };
