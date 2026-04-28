import { analyzeRisk, RiskAnalysisResult } from '@/services/aiService';
import { WeatherData } from '@/services/weatherService';

export const predictRisk = async (
  source: string,
  destination: string,
  weather: any,
  distance: number,
  shipmentType: string
): Promise<RiskAnalysisResult> => {
  return await analyzeRisk(source, destination, weather, distance, shipmentType);
};
