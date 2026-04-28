import axios from 'axios';

export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  city: string;
  feelsLike: number;
  visibility: number;
}

export const getWeather = async (city: string): Promise<WeatherData> => {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) throw new Error('Weather API key not found');
  
  const response = await axios.get(
    'https://api.openweathermap.org/data/2.5/weather',
    {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric'
      },
      timeout: 8000
    }
  );
  
  return {
    condition: response.data.weather[0].description,
    temperature: Math.round(response.data.main.temp),
    humidity: response.data.main.humidity,
    windSpeed: Math.round(response.data.wind.speed * 3.6), // Convert m/s to km/h
    icon: response.data.weather[0].icon,
    city: response.data.name,
    feelsLike: Math.round(response.data.main.feels_like),
    visibility: Math.round(response.data.visibility / 1000) // Convert m to km
  };
};

export const getForecast = async (city: string) => {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) throw new Error('Weather API key not found');
  
  const response = await axios.get(
    'https://api.openweathermap.org/data/2.5/forecast',
    {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
        cnt: 5
      }
    }
  );
  
  return response.data.list.map((item: any) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
    condition: item.weather[0].description,
    icon: item.weather[0].icon
  }));
};
