import { useState, useEffect, useCallback } from 'react';
import { Catastrophe } from '../types/catastrophe';
import { DataFetchStatus, APIError } from '../types/api';
import { apiService } from '../services/apiService';

export const useRealTimeData = (refreshInterval: number = 300000) => { // 5 minutes default
  const [catastrophes, setCatastrophes] = useState<Catastrophe[]>([]);
  const [status, setStatus] = useState<DataFetchStatus>({
    earthquakes: 'idle',
    fires: 'idle',
    weather: 'idle',
    lastUpdated: {},
    errors: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setStatus(prev => ({
      ...prev,
      earthquakes: 'loading',
      fires: 'loading',
      weather: 'loading',
      errors: []
    }));

    try {
      const data = await apiService.fetchGlobalDisasters();
      setCatastrophes(data);
      
      setStatus(prev => ({
        ...prev,
        earthquakes: 'success',
        fires: 'success',
        weather: 'success',
        lastUpdated: {
          earthquakes: Date.now(),
          fires: Date.now(),
          weather: Date.now()
        }
      }));
    } catch (error) {
      const apiError: APIError = {
        source: 'Global',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };

      setStatus(prev => ({
        ...prev,
        earthquakes: 'error',
        fires: 'error',
        weather: 'error',
        errors: [apiError]
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEarthquakesOnly = useCallback(async () => {
    setStatus(prev => ({ ...prev, earthquakes: 'loading' }));
    
    try {
      const earthquakes = await apiService.fetchEarthquakes();
      setCatastrophes(prev => [
        ...prev.filter(c => c.type !== 'earthquake'),
        ...earthquakes
      ]);
      
      setStatus(prev => ({
        ...prev,
        earthquakes: 'success',
        lastUpdated: { ...prev.lastUpdated, earthquakes: Date.now() }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        earthquakes: 'error',
        errors: [...prev.errors, {
          source: 'USGS',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        }]
      }));
    }
  }, []);

  const fetchWeatherOnly = useCallback(async () => {
    setStatus(prev => ({ ...prev, weather: 'loading' }));
    
    try {
      const weather = await apiService.fetchWeatherAlerts();
      setCatastrophes(prev => [
        ...prev.filter(c => !['hurricane', 'tornado', 'flood'].includes(c.type)),
        ...weather
      ]);
      
      setStatus(prev => ({
        ...prev,
        weather: 'success',
        lastUpdated: { ...prev.lastUpdated, weather: Date.now() }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        weather: 'error',
        errors: [...prev.errors, {
          source: 'Weather.gov',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        }]
      }));
    }
  }, []);

  const clearErrors = useCallback(() => {
    setStatus(prev => ({ ...prev, errors: [] }));
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
    lastUpdated: status.lastUpdated
  };
};