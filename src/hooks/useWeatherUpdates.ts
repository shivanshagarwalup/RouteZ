import { useState, useEffect, useCallback } from 'react';

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  visibility: number;
  pressure: number;
  updatedAt: string;
}

export const useWeatherUpdates = (
  city: string,
  refreshInterval: number = 300000
) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      setWeather(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    if (!city) return;
    
    fetchWeather();
    
    const interval = setInterval(fetchWeather, refreshInterval);
    
    return () => clearInterval(interval);
  }, [city, fetchWeather, refreshInterval]);

  return { weather, loading, error, lastUpdated, refetch: fetchWeather };
};
