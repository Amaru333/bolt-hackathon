export interface CountryProfile {
  code: string;
  name: string;
  capital: string;
  population: number;
  gdp: number;
  currency: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  government: {
    type: string;
    leader: string;
  };
  economy: {
    gdpPerCapita: number;
    unemploymentRate: number;
    inflationRate: number;
  };
  demographics: {
    lifeExpectancy: number;
    literacyRate: number;
    urbanPopulation: number;
  };
  infrastructure: {
    internetPenetration: number;
    mobilePenetration: number;
    electricityAccess: number;
  };
}

export interface EconomicData {
  countryCode: string;
  stockMarket: {
    index: string;
    value: number;
    change: number;
    changePercent: number;
  };
  currency: {
    code: string;
    rate: number;
    change: number;
  };
  commodities: {
    oil: number;
    gold: number;
    wheat: number;
  };
  tradeData: {
    exports: number;
    imports: number;
    tradeBalance: number;
  };
}

export interface SocialMediaTrend {
  id: string;
  platform: string;
  hashtag: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  category: string;
  timestamp: string;
}

export interface TransportationData {
  flights: FlightData[];
  shipping: ShippingData[];
  infrastructure: InfrastructureStatus[];
}

export interface FlightData {
  id: string;
  flightNumber: string;
  airline: string;
  origin: {
    code: string;
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    code: string;
    name: string;
    lat: number;
    lng: number;
  };
  status: 'on-time' | 'delayed' | 'cancelled' | 'diverted';
  delay?: number;
  reason?: string;
}

export interface ShippingData {
  id: string;
  vesselName: string;
  type: 'cargo' | 'tanker' | 'container' | 'passenger';
  origin: string;
  destination: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'delayed' | 'anchored' | 'in-port';
  cargo?: string;
}

export interface InfrastructureStatus {
  id: string;
  type: 'power' | 'internet' | 'transport' | 'water';
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  status: 'operational' | 'disrupted' | 'maintenance' | 'offline';
  affectedPopulation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedRepair?: string;
}

export interface PredictiveAnalytics {
  riskAssessment: RiskPrediction[];
  trendAnalysis: TrendPrediction[];
  correlationInsights: CorrelationData[];
}

export interface RiskPrediction {
  id: string;
  type: 'earthquake' | 'hurricane' | 'flood' | 'drought' | 'wildfire';
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  probability: number; // 0-100
  timeframe: string; // e.g., "next 30 days"
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  factors: string[];
}

export interface TrendPrediction {
  id: string;
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  magnitude: number;
  timeframe: string;
  description: string;
  regions: string[];
}

export interface CorrelationData {
  id: string;
  event1: string;
  event2: string;
  correlation: number; // -1 to 1
  description: string;
  examples: string[];
}

export interface DataLayer {
  id: string;
  name: string;
  type: 'heatmap' | 'choropleth' | 'points' | 'lines';
  category: 'demographic' | 'economic' | 'environmental' | 'infrastructure' | 'social';
  data: any[];
  visible: boolean;
  opacity: number;
  colorScale: string[];
}