import type { WeatherSummary } from "./geoWeather";

export interface Recommendation {
  outfit: string;
  packingList: string[];
  notes: string;
}

export interface OutfitResponse {
  zip: string;
  lat: number;
  lon: number;
  weather: WeatherSummary;
  recommendation: Recommendation;
}
