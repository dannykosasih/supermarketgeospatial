import { Delaunay } from 'd3-delaunay';
import { 
  OutletData, 
  DerivedMetrics, 
  CannibalizationPair, 
  HotspotPoint, 
  SimulatorCandidate, 
  StoreFormat,
  IslandRegion 
} from '../types';

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula (in km)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Calculates derived ratios and indices for an outlet
 */
export function calculateDerivedMetrics(outlet: OutletData): DerivedMetrics {
  const cafeToVillaRatio = outlet.villas > 0 
    ? Math.round((outlet.cafes / outlet.villas) * 100) / 100 
    : 0;

  // Tourism Density Index (0 - 100)
  // Higher weight on villas and spas indicates tourist accommodation and wellness ecosystem
  const tourismDensityIndex = Math.min(
    100,
    Math.max(
      15,
      Math.round(
        (outlet.villas * 0.22 + outlet.spas * 0.35 + outlet.cafes * 0.18 + outlet.restaurants * 0.12) / 1.5
      )
    )
  );

  // Lifestyle Quotient (0 - 100)
  // Reflects high-end consumer discretionary density (gyms, aesthetic clinics, cafes, dining)
  const lifestyleQuotient = Math.min(
    100,
    Math.max(
      20,
      Math.round(
        (outlet.sportsArenas * 1.8 + outlet.beautyClinics * 2.2 + outlet.cafes * 0.25 + outlet.restaurants * 0.15)
      )
    )
  );

  const wellnessScore = Math.min(
    100,
    Math.round(outlet.spas * 1.1 + outlet.sportsArenas * 1.8 + outlet.beautyClinics * 1.4)
  );

  // Competitor Index (saturation measure)
  const competitorIndex = Math.min(
    100,
    Math.round((outlet.totalPOIs / 750) * 100)
  );

  // Assortment recommendations according to cluster and metrics
  const recommendedAssortment: string[] = [];
  if (tourismDensityIndex > 65) {
    recommendedAssortment.push('Imported Cheeses & Charcuterie (France/Italy/Australia)');
    recommendedAssortment.push('Premium International Wines & Single Malt Spirits');
    recommendedAssortment.push('Organic Superfoods & Artisan Bakery');
  } else if (lifestyleQuotient > 60) {
    recommendedAssortment.push('Cold-Pressed Juices, Kombucha & Plant-Based Protein');
    recommendedAssortment.push('Gourmet Ready-to-Heat Meals & Salad Bar');
    recommendedAssortment.push('Specialty Coffee Beans & Barista Dairy Alternatives');
  } else {
    recommendedAssortment.push('Pantry Staples & Value Pack Family Household Goods');
    recommendedAssortment.push('Fresh Farm Produce & Local Butchery');
    recommendedAssortment.push('Everyday Personal Care & Dairy Essentials');
  }

  return {
    cafeToVillaRatio,
    tourismDensityIndex,
    lifestyleQuotient,
    wellnessScore,
    competitorIndex,
    recommendedAssortment
  };
}

/**
 * Computes trade area overlap and cannibalization risk between all store pairs
 */
export function computeCannibalizationMatrix(outlets: OutletData[]): CannibalizationPair[] {
  const pairs: CannibalizationPair[] = [];

  for (let i = 0; i < outlets.length; i++) {
    for (let j = i + 1; j < outlets.length; j++) {
      const storeA = outlets[i];
      const storeB = outlets[j];
      const dist = calculateDistanceKm(storeA.lat, storeA.lng, storeB.lat, storeB.lng);

      // Only flag proximity if within 4.5km
      if (dist <= 4.5) {
        let riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Low';
        let overlapPercentage = 0;
        let recommendedAction = '';

        if (dist < 1.2) {
          riskLevel = 'Critical';
          overlapPercentage = Math.round(Math.max(65, 95 - dist * 25));
          recommendedAction = 'Differentiate product assortment immediately (e.g. convert one to Express or niche Grab-and-Go)';
        } else if (dist < 2.2) {
          riskLevel = 'High';
          overlapPercentage = Math.round(Math.max(40, 75 - dist * 18));
          recommendedAction = 'Coordinate localized promotions to avoid cross-store price war and customer cannibalization';
        } else if (dist < 3.5) {
          riskLevel = 'Moderate';
          overlapPercentage = Math.round(Math.max(20, 45 - dist * 10));
          recommendedAction = 'Monitor delivery service radius overlaps (GrabMart/GoMart delivery zones)';
        } else {
          riskLevel = 'Low';
          overlapPercentage = Math.round(Math.max(5, 20 - dist * 3));
          recommendedAction = 'Optimal inter-store spacing; negligible cannibalization impact';
        }

        pairs.push({
          storeA,
          storeB,
          distanceKm: dist,
          riskLevel,
          overlapPercentage,
          recommendedAction
        });
      }
    }
  }

  // Sort by highest risk first (smallest distance)
  return pairs.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Calculates Getis-Ord Gi* Spatial Autocorrelation Statistics
 * Identifies statistically significant spatial clustering of high values (Hot Spots) and low values (Cold Spots).
 */
export function calculateGetisOrdGi(outlets: OutletData[], bandwidthKm = 6.0): HotspotPoint[] {
  const n = outlets.length;
  if (n < 3) return [];

  // Values are Total Surrounding POIs
  const values = outlets.map(o => o.totalPOIs);
  const sumX = values.reduce((acc, v) => acc + v, 0);
  const meanX = sumX / n;

  // Standard deviation S
  const variance = values.reduce((acc, v) => acc + Math.pow(v - meanX, 2), 0) / n;
  const s = Math.sqrt(variance);

  // Compute spatial weight matrix W using Gaussian distance decay
  const W: number[][] = [];
  for (let i = 0; i < n; i++) {
    W[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        W[i][j] = 1.0; // Gi* includes self-weighting
      } else {
        const dist = calculateDistanceKm(outlets[i].lat, outlets[i].lng, outlets[j].lat, outlets[j].lng);
        // Gaussian kernel
        W[i][j] = Math.exp(-Math.pow(dist, 2) / (2 * Math.pow(bandwidthKm, 2)));
      }
    }
  }

  const results: HotspotPoint[] = outlets.map((outlet, i) => {
    let sumWj = 0;
    let sumWjSquared = 0;
    let sumWjXj = 0;

    for (let j = 0; j < n; j++) {
      const wij = W[i][j];
      sumWj += wij;
      sumWjSquared += Math.pow(wij, 2);
      sumWjXj += wij * outlets[j].totalPOIs;
    }

    // Numerator: sum(wij * xj) - (meanX * sum(wij))
    const numerator = sumWjXj - meanX * sumWj;

    // Denominator: s * sqrt((n * sum(wij^2) - (sum(wij))^2) / (n - 1))
    const denomTerm = (n * sumWjSquared - Math.pow(sumWj, 2)) / (n - 1);
    const denominator = s * Math.sqrt(Math.max(0.00001, denomTerm));

    const giZScore = denominator !== 0 ? Math.round((numerator / denominator) * 100) / 100 : 0;
    
    // Approximate two-tailed p-value from z-score
    const absZ = Math.abs(giZScore);
    let giPValue = 0.5;
    if (absZ >= 2.58) giPValue = 0.01;
    else if (absZ >= 1.96) giPValue = 0.05;
    else if (absZ >= 1.65) giPValue = 0.10;
    else giPValue = 0.35;

    let classification: HotspotPoint['classification'] = 'Not Significant';
    let color = '#64748b'; // slate-500

    if (giZScore >= 2.58) {
      classification = 'Hot Spot (99% Conf)';
      color = '#ef4444'; // red-500
    } else if (giZScore >= 1.96) {
      classification = 'Hot Spot (95% Conf)';
      color = '#f97316'; // orange-500
    } else if (giZScore >= 1.65) {
      classification = 'Hot Spot (90% Conf)';
      color = '#eab308'; // yellow-500
    } else if (giZScore <= -2.58) {
      classification = 'Cold Spot (95% Conf)';
      color = '#3b82f6'; // blue-500
    } else if (giZScore <= -1.96) {
      classification = 'Cold Spot (95% Conf)';
      color = '#06b6d4'; // cyan-500
    } else if (giZScore <= -1.65) {
      classification = 'Cold Spot (90% Conf)';
      color = '#10b981'; // emerald-500
    }

    return {
      id: `gi-${outlet.id}`,
      outletId: outlet.id,
      name: outlet.name,
      lat: outlet.lat,
      lng: outlet.lng,
      totalPOIs: outlet.totalPOIs,
      giZScore,
      giPValue,
      classification,
      color
    };
  });

  return results;
}

/**
 * Computes Voronoi polygons (Thiessen polygons) for catchment areas
 */
export function computeVoronoiPolygons(outlets: OutletData[]): Array<{ outlet: OutletData; polygon: [number, number][] }> {
  if (outlets.length < 3) return [];

  // Voronoi bounds covering Bali and Lombok:
  // minLng: 114.4, minLat: -9.1, maxLng: 116.6, maxLat: -8.0
  const bounds: [number, number, number, number] = [114.4, -9.1, 116.6, -8.0];
  const points: [number, number][] = outlets.map(o => [o.lng, o.lat]);

  try {
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi(bounds);
    const polygons: Array<{ outlet: OutletData; polygon: [number, number][] }> = [];

    for (let i = 0; i < outlets.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (cell && cell.length > 2) {
        // Convert [lng, lat] back to [lat, lng] for Leaflet polygon representation
        const latLngPolygon: [number, number][] = cell.map(([lng, lat]) => [lat, lng]);
        polygons.push({
          outlet: outlets[i],
          polygon: latLngPolygon
        });
      }
    }

    return polygons;
  } catch (err) {
    console.error('Failed to compute Voronoi polygons:', err);
    return [];
  }
}

/**
 * Predictive Site Selection Algorithm
 * Ingests simulated coordinates and computes estimated POI density + Viability Score (0-100)
 */
export function evaluateSiteSelection(
  targetLat: number,
  targetLng: number,
  format: StoreFormat,
  radiusKm: number,
  outlets: OutletData[],
  customWeights?: {
    villas: number;
    cafes: number;
    restaurants: number;
    wellness: number;
    cannibalizationPenalty: number;
  }
): {
  estimatedVillas: number;
  estimatedSports: number;
  estimatedBeauty: number;
  estimatedSpas: number;
  estimatedCafes: number;
  estimatedRestaurants: number;
  estimatedTotalPOIs: number;
  nearestStore: OutletData;
  nearestDistKm: number;
  cannibalizationRisk: 'Critical' | 'High' | 'Moderate' | 'Low';
  viabilityScore: number;
  ecosystemScore: number;
  cannibalizationScore: number;
  verdict: string;
  recommendedAssortment: string[];
} {
  // Find nearest store and distances
  let nearestStore = outlets[0];
  let minDistance = 9999;

  for (const outlet of outlets) {
    const d = calculateDistanceKm(targetLat, targetLng, outlet.lat, outlet.lng);
    if (d < minDistance) {
      minDistance = d;
      nearestStore = outlet;
    }
  }

  // Inverse Distance Weighted (IDW) interpolation from existing store POI surroundings
  let totalWeight = 0;
  let wVillas = 0;
  let wSports = 0;
  let wBeauty = 0;
  let wSpas = 0;
  let wCafes = 0;
  let wRestaurants = 0;

  for (const outlet of outlets) {
    const dist = Math.max(0.3, calculateDistanceKm(targetLat, targetLng, outlet.lat, outlet.lng));
    // Power of 2 IDW
    const weight = 1 / Math.pow(dist, 2);
    totalWeight += weight;

    wVillas += outlet.villas * weight;
    wSports += outlet.sportsArenas * weight;
    wBeauty += outlet.beautyClinics * weight;
    wSpas += outlet.spas * weight;
    wCafes += outlet.cafes * weight;
    wRestaurants += outlet.restaurants * weight;
  }

  // Scale estimates by the catchment radius factor (relative to standard ~2.5km baseline)
  const radiusScale = Math.pow(radiusKm / 2.5, 1.4);

  const estimatedVillas = Math.max(12, Math.round((wVillas / totalWeight) * radiusScale));
  const estimatedSports = Math.max(2, Math.round((wSports / totalWeight) * radiusScale));
  const estimatedBeauty = Math.max(2, Math.round((wBeauty / totalWeight) * radiusScale));
  const estimatedSpas = Math.max(5, Math.round((wSpas / totalWeight) * radiusScale));
  const estimatedCafes = Math.max(10, Math.round((wCafes / totalWeight) * radiusScale));
  const estimatedRestaurants = Math.max(15, Math.round((wRestaurants / totalWeight) * radiusScale));
  const estimatedTotalPOIs =
    estimatedVillas + estimatedSports + estimatedBeauty + estimatedSpas + estimatedCafes + estimatedRestaurants;

  // Default weights based on format if not provided
  let weights = customWeights;
  if (!weights) {
    if (format === 'Express') {
      weights = { villas: 0.30, cafes: 0.25, restaurants: 0.20, wellness: 0.15, cannibalizationPenalty: 0.35 };
    } else if (format === 'Market') {
      weights = { villas: 0.25, cafes: 0.15, restaurants: 0.25, wellness: 0.10, cannibalizationPenalty: 0.40 };
    } else {
      // To-Go
      weights = { villas: 0.15, cafes: 0.35, restaurants: 0.30, wellness: 0.10, cannibalizationPenalty: 0.25 };
    }
  }

  // Ecosystem Raw Score (0 - 100)
  const rawEcosystem =
    (estimatedVillas * weights.villas +
      estimatedCafes * weights.cafes +
      estimatedRestaurants * weights.restaurants +
      (estimatedSpas + estimatedBeauty + estimatedSports) * weights.wellness) * 0.75;
  const ecosystemScore = Math.min(100, Math.max(10, Math.round(rawEcosystem)));

  // Cannibalization Deduction
  let cannibalizationRisk: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Low';
  let cannibalizationPenaltyDeduction = 0;

  if (minDistance < 1.0) {
    cannibalizationRisk = 'Critical';
    cannibalizationPenaltyDeduction = 50 * weights.cannibalizationPenalty;
  } else if (minDistance < 2.0) {
    cannibalizationRisk = 'High';
    cannibalizationPenaltyDeduction = 32 * weights.cannibalizationPenalty;
  } else if (minDistance < 3.2) {
    cannibalizationRisk = 'Moderate';
    cannibalizationPenaltyDeduction = 15 * weights.cannibalizationPenalty;
  } else {
    cannibalizationRisk = 'Low';
    cannibalizationPenaltyDeduction = 0;
  }

  const cannibalizationScore = Math.max(0, Math.round(100 - cannibalizationPenaltyDeduction * 2));
  const finalViabilityScore = Math.min(100, Math.max(10, Math.round(ecosystemScore - cannibalizationPenaltyDeduction)));

  // Strategic Verdict
  let verdict = '';
  if (finalViabilityScore >= 78) {
    verdict = `Tier-1 Opportunity: Exceptional POI ecosystem for ${format} expansion with minimal sister-store friction.`;
  } else if (finalViabilityScore >= 60) {
    verdict = `Viable Prospect: Strong commercial potential. Review street-frontage parking and lease rates.`;
  } else if (cannibalizationRisk === 'Critical' || cannibalizationRisk === 'High') {
    verdict = `High Cannibalization Risk: Overlaps significantly with ${nearestStore.name} (${minDistance.toFixed(1)}km away). Consider alternative formats.`;
  } else {
    verdict = `Sub-Threshold Density: Surrounding ecosystem currently below ideal unit economics threshold for ${format}.`;
  }

  // Recommended Assortment for candidate
  const recommendedAssortment: string[] = [];
  if (estimatedVillas > 150 || estimatedCafes > 70) {
    recommendedAssortment.push('International Wines & Artisanal Delicatessen');
    recommendedAssortment.push('Organic Produce & European Dairy Imports');
  }
  if (format === 'To-Go') {
    recommendedAssortment.push('Grab-and-Go Ready Sandwiches, Pastries & Cold Brews');
    recommendedAssortment.push('Travel Toiletries & Sun Care');
  } else {
    recommendedAssortment.push('Imported Packaged Snacks & Asian Culinary Pantry');
    recommendedAssortment.push('Fresh Bakery Counter & Butchery');
  }

  return {
    estimatedVillas,
    estimatedSports,
    estimatedBeauty,
    estimatedSpas,
    estimatedCafes,
    estimatedRestaurants,
    estimatedTotalPOIs,
    nearestStore,
    nearestDistKm: minDistance,
    cannibalizationRisk,
    viabilityScore: finalViabilityScore,
    ecosystemScore,
    cannibalizationScore,
    verdict,
    recommendedAssortment
  };
}
