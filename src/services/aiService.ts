import axios from 'axios';
import { WeatherData } from './weatherService';

export interface RiskAnalysisResult {
  risk_level: 'Low' | 'Medium' | 'High';
  risk_score: number;
  factors: string[];
  recommendation: string;
  estimated_delay: string;
  confidence: number;
}

export const analyzeRisk = async (
  source: string,
  destination: string,
  weather: any,
  distance: number,
  shipmentType: string
): Promise<RiskAnalysisResult> => {
  const response = await axios.post('/api/analyze', {
    source,
    destination,
    srcWeather: weather, // Mapping to the API's expected field
    distance,
    shipmentType
  });
  return response.data;
};
