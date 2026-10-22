export type StoreFormat = 'Market' | 'Express' | 'To-Go';

export type StoreCluster = 
  | 'Tourist Villa Hotspot'
  | 'Expat Lifestyle Haven'
  | 'Urban Commercial Hub'
  | 'Local Residential / Transit'
  | 'Coastal Resort Corridor';

export type IslandRegion = 'Badung' | 'Denpasar' | 'Gianyar' | 'Tabanan' | 'Buleleng' | 'Lombok';

export interface OutletData {
  id: string;
  category: StoreFormat;
  name: string;
  address: string;
  lat: number;
  lng: number;
  region: IslandRegion;
  villas: number;
  sportsArenas: number;
  beautyClinics: number;
  spas: number;
  cafes: number;
  restaurants: number;
  totalPOIs: number;
  cluster: StoreCluster;
  openedYear: number;
  averageBasketSizeIDR: number; // in IDR
  dailyTransactions: number;
}

export interface DerivedMetrics {
  cafeToVillaRatio: number;
  tourismDensityIndex: number; // 0 - 100
  lifestyleQuotient: number; // 0 - 100
  wellnessScore: number;
  competitorIndex: number;
  recommendedAssortment: string[];
}

export interface CannibalizationPair {
  storeA: OutletData;
  storeB: OutletData;
  distanceKm: number;
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  overlapPercentage: number;
  recommendedAction: string;
}

export interface HotspotPoint {
  id: string;
  outletId: string;
  name: string;
  lat: number;
  lng: number;
  totalPOIs: number;
  giZScore: number;
  giPValue: number;
  classification: 'Hot Spot (99% Conf)' | 'Hot Spot (95% Conf)' | 'Hot Spot (90% Conf)' | 'Not Significant' | 'Cold Spot (90% Conf)' | 'Cold Spot (95% Conf)';
  color: string;
}

export interface SimulatorCandidate {
  id: string;
  title: string;
  format: StoreFormat;
  lat: number;
  lng: number;
  region: IslandRegion;
  radiusKm: number;
  weights: {
    villas: number;
    cafes: number;
    restaurants: number;
    wellness: number;
    cannibalizationPenalty: number;
  };
  estimatedVillas: number;
  estimatedSports: number;
  estimatedBeauty: number;
  estimatedSpas: number;
  estimatedCafes: number;
  estimatedRestaurants: number;
  estimatedTotalPOIs: number;
  nearestStoreName: string;
  nearestStoreDistKm: number;
  nearestStoreFormat: StoreFormat;
  cannibalizationRisk: 'Critical' | 'High' | 'Moderate' | 'Low';
  viabilityScore: number; // 0 - 100
  ecosystemScore: number; // 0 - 100
  cannibalizationScore: number; // 0 - 100
  verdict: string;
  recommendedAssortment: string[];
  notes?: string;
  createdAt: string;
}

export type BaseMapStyle = 'dark' | 'light' | 'satellite' | 'street';

export type ProportionalMetric = 'totalPOIs' | 'villas' | 'cafes' | 'spas' | 'restaurants' | 'fixed';
