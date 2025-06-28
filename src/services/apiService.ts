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
  list: Array<{
    main: {
      aqi: number;
    };
    components: Record<string, number>;
    dt: number;
  }>;
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
    volcano: "https://volcano.si.edu/volcanoes/feed/geojson/",
    tsunami: "https://www.tsunami.gov/events/feed/geojson/",
    airQuality: "https://api.openweathermap.org/data/2.5/air_pollution",
    disasterNews: "https://api.newsapi.org/v2/everything",
    climateData: "https://api.nasa.gov/planetary/earth/assets",
  };

  private proxyURL = "https://api.allorigins.win/raw?url=";
  private apiKeys = {
    openWeather: import.meta.env.VITE_OPENWEATHER_API_KEY || "",
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
      if (!this.apiKeys.openWeather) {
        console.warn("OpenWeather API key not configured. Skipping air quality data.");
        return [];
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
          const response = await fetch(`${this.baseURLs.airQuality}?lat=${city.lat}&lon=${city.lng}&appid=${this.apiKeys.openWeather}`);

          if (response.ok) {
            const data = (await response.json()) as AirQualityData;
            const aqi = data.list[0].main.aqi;

            if (aqi >= 4) {
              // Only include hazardous air quality
              let severity: "low" | "medium" | "high" | "critical";
              if (aqi >= 5) severity = "critical";
              else severity = "high";

              airQualityEvents.push({
                id: `air-${city.name}-${Date.now()}`,
                type: "air_quality",
                title: `Hazardous Air Quality - ${city.name}`,
                description: `Air quality index: ${aqi}/5 - ${this.getAQIDescription(aqi)}`,
                location: {
                  lat: city.lat,
                  lng: city.lng,
                  country: city.country,
                  region: city.name,
                },
                severity,
                date: new Date().toISOString(),
                affectedPeople: this.estimateAirQualityImpact(aqi),
                economicImpact: this.estimateEconomicImpact(aqi, "air_quality"),
                status: "active",
                metadata: {
                  aqi,
                  pollutants: data.list[0].components,
                  timestamp: data.list[0].dt,
                },
              });
            }
          }
        } catch (cityError) {
          console.warn(`Error fetching air quality for ${city.name}:`, cityError);
          // Continue with other cities
        }
      }

      return airQualityEvents;
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async fetchDisasterNews(): Promise<Catastrophe[]> {
    try {
      if (!this.apiKeys.newsApi) {
        console.warn("News API key not configured. Skipping disaster news.");
        return [];
      }

      const response = await fetch(
        `${this.baseURLs.disasterNews}?q=disaster OR earthquake OR wildfire OR hurricane OR flood&language=en&sortBy=publishedAt&pageSize=10&apiKey=${this.apiKeys.newsApi}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = (await response.json()) as NewsData;
      const articles = data.articles || [];

      return articles.map((article, index): Catastrophe => {
        const type = this.categorizeNewsArticle(article.title + " " + (article.description || ""));

        return {
          id: `news-${index}-${Date.now()}`,
          type,
          title: article.title,
          description: article.description || "Disaster-related news",
          location: {
            lat: 0, // Would need geocoding service for exact coordinates
            lng: 0,
            country: "Global",
            region: "News",
          },
          severity: "medium",
          date: article.publishedAt || new Date().toISOString(),
          affectedPeople: 0,
          economicImpact: 0,
          status: "active",
          metadata: {
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching disaster news:", error);
      return []; // Return empty array instead of throwing
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
          affectedPeople: this.estimateWeatherImpact(properties.areaDesc || ""),
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

  private estimateWeatherImpact(areaDesc: string): number {
    // Estimate based on area description
    const population = areaDesc?.toLowerCase().includes("county") ? 50000 : 10000;
    return Math.floor(Math.random() * population) + 1000;
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

  private getAQIDescription(aqi: number): string {
    const descriptions: Record<number, string> = {
      1: "Good",
      2: "Fair",
      3: "Moderate",
      4: "Poor",
      5: "Very Poor",
    };
    return descriptions[aqi] || "Unknown";
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
}

export const apiService = new APIService();
export { APIError };
