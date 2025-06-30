import { useState, useEffect, useCallback } from "react";
import { NewsArticle } from "../types/news";
import { newsService } from "../services/newsService";

export const useNewsData = (refreshInterval: number = 600000) => { // 10 minutes default
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newsData = await newsService.fetchTrendingNews();
      setNews(newsData);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error("Error fetching news:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchNews, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchNews, refreshInterval]);

  return {
    news,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchNews,
  };
};