import { CountryProfile, EconomicData, SocialMediaTrend, TransportationData, PredictiveAnalytics, DataLayer } from "../types/country";

class CountryService {
  private apiKeys = {
    alpha: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "",
    twitter: import.meta.env.VITE_TWITTER_API_KEY || "",
    aviation: import.meta.env.VITE_AVIATION_API_KEY || "",
  };

  private countryProfiles = new Map<string, CountryProfile>([
    ["US", {
      code: "US",
      name: "United States",
      capital: "Washington, D.C.",
      population: 331900000,
      gdp: 25462700000000,
      currency: "USD",
      timezone: "UTC-5 to UTC-10",
      coordinates: { lat: 39.8283, lng: -98.5795 },
      bounds: { north: 71.5388, south: 18.7763, east: -66.9513, west: -179.9 },
      government: { type: "Federal Republic", leader: "President" },
      economy: { gdpPerCapita: 76770, unemploymentRate: 3.7, inflationRate: 3.2 },
      demographics: { lifeExpectancy: 78.9, literacyRate: 99, urbanPopulation: 82.7 },
      infrastructure: { internetPenetration: 91, mobilePenetration: 110, electricityAccess: 100 }
    }],
    ["CN", {
      code: "CN",
      name: "China",
      capital: "Beijing",
      population: 1412000000,
      gdp: 17734000000000,
      currency: "CNY",
      timezone: "UTC+8",
      coordinates: { lat: 35.8617, lng: 104.1954 },
      bounds: { north: 53.5609, south: 18.1973, east: 134.7754, west: 73.4994 },
      government: { type: "Communist State", leader: "President" },
      economy: { gdpPerCapita: 12556, unemploymentRate: 5.2, inflationRate: 2.1 },
      demographics: { lifeExpectancy: 77.4, literacyRate: 96.8, urbanPopulation: 63.9 },
      infrastructure: { internetPenetration: 73, mobilePenetration: 125, electricityAccess: 100 }
    }],
    ["JP", {
      code: "JP",
      name: "Japan",
      capital: "Tokyo",
      population: 125800000,
      gdp: 4937000000000,
      currency: "JPY",
      timezone: "UTC+9",
      coordinates: { lat: 36.2048, lng: 138.2529 },
      bounds: { north: 45.5514, south: 24.2084, east: 153.9869, west: 122.9344 },
      government: { type: "Constitutional Monarchy", leader: "Prime Minister" },
      economy: { gdpPerCapita: 39285, unemploymentRate: 2.8, inflationRate: 1.4 },
      demographics: { lifeExpectancy: 84.6, literacyRate: 99, urbanPopulation: 91.8 },
      infrastructure: { internetPenetration: 83, mobilePenetration: 148, electricityAccess: 100 }
    }],
    ["GB", {
      code: "GB",
      name: "United Kingdom",
      capital: "London",
      population: 67500000,
      gdp: 3131000000000,
      currency: "GBP",
      timezone: "UTC+0",
      coordinates: { lat: 55.3781, lng: -3.4360 },
      bounds: { north: 60.8614, south: 49.8847, east: 1.7627, west: -8.6493 },
      government: { type: "Constitutional Monarchy", leader: "Prime Minister" },
      economy: { gdpPerCapita: 46344, unemploymentRate: 3.8, inflationRate: 4.2 },
      demographics: { lifeExpectancy: 81.2, literacyRate: 99, urbanPopulation: 84.2 },
      infrastructure: { internetPenetration: 95, mobilePenetration: 120, electricityAccess: 100 }
    }],
    ["IN", {
      code: "IN",
      name: "India",
      capital: "New Delhi",
      population: 1380000000,
      gdp: 3737000000000,
      currency: "INR",
      timezone: "UTC+5:30",
      coordinates: { lat: 20.5937, lng: 78.9629 },
      bounds: { north: 37.0841, south: 6.7535, east: 97.4025, west: 68.1766 },
      government: { type: "Federal Republic", leader: "Prime Minister" },
      economy: { gdpPerCapita: 2277, unemploymentRate: 7.4, inflationRate: 5.7 },
      demographics: { lifeExpectancy: 69.7, literacyRate: 77.7, urbanPopulation: 35.4 },
      infrastructure: { internetPenetration: 50, mobilePenetration: 87, electricityAccess: 95 }
    }],
    ["FR", {
      code: "FR",
      name: "France",
      capital: "Paris",
      population: 67800000,
      gdp: 2937000000000,
      currency: "EUR",
      timezone: "UTC+1",
      coordinates: { lat: 46.2276, lng: 2.2137 },
      bounds: { north: 51.1242, south: 41.3253, east: 9.6625, west: -5.5591 },
      government: { type: "Republic", leader: "President" },
      economy: { gdpPerCapita: 43518, unemploymentRate: 7.3, inflationRate: 5.2 },
      demographics: { lifeExpectancy: 82.7, literacyRate: 99, urbanPopulation: 81.0 },
      infrastructure: { internetPenetration: 85, mobilePenetration: 110, electricityAccess: 100 }
    }],
    ["DE", {
      code: "DE",
      name: "Germany",
      capital: "Berlin",
      population: 83200000,
      gdp: 4259000000000,
      currency: "EUR",
      timezone: "UTC+1",
      coordinates: { lat: 51.1657, lng: 10.4515 },
      bounds: { north: 55.0581, south: 47.2701, east: 15.0419, west: 5.8663 },
      government: { type: "Federal Republic", leader: "Chancellor" },
      economy: { gdpPerCapita: 51203, unemploymentRate: 3.0, inflationRate: 7.9 },
      demographics: { lifeExpectancy: 81.3, literacyRate: 99, urbanPopulation: 77.5 },
      infrastructure: { internetPenetration: 89, mobilePenetration: 128, electricityAccess: 100 }
    }],
  ]);

  async getCountryProfile(countryCode: string): Promise<CountryProfile | null> {
    const profile = this.countryProfiles.get(countryCode);
    if (profile) {
      return profile;
    }

    // Try to fetch from REST Countries API
    try {
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      if (response.ok) {
        const data = await response.json();
        const country = data[0];
        
        const profile: CountryProfile = {
          code: countryCode,
          name: country.name.common,
          capital: country.capital?.[0] || "Unknown",
          population: country.population || 0,
          gdp: 0, // Would need additional API
          currency: Object.keys(country.currencies || {})[0] || "Unknown",
          timezone: country.timezones?.[0] || "Unknown",
          coordinates: { 
            lat: country.latlng?.[0] || 0, 
            lng: country.latlng?.[1] || 0 
          },
          bounds: { north: 0, south: 0, east: 0, west: 0 }, // Would need additional calculation
          government: { type: "Unknown", leader: "Unknown" },
          economy: { gdpPerCapita: 0, unemploymentRate: 0, inflationRate: 0 },
          demographics: { lifeExpectancy: 0, literacyRate: 0, urbanPopulation: 0 },
          infrastructure: { internetPenetration: 0, mobilePenetration: 0, electricityAccess: 0 }
        };

        this.countryProfiles.set(countryCode, profile);
        return profile;
      }
    } catch (error) {
      console.error("Error fetching country profile:", error);
    }

    return null;
  }

  async getEconomicData(countryCode: string): Promise<EconomicData | null> {
    try {
      // Mock economic data - in production, integrate with Alpha Vantage, Yahoo Finance, etc.
      const mockData: Record<string, EconomicData> = {
        "US": {
          countryCode: "US",
          stockMarket: {
            index: "S&P 500",
            value: 4756.50,
            change: 23.45,
            changePercent: 0.49
          },
          currency: {
            code: "USD",
            rate: 1.0,
            change: 0.0
          },
          commodities: {
            oil: 78.45,
            gold: 2034.50,
            wheat: 645.25
          },
          tradeData: {
            exports: 1645000000000,
            imports: 2407000000000,
            tradeBalance: -762000000000
          }
        },
        "CN": {
          countryCode: "CN",
          stockMarket: {
            index: "Shanghai Composite",
            value: 3089.26,
            change: -12.34,
            changePercent: -0.40
          },
          currency: {
            code: "CNY",
            rate: 7.23,
            change: 0.02
          },
          commodities: {
            oil: 78.45,
            gold: 2034.50,
            wheat: 645.25
          },
          tradeData: {
            exports: 3364000000000,
            imports: 2687000000000,
            tradeBalance: 677000000000
          }
        },
        "JP": {
          countryCode: "JP",
          stockMarket: {
            index: "Nikkei 225",
            value: 33486.89,
            change: 156.78,
            changePercent: 0.47
          },
          currency: {
            code: "JPY",
            rate: 149.85,
            change: -0.45
          },
          commodities: {
            oil: 78.45,
            gold: 2034.50,
            wheat: 645.25
          },
          tradeData: {
            exports: 756000000000,
            imports: 721000000000,
            tradeBalance: 35000000000
          }
        }
      };

      return mockData[countryCode] || null;
    } catch (error) {
      console.error("Error fetching economic data:", error);
      return null;
    }
  }

  async getSocialMediaTrends(countryCode: string): Promise<SocialMediaTrend[]> {
    try {
      // Mock social media trends - in production, integrate with Twitter API, etc.
      const mockTrends: SocialMediaTrend[] = [
        {
          id: "trend-1",
          platform: "Twitter",
          hashtag: "#ClimateAction",
          mentions: 125000,
          sentiment: "positive",
          location: { lat: 40.7128, lng: -74.0060, country: "US", region: "New York" },
          category: "Environment",
          timestamp: new Date().toISOString()
        },
        {
          id: "trend-2",
          platform: "Twitter",
          hashtag: "#TechInnovation",
          mentions: 89000,
          sentiment: "positive",
          location: { lat: 37.7749, lng: -122.4194, country: "US", region: "San Francisco" },
          category: "Technology",
          timestamp: new Date().toISOString()
        },
        {
          id: "trend-3",
          platform: "Twitter",
          hashtag: "#EconomicGrowth",
          mentions: 67000,
          sentiment: "neutral",
          location: { lat: 51.5074, lng: -0.1278, country: "GB", region: "London" },
          category: "Economy",
          timestamp: new Date().toISOString()
        }
      ];

      return mockTrends.filter(trend => trend.location.country === countryCode);
    } catch (error) {
      console.error("Error fetching social media trends:", error);
      return [];
    }
  }

  async getTransportationData(countryCode: string): Promise<TransportationData> {
    try {
      // Mock transportation data - in production, integrate with FlightAware, MarineTraffic, etc.
      const mockData: TransportationData = {
        flights: [
          {
            id: "flight-1",
            flightNumber: "AA123",
            airline: "American Airlines",
            origin: { code: "JFK", name: "John F. Kennedy International", lat: 40.6413, lng: -73.7781 },
            destination: { code: "LAX", name: "Los Angeles International", lat: 33.9425, lng: -118.4081 },
            status: "on-time"
          },
          {
            id: "flight-2",
            flightNumber: "UA456",
            airline: "United Airlines",
            origin: { code: "ORD", name: "O'Hare International", lat: 41.9742, lng: -87.9073 },
            destination: { code: "SFO", name: "San Francisco International", lat: 37.6213, lng: -122.3790 },
            status: "delayed",
            delay: 45,
            reason: "Weather conditions"
          }
        ],
        shipping: [
          {
            id: "ship-1",
            vesselName: "Pacific Trader",
            type: "container",
            origin: "Los Angeles",
            destination: "Shanghai",
            location: { lat: 35.0, lng: -140.0 },
            status: "active",
            cargo: "Electronics"
          }
        ],
        infrastructure: [
          {
            id: "infra-1",
            type: "power",
            location: { lat: 40.7128, lng: -74.0060, country: "US", region: "New York" },
            status: "operational",
            affectedPopulation: 0,
            severity: "low",
            description: "All power systems operational"
          },
          {
            id: "infra-2",
            type: "internet",
            location: { lat: 37.7749, lng: -122.4194, country: "US", region: "San Francisco" },
            status: "disrupted",
            affectedPopulation: 50000,
            severity: "medium",
            description: "Fiber optic cable maintenance affecting downtown area",
            estimatedRepair: "2 hours"
          }
        ]
      };

      return mockData;
    } catch (error) {
      console.error("Error fetching transportation data:", error);
      return { flights: [], shipping: [], infrastructure: [] };
    }
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    try {
      // Mock predictive analytics - in production, use ML models and historical data
      const mockAnalytics: PredictiveAnalytics = {
        riskAssessment: [
          {
            id: "risk-1",
            type: "earthquake",
            location: { lat: 35.6762, lng: 139.6503, country: "JP", region: "Tokyo" },
            probability: 75,
            timeframe: "next 30 days",
            severity: "high",
            confidence: 85,
            factors: ["Historical seismic activity", "Tectonic plate movement", "Recent tremors"]
          },
          {
            id: "risk-2",
            type: "hurricane",
            location: { lat: 25.7617, lng: -80.1918, country: "US", region: "Miami" },
            probability: 60,
            timeframe: "next 90 days",
            severity: "medium",
            confidence: 70,
            factors: ["Sea surface temperature", "Wind patterns", "Historical data"]
          }
        ],
        trendAnalysis: [
          {
            id: "trend-1",
            category: "Climate Events",
            trend: "increasing",
            magnitude: 15,
            timeframe: "next 12 months",
            description: "Extreme weather events are predicted to increase by 15% globally",
            regions: ["North America", "Europe", "Asia"]
          }
        ],
        correlationInsights: [
          {
            id: "corr-1",
            event1: "Economic Downturn",
            event2: "Social Unrest",
            correlation: 0.73,
            description: "Strong positive correlation between economic instability and social movements",
            examples: ["2008 Financial Crisis", "Arab Spring", "Recent protests"]
          }
        ]
      };

      return mockAnalytics;
    } catch (error) {
      console.error("Error fetching predictive analytics:", error);
      return { riskAssessment: [], trendAnalysis: [], correlationInsights: [] };
    }
  }

  async getDataLayers(): Promise<DataLayer[]> {
    try {
      // Generate more realistic and diverse data layers
      const mockLayers: DataLayer[] = [
        {
          id: "population-density",
          name: "Population Density",
          type: "heatmap",
          category: "demographic",
          data: this.generatePopulationDensityData(),
          visible: false,
          opacity: 0.6,
          colorScale: ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"]
        },
        {
          id: "gdp-per-capita",
          name: "GDP per Capita",
          type: "heatmap",
          category: "economic",
          data: this.generateGDPData(),
          visible: false,
          opacity: 0.7,
          colorScale: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"]
        },
        {
          id: "internet-penetration",
          name: "Internet Penetration",
          type: "heatmap",
          category: "infrastructure",
          data: this.generateInternetData(),
          visible: false,
          opacity: 0.7,
          colorScale: ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"]
        },
        {
          id: "air-quality",
          name: "Air Quality Index",
          type: "heatmap",
          category: "environmental",
          data: this.generateAirQualityData(),
          visible: false,
          opacity: 0.8,
          colorScale: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#8f3f97", "#7e0023"]
        },
        {
          id: "social-media-activity",
          name: "Social Media Activity",
          type: "heatmap",
          category: "social",
          data: this.generateSocialMediaData(),
          visible: false,
          opacity: 0.6,
          colorScale: ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#08589e"]
        }
      ];

      return mockLayers;
    } catch (error) {
      console.error("Error fetching data layers:", error);
      return [];
    }
  }

  private generatePopulationDensityData() {
    // Major cities with realistic population density data
    const cities = [
      { lat: 40.7128, lng: -74.0060, value: 10194 }, // New York
      { lat: 35.6762, lng: 139.6503, value: 6158 }, // Tokyo
      { lat: 51.5074, lng: -0.1278, value: 5666 }, // London
      { lat: 48.8566, lng: 2.3522, value: 3550 }, // Paris
      { lat: 39.9042, lng: 116.4074, value: 1311 }, // Beijing
      { lat: 28.7041, lng: 77.1025, value: 11320 }, // Delhi
      { lat: 19.0760, lng: 72.8777, value: 20482 }, // Mumbai
      { lat: -33.8688, lng: 151.2093, value: 433 }, // Sydney
      { lat: 43.6532, lng: -79.3832, value: 4334 }, // Toronto
      { lat: 52.5200, lng: 13.4050, value: 4055 }, // Berlin
      { lat: 37.7749, lng: -122.4194, value: 6658 }, // San Francisco
      { lat: 34.0522, lng: -118.2437, value: 3276 }, // Los Angeles
      { lat: 25.7617, lng: -80.1918, value: 4919 }, // Miami
      { lat: 41.8781, lng: -87.6298, value: 4593 }, // Chicago
      { lat: 55.7558, lng: 37.6176, value: 4925 }, // Moscow
    ];
    
    return cities;
  }

  private generateGDPData() {
    // GDP per capita data for major cities/regions
    const regions = [
      { lat: 40.7128, lng: -74.0060, value: 85000 }, // New York
      { lat: 37.7749, lng: -122.4194, value: 95000 }, // San Francisco
      { lat: 51.5074, lng: -0.1278, value: 65000 }, // London
      { lat: 35.6762, lng: 139.6503, value: 48000 }, // Tokyo
      { lat: 48.8566, lng: 2.3522, value: 55000 }, // Paris
      { lat: 52.5200, lng: 13.4050, value: 52000 }, // Berlin
      { lat: 39.9042, lng: 116.4074, value: 25000 }, // Beijing
      { lat: 28.7041, lng: 77.1025, value: 8000 }, // Delhi
      { lat: -33.8688, lng: 151.2093, value: 58000 }, // Sydney
      { lat: 43.6532, lng: -79.3832, value: 48000 }, // Toronto
      { lat: 55.7558, lng: 37.6176, value: 28000 }, // Moscow
      { lat: 25.7617, lng: -80.1918, value: 45000 }, // Miami
      { lat: 34.0522, lng: -118.2437, value: 62000 }, // Los Angeles
      { lat: 41.8781, lng: -87.6298, value: 55000 }, // Chicago
    ];
    
    return regions;
  }

  private generateInternetData() {
    // Internet penetration percentage by region
    const regions = [
      { lat: 40.7128, lng: -74.0060, value: 95 }, // New York
      { lat: 37.7749, lng: -122.4194, value: 98 }, // San Francisco
      { lat: 51.5074, lng: -0.1278, value: 96 }, // London
      { lat: 35.6762, lng: 139.6503, value: 93 }, // Tokyo
      { lat: 48.8566, lng: 2.3522, value: 92 }, // Paris
      { lat: 52.5200, lng: 13.4050, value: 94 }, // Berlin
      { lat: 39.9042, lng: 116.4074, value: 75 }, // Beijing
      { lat: 28.7041, lng: 77.1025, value: 45 }, // Delhi
      { lat: 19.0760, lng: 72.8777, value: 65 }, // Mumbai
      { lat: -33.8688, lng: 151.2093, value: 89 }, // Sydney
      { lat: 43.6532, lng: -79.3832, value: 91 }, // Toronto
      { lat: 55.7558, lng: 37.6176, value: 82 }, // Moscow
      { lat: 25.7617, lng: -80.1918, value: 88 }, // Miami
      { lat: 34.0522, lng: -118.2437, value: 90 }, // Los Angeles
    ];
    
    return regions;
  }

  private generateAirQualityData() {
    // Air Quality Index (AQI) data
    const regions = [
      { lat: 40.7128, lng: -74.0060, value: 85 }, // New York
      { lat: 37.7749, lng: -122.4194, value: 65 }, // San Francisco
      { lat: 51.5074, lng: -0.1278, value: 75 }, // London
      { lat: 35.6762, lng: 139.6503, value: 95 }, // Tokyo
      { lat: 48.8566, lng: 2.3522, value: 80 }, // Paris
      { lat: 52.5200, lng: 13.4050, value: 70 }, // Berlin
      { lat: 39.9042, lng: 116.4074, value: 180 }, // Beijing
      { lat: 28.7041, lng: 77.1025, value: 220 }, // Delhi
      { lat: 19.0760, lng: 72.8777, value: 165 }, // Mumbai
      { lat: -33.8688, lng: 151.2093, value: 45 }, // Sydney
      { lat: 43.6532, lng: -79.3832, value: 55 }, // Toronto
      { lat: 55.7558, lng: 37.6176, value: 120 }, // Moscow
      { lat: 25.7617, lng: -80.1918, value: 60 }, // Miami
      { lat: 34.0522, lng: -118.2437, value: 110 }, // Los Angeles
    ];
    
    return regions;
  }

  private generateSocialMediaData() {
    // Social media activity intensity
    const regions = [
      { lat: 40.7128, lng: -74.0060, value: 95 }, // New York
      { lat: 37.7749, lng: -122.4194, value: 98 }, // San Francisco
      { lat: 51.5074, lng: -0.1278, value: 88 }, // London
      { lat: 35.6762, lng: 139.6503, value: 85 }, // Tokyo
      { lat: 48.8566, lng: 2.3522, value: 82 }, // Paris
      { lat: 52.5200, lng: 13.4050, value: 78 }, // Berlin
      { lat: 39.9042, lng: 116.4074, value: 70 }, // Beijing
      { lat: 28.7041, lng: 77.1025, value: 75 }, // Delhi
      { lat: 19.0760, lng: 72.8777, value: 80 }, // Mumbai
      { lat: -33.8688, lng: 151.2093, value: 85 }, // Sydney
      { lat: 43.6532, lng: -79.3832, value: 87 }, // Toronto
      { lat: 55.7558, lng: 37.6176, value: 65 }, // Moscow
      { lat: 25.7617, lng: -80.1918, value: 90 }, // Miami
      { lat: 34.0522, lng: -118.2437, value: 92 }, // Los Angeles
    ];
    
    return regions;
  }

  getCountryFromCoordinates(lat: number, lng: number): string | null {
    // Simple country detection based on coordinates
    // In production, use a proper geocoding service
    for (const [code, profile] of this.countryProfiles) {
      const bounds = profile.bounds;
      if (lat >= bounds.south && lat <= bounds.north && 
          lng >= bounds.west && lng <= bounds.east) {
        return code;
      }
    }
    
    // Fallback for common regions
    if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return "US"; // Continental US
    if (lat >= 30 && lat <= 54 && lng >= 73 && lng <= 135) return "CN"; // China
    if (lat >= 30 && lat <= 46 && lng >= 129 && lng <= 146) return "JP"; // Japan
    if (lat >= 49 && lat <= 61 && lng >= -8 && lng <= 2) return "GB"; // UK
    if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) return "IN"; // India
    if (lat >= 42 && lat <= 51 && lng >= -5 && lng <= 10) return "FR"; // France
    if (lat >= 47 && lat <= 55 && lng >= 5 && lng <= 15) return "DE"; // Germany
    
    return null;
  }
}

export const countryService = new CountryService();