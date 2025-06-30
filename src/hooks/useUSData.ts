import { useState, useEffect, useCallback } from 'react';
import { Disaster, NewsArticle, TourismSpot } from '../types/data';
import { generateMockData } from '../services/mockDataService';
import { realApiService } from '../services/apiService';

export const useUSData = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [tourism, setTourism] = useState<TourismSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [useRealData, setUseRealData] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (useRealData) {
        // Try to fetch real data from APIs
        console.log('Fetching real data from APIs...');
        
        const [
          earthquakeData,
          weatherAlerts,
          weatherData,
          newsData,
          nationalParks
        ] = await Promise.allSettled([
          realApiService.fetchUSGSEarthquakes(),
          realApiService.fetchWeatherAlerts(),
          realApiService.fetchWeatherData(),
          realApiService.fetchNewsAPI(),
          realApiService.fetchNationalParks()
        ]);

        // Combine real disaster data
        const realDisasters: Disaster[] = [];
        if (earthquakeData.status === 'fulfilled') realDisasters.push(...earthquakeData.value);
        if (weatherAlerts.status === 'fulfilled') realDisasters.push(...weatherAlerts.value);
        if (weatherData.status === 'fulfilled') realDisasters.push(...weatherData.value);

        // Use real news data if available
        const realNews: NewsArticle[] = newsData.status === 'fulfilled' ? newsData.value : [];

        // Use real tourism data if available
        const realTourism: TourismSpot[] = nationalParks.status === 'fulfilled' ? nationalParks.value : [];

        // If we got some real data, use it; otherwise fall back to mock data
        if (realDisasters.length > 0 || realNews.length > 0 || realTourism.length > 0) {
          // Supplement with mock data if needed
          const mockData = generateMockData();
          
          setDisasters(realDisasters.length > 0 ? realDisasters : mockData.disasters);
          setNews(realNews.length > 0 ? realNews : mockData.news);
          setTourism(realTourism.length > 0 ? realTourism : mockData.tourism);
          
          console.log(`Loaded real data: ${realDisasters.length} disasters, ${realNews.length} news, ${realTourism.length} tourism`);
        } else {
          // Fall back to mock data
          console.log('No real data available, using mock data');
          const mockData = generateMockData();
          setDisasters(mockData.disasters);
          setNews(mockData.news);
          setTourism(mockData.tourism);
        }
      } else {
        // Use comprehensive mock data
        console.log('Using comprehensive mock data...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const mockData = generateMockData();
        setDisasters(mockData.disasters);
        setNews(mockData.news);
        setTourism(mockData.tourism);
        
        console.log(`Generated mock data: ${mockData.disasters.length} disasters, ${mockData.news.length} news, ${mockData.tourism.length} tourism`);
      }
      
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fall back to mock data on error
      const mockData = generateMockData();
      setDisasters(mockData.disasters);
      setNews(mockData.news);
      setTourism(mockData.tourism);
    } finally {
      setIsLoading(false);
    }
  }, [useRealData]);

  // Toggle between real and mock data
  const toggleDataSource = useCallback(() => {
    setUseRealData(prev => !prev);
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh every 10 minutes for real data, 5 minutes for mock data
  useEffect(() => {
    const interval = setInterval(refreshData, useRealData ? 10 * 60 * 1000 : 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshData, useRealData]);

  return {
    disasters,
    news,
    tourism,
    isLoading,
    lastUpdated,
    refreshData,
    useRealData,
    toggleDataSource
  };
};