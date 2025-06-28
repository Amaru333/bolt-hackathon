import { Catastrophe } from '../types/catastrophe';
import { USGSResponse, NASAFire, WeatherAlert, APIError } from '../types/api';

class APIService {
  private baseURLs = {
    usgs: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary',
    nasa: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
    weather: 'https://api.weather.gov/alerts/active'
  };

  private proxyURL = 'https://api.allorigins.win/raw?url=';

  async fetchEarthquakes(timeframe: string = 'day'): Promise<Catastrophe[]> {
    try {
      const magnitudes = ['significant', '4.5', '2.5', '1.0', 'all'];
      const timeframes = ['hour', 'day', 'week', 'month'];
      
      const magnitude = magnitudes.includes(timeframe) ? timeframe : '2.5';
      const period = timeframes.includes(timeframe) ? timeframe : 'day';
      
      const url = `${this.baseURLs.usgs}/${magnitude}_${period}.geojson`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`);
      }
      
      const data: USGSResponse = await response.json();
      
      return data.features.map((earthquake): Catastrophe => {
        const [lng, lat, depth] = earthquake.geometry.coordinates;
        const magnitude = earthquake.properties.mag;
        
        let severity: 'low' | 'medium' | 'high' | 'critical';
        if (magnitude >= 7) severity = 'critical';
        else if (magnitude >= 6) severity = 'high';
        else if (magnitude >= 4) severity = 'medium';
        else severity = 'low';

        // Estimate affected people based on magnitude and population density
        const affectedPeople = this.estimateEarthquakeImpact(magnitude);
        
        return {
          id: earthquake.id,
          type: 'earthquake',
          title: `M${magnitude.toFixed(1)} Earthquake`,
          description: earthquake.properties.place || 'Earthquake detected',
          location: {
            lat,
            lng,
            country: this.extractCountryFromPlace(earthquake.properties.place),
            region: this.extractRegionFromPlace(earthquake.properties.place)
          },
          severity,
          date: new Date(earthquake.properties.time).toISOString(),
          affectedPeople,
          economicImpact: this.estimateEconomicImpact(magnitude, 'earthquake'),
          status: this.getEarthquakeStatus(earthquake.properties.time)
        };
      });
    } catch (error) {
      console.error('Error fetching earthquakes:', error);
      throw new APIError('USGS', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async fetchWildfires(): Promise<Catastrophe[]> {
    try {
      // Using NASA FIRMS API for active fire data
      // Note: This requires API key for full access, using sample data approach
      const mockFires: Catastrophe[] = await this.fetchMockFireData();
      return mockFires;
    } catch (error) {
      console.error('Error fetching wildfire data:', error);
      throw new APIError('NASA FIRMS', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async fetchWeatherAlerts(): Promise<Catastrophe[]> {
    try {
      // US National Weather Service API
      const response = await fetch(`${this.proxyURL}${encodeURIComponent(this.baseURLs.weather)}`);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      const alerts = data.features || [];
      
      return alerts.slice(0, 20).map((alert: any): Catastrophe => {
        const properties = alert.properties;
        const geometry = alert.geometry;
        
        // Extract coordinates from polygon (use centroid)
        const coordinates = this.getCentroidFromGeometry(geometry);
        
        let type: Catastrophe['type'] = 'accident';
        const event = properties.event?.toLowerCase() || '';
        
        if (event.includes('hurricane') || event.includes('tropical')) type = 'hurricane';
        else if (event.includes('tornado')) type = 'tornado';
        else if (event.includes('flood')) type = 'flood';
        else if (event.includes('fire')) type = 'fire';
        else if (event.includes('drought')) type = 'drought';
        
        let severity: 'low' | 'medium' | 'high' | 'critical';
        const severityLevel = properties.severity?.toLowerCase();
        if (severityLevel === 'extreme') severity = 'critical';
        else if (severityLevel === 'severe') severity = 'high';
        else if (severityLevel === 'moderate') severity = 'medium';
        else severity = 'low';
        
        return {
          id: alert.id || `weather-${Date.now()}-${Math.random()}`,
          type,
          title: properties.event || 'Weather Alert',
          description: properties.headline || properties.description || 'Weather alert issued',
          location: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            country: 'United States',
            region: properties.areaDesc?.split(',')[0] || 'Unknown'
          },
          severity,
          date: properties.effective || properties.sent || new Date().toISOString(),
          affectedPeople: this.estimateWeatherImpact(properties.areaDesc),
          economicImpact: this.estimateEconomicImpact(severity === 'critical' ? 7 : 5, type),
          status: this.getWeatherStatus(properties.expires)
        };
      });
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw new APIError('Weather.gov', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async fetchGlobalDisasters(): Promise<Catastrophe[]> {
    try {
      // Combine all data sources
      const [earthquakes, fires, weather] = await Promise.allSettled([
        this.fetchEarthquakes(),
        this.fetchWildfires(),
        this.fetchWeatherAlerts()
      ]);

      const allData: Catastrophe[] = [];

      if (earthquakes.status === 'fulfilled') {
        allData.push(...earthquakes.value);
      }
      if (fires.status === 'fulfilled') {
        allData.push(...fires.value);
      }
      if (weather.status === 'fulfilled') {
        allData.push(...weather.value);
      }

      // Sort by date (most recent first)
      return allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching global disasters:', error);
      return [];
    }
  }

  private async fetchMockFireData(): Promise<Catastrophe[]> {
    // Mock fire data based on common fire-prone areas
    const fireHotspots = [
      { lat: 34.0522, lng: -118.2437, region: 'California', country: 'United States' },
      { lat: -25.2744, lng: 133.7751, region: 'Northern Territory', country: 'Australia' },
      { lat: -14.2350, lng: -51.9253, region: 'Mato Grosso', country: 'Brazil' },
      { lat: 61.5240, lng: 105.3188, region: 'Siberia', country: 'Russia' },
      { lat: 49.2827, lng: -123.1207, region: 'British Columbia', country: 'Canada' }
    ];

    return fireHotspots.map((location, index): Catastrophe => ({
      id: `fire-${index}`,
      type: 'fire',
      title: `Active Wildfire - ${location.region}`,
      description: `Wildfire detected in ${location.region}, ${location.country}`,
      location,
      severity: Math.random() > 0.5 ? 'high' : 'medium',
      date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      affectedPeople: Math.floor(Math.random() * 50000) + 1000,
      economicImpact: Math.floor(Math.random() * 500000000) + 10000000,
      status: Math.random() > 0.3 ? 'active' : 'contained'
    }));
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
    const population = areaDesc?.toLowerCase().includes('county') ? 50000 : 10000;
    return Math.floor(Math.random() * population) + 1000;
  }

  private estimateEconomicImpact(magnitude: number, type: string): number {
    const baseImpact = type === 'earthquake' ? magnitude * 50000000 : 25000000;
    return Math.floor(baseImpact + Math.random() * baseImpact);
  }

  private extractCountryFromPlace(place: string): string {
    if (!place) return 'Unknown';
    
    const countryPatterns = {
      'CA': 'United States',
      'Alaska': 'United States',
      'Hawaii': 'United States',
      'Japan': 'Japan',
      'Chile': 'Chile',
      'Indonesia': 'Indonesia',
      'Turkey': 'Turkey',
      'Greece': 'Greece',
      'Italy': 'Italy',
      'Mexico': 'Mexico',
      'Peru': 'Peru',
      'Philippines': 'Philippines',
      'Iran': 'Iran',
      'China': 'China'
    };

    for (const [pattern, country] of Object.entries(countryPatterns)) {
      if (place.includes(pattern)) return country;
    }

    return 'Unknown';
  }

  private extractRegionFromPlace(place: string): string {
    if (!place) return 'Unknown';
    return place.split(',')[0]?.trim() || 'Unknown';
  }

  private getEarthquakeStatus(timestamp: number): 'active' | 'contained' | 'resolved' {
    const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (hoursSince < 24) return 'active';
    if (hoursSince < 72) return 'contained';
    return 'resolved';
  }

  private getWeatherStatus(expires: string): 'active' | 'contained' | 'resolved' {
    if (!expires) return 'active';
    const expiryTime = new Date(expires).getTime();
    return expiryTime > Date.now() ? 'active' : 'resolved';
  }

  private getCentroidFromGeometry(geometry: any): { lat: number; lng: number } {
    if (!geometry || !geometry.coordinates) {
      return { lat: 39.8283, lng: -98.5795 }; // Center of US as fallback
    }

    try {
      const coords = geometry.coordinates[0];
      if (Array.isArray(coords) && coords.length > 0) {
        let totalLat = 0;
        let totalLng = 0;
        let count = 0;

        coords.forEach((coord: number[]) => {
          if (Array.isArray(coord) && coord.length >= 2) {
            totalLng += coord[0];
            totalLat += coord[1];
            count++;
          }
        });

        if (count > 0) {
          return {
            lat: totalLat / count,
            lng: totalLng / count
          };
        }
      }
    } catch (error) {
      console.warn('Error calculating centroid:', error);
    }

    return { lat: 39.8283, lng: -98.5795 };
  }
}

export const apiService = new APIService();
export { APIError };