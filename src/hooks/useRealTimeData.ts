import { useState, useEffect, useCallback } from "react";
import { Catastrophe } from "../types/catastrophe";
import { DataFetchStatus, APIError } from "../types/api";
import { apiService } from "../services/apiService";

export const useRealTimeData = (refreshInterval: number = 300000) => {
  // 5 minutes default
  const [catastrophes, setCatastrophes] = useState<Catastrophe[]>([]);
  const [status, setStatus] = useState<DataFetchStatus>({
    earthquakes: "idle",
    fires: "idle",
    weather: "idle",
    volcanoes: "idle",
    tsunamis: "idle",
    airQuality: "idle",
    news: "idle",
    lastUpdated: {},
    errors: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setStatus((prev) => ({
      ...prev,
      earthquakes: "loading",
      fires: "loading",
      weather: "loading",
      volcanoes: "loading",
      tsunamis: "loading",
      airQuality: "loading",
      news: "loading",
      errors: [],
    }));

    try {
      const [earthquakes, fires, weatherAlerts, volcanoes, tsunamis, airQuality, news, weatherData] = await Promise.allSettled([
        apiService.fetchEarthquakes(),
        apiService.fetchWildfires(),
        apiService.fetchWeatherAlerts(),
        apiService.fetchVolcanicActivity(),
        apiService.fetchTsunamiWarnings(),
        apiService.fetchAirQualityData(),
        apiService.fetchDisasterNews(),
        apiService.fetchWeatherData(),
      ]);

      const allData: Catastrophe[] = [];

      if (earthquakes.status === "fulfilled") allData.push(...earthquakes.value);
      if (fires.status === "fulfilled") allData.push(...fires.value);
      if (weatherAlerts.status === "fulfilled") allData.push(...weatherAlerts.value);
      if (volcanoes.status === "fulfilled") allData.push(...volcanoes.value);
      if (tsunamis.status === "fulfilled") allData.push(...tsunamis.value);
      if (airQuality.status === "fulfilled") allData.push(...airQuality.value);
      if (news.status === "fulfilled") allData.push(...news.value);
      if (weatherData.status === "fulfilled") allData.push(...weatherData.value);

      setCatastrophes(allData);

      setStatus((prev) => ({
        ...prev,
        earthquakes: "success",
        fires: "success",
        weather: "success",
        volcanoes: "success",
        tsunamis: "success",
        airQuality: "success",
        news: "success",
        lastUpdated: {
          earthquakes: Date.now(),
          fires: Date.now(),
          weather: Date.now(),
          volcanoes: Date.now(),
          tsunamis: Date.now(),
          airQuality: Date.now(),
          news: Date.now(),
        },
      }));
    } catch (error) {
      const apiError: APIError = {
        source: "Global",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      setStatus((prev) => ({
        ...prev,
        earthquakes: "error",
        fires: "error",
        weather: "error",
        volcanoes: "error",
        tsunamis: "error",
        airQuality: "error",
        news: "error",
        errors: [apiError],
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEarthquakesOnly = useCallback(async () => {
    setStatus((prev) => ({ ...prev, earthquakes: "loading" }));

    try {
      const earthquakes = await apiService.fetchEarthquakes();
      setCatastrophes((prev) => [...prev.filter((c) => c.type !== "earthquake"), ...earthquakes]);

      setStatus((prev) => ({
        ...prev,
        earthquakes: "success",
        lastUpdated: { ...prev.lastUpdated, earthquakes: Date.now() },
      }));
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        earthquakes: "error",
        errors: [
          ...prev.errors,
          {
            source: "USGS",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
          },
        ],
      }));
    }
  }, []);

  const fetchWeatherOnly = useCallback(async () => {
    setStatus((prev) => ({ ...prev, weather: "loading" }));

    try {
      const weather = await apiService.fetchWeatherAlerts();
      setCatastrophes((prev) => [...prev.filter((c) => !["hurricane", "tornado", "flood"].includes(c.type)), ...weather]);

      setStatus((prev) => ({
        ...prev,
        weather: "success",
        lastUpdated: { ...prev.lastUpdated, weather: Date.now() },
      }));
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        weather: "error",
        errors: [
          ...prev.errors,
          {
            source: "Weather.gov",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
          },
        ],
      }));
    }
  }, []);

  const clearErrors = useCallback(() => {
    setStatus((prev) => ({ ...prev, errors: [] }));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    catastrophes,
    status,
    isLoading,
    fetchData,
    fetchEarthquakesOnly,
    fetchWeatherOnly,
    clearErrors,
    lastUpdated: status.lastUpdated,
  };
};
