export interface Location {
  lat: number;
  lng: number;
  state: string;
  city?: string;
  county?: string;
}

export interface Disaster {
  id: string;
  type: DisasterType;
  title: string;
  description: string;
  location: Location;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  affectedPeople?: number;
  economicImpact?: number;
  status: 'active' | 'contained' | 'resolved';
  source?: string;
}

export type DisasterType = 
  | 'earthquake' 
  | 'wildfire' 
  | 'hurricane' 
  | 'tornado' 
  | 'flood' 
  | 'drought' 
  | 'winter_storm' 
  | 'heat_wave';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  author?: string;
  location: Location;
  category: NewsCategory;
  trending: boolean;
  localRelevance: number; // 1-10 scale
}

export type NewsCategory = 
  | 'breaking' 
  | 'politics' 
  | 'business' 
  | 'technology' 
  | 'health' 
  | 'sports' 
  | 'entertainment' 
  | 'weather';

export interface TourismSpot {
  id: string;
  name: string;
  description: string;
  location: Location;
  category: TourismCategory;
  rating: number; // 1-5 stars
  visitorsPerYear?: number;
  entryFee?: number;
  openingHours?: string;
  website?: string;
  imageUrl?: string;
  amenities: string[];
  bestTimeToVisit: string[];
}

export type TourismCategory = 
  | 'national_park' 
  | 'monument' 
  | 'museum' 
  | 'beach' 
  | 'mountain' 
  | 'city_attraction' 
  | 'historical_site' 
  | 'entertainment' 
  | 'shopping' 
  | 'restaurant';

export interface StateInfo {
  code: string;
  name: string;
  capital: string;
  population: number;
  area: number; // square miles
  founded: string;
  nickname: string;
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
  economy: {
    gdp: number;
    majorIndustries: string[];
    unemploymentRate: number;
  };
  demographics: {
    medianAge: number;
    medianIncome: number;
    educationLevel: string;
  };
  climate: {
    averageTemp: number;
    rainfall: number;
    climate: string;
  };
}

export interface FilterState {
  disasters: {
    types: DisasterType[];
    severities: ('low' | 'medium' | 'high' | 'critical')[];
    status: ('active' | 'contained' | 'resolved')[];
    dateRange: { start: string; end: string };
  };
  news: {
    categories: NewsCategory[];
    trending: boolean;
    localOnly: boolean;
    dateRange: { start: string; end: string };
  };
  tourism: {
    categories: TourismCategory[];
    rating: number; // minimum rating
    priceRange: { min: number; max: number };
  };
}

export type ViewMode = 'disasters' | 'news' | 'tourism' | 'overview';
export type ZoomLevel = 'country' | 'state' | 'city';