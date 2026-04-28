import axios from 'axios';
import { RiskAnalysisResult } from '@/services/aiService';

export interface OptimizationResult {
  best_route: string;
  alternative_route: string;
  time_saved: string;
  risk_reduction: string;
  reasoning: string;
  waypoints: string[];
}

export const optimizeRoute = async (
  source: string,
  destination: string,
  riskData: RiskAnalysisResult
): Promise<OptimizationResult> => {
  console.log('[Workflow] optimizeRoute called with:', { source, destination, riskLevel: riskData.risk_level });
  const response = await axios.post('/api/optimize', {
    source,
    destination,
    riskData
  });
  console.log('[Workflow] optimizeRoute received response:', response.data);
  return response.data;
};
