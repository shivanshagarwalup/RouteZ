export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  weight: number;
}
export interface RiskResult {
  level: string;
  score: number;
  factors: string[];
}
