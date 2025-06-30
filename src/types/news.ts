export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  author?: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  trendingScore: number; // 1-100 scale
  category: string;
  language: string;
}

export interface NewsFilterState {
  categories: string[];
  trendingThreshold: number;
  dateRange: {
    start: string;
    end: string;
  };
  countries: string[];
  showTopTrending: boolean;
}