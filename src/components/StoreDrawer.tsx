import React from 'react';
import { 
  X, 
  MapPin, 
  Building, 
  Coffee, 
  Sparkles, 
  Dumbbell, 
  Utensils, 
  Home, 
  Activity, 
  AlertTriangle, 
  Layers, 
  ChevronRight,
  TrendingUp,
  PackageCheck,
  Calendar,
  Wallet
} from 'lucide-react';
import { OutletData } from '../types';
import { calculateDerivedMetrics, calculateDistanceKm } from '../utils/spatialCalculations';

interface StoreDrawerProps {
  outlet: OutletData | null;
  onClose: () => void;
  allOutlets: OutletData[];
  onSelectSisterStore: (store: OutletData) => void;
  activeBufferRadiusKm: number;
  onSetBufferRadius: (radius: number) => void;
}

export const StoreDrawer: React.FC<StoreDrawerProps> = ({
  outlet,
  onClose,
  allOutlets,
  onSelectSisterStore,
  activeBufferRadiusKm,
  onSetBufferRadius
}) => {
  if (!outlet) return null;

  const metrics = calculateDerivedMetrics(outlet);

  // Find sister stores within 5km
  const nearbySisterStores = allOutlets
    .filter((o) => o.id !== outlet.id)
    .map((o) => {
      const dist = calculateDistanceKm(outlet.lat, outlet.lng, o.lat, o.lng);
      return { store: o, dist };
    })
    .filter((item) => item.dist <= 4.5)
    .sort((a, b) => a.dist - b.dist);

  const formatBadgeColors = {
    Market: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Express: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    'To-Go': 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  return (
    <aside 
      id="store-profiling-drawer"
      aria-label="Store Profile & Ecosystem Breakdown"
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-slate-900/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col overflow-hidden text-slate-100"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${formatBadgeColors[outlet.category]}`}>
                {outlet.category} Format
              </span>
              <span className="text-xs text-slate-400 font-medium">{outlet.region}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Est. {outlet.openedYear}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-50 leading-tight">
              {outlet.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{outlet.address}</span>
            </p>
          </div>
          <button
            id="btn-close-store-drawer"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close Store Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Performance Tags */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Cluster Archetype</div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate" title={outlet.cluster}>
              {outlet.cluster}
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Avg Basket Size</div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">
              IDR {(outlet.averageBasketSizeIDR / 1000).toLocaleString('id-ID')}k
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Module 2 Requirement: Surrounding Ecosystem Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-semibold text-slate-200 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Surrounding POI Ecosystem
            </h3>
            <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800/60">
              Total: {outlet.totalPOIs} POIs
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Villas */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Home className="w-3.5 h-3.5 text-indigo-400" /> Villas
                </span>
                <span className="font-bold text-slate-100 text-sm">{outlet.villas}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (outlet.villas / 320) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Cafes */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" /> Cafes
                </span>
                <span className="font-bold text-slate-100 text-sm">{outlet.cafes}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (outlet.cafes / 160) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Restaurants */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-rose-400" /> Restaurants
                </span>
                <span className="font-bold text-slate-100 text-sm">{outlet.restaurants}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (outlet.restaurants / 220) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Spas & Wellness */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Spas
                </span>
                <span className="font-bold text-slate-100 text-sm">{outlet.spas}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (outlet.spas / 90) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Sports Arenas */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Dumbbell className="w-3.5 h-3.5 text-blue-400" /> Sports
                </span>
                <span className="font-bold text-slate-100 text-sm">{outlet.sportsArenas}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (outlet.sportsArenas / 25) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Beauty & Aesthetic Clinics */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Beauty Clinics
                </span>
                <span className="font-bold text-slate-100 text-sm">{outlet.beautyClinics}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-pink-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (outlet.beautyClinics / 30) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Module 2 Requirement: Ratio Indicators & Indexes */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
          <h3 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            Ratio Indicators & Indexes
          </h3>

          <div className="space-y-3">
            {/* Cafe to Villa Ratio */}
            <div>
              <div className="flex items-center justify-between mb-1 text-slate-300">
                <span className="font-medium">Cafe-to-Villa Ratio</span>
                <strong className="text-amber-400 font-mono text-xs">{metrics.cafeToVillaRatio}x</strong>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {metrics.cafeToVillaRatio > 0.5 
                  ? 'High cafe saturation: Strong expat lifestyle daytime coffee crawl habits.'
                  : 'Low cafe ratio: Villa guests primarily rely on in-villa private chefs or grocery.'}
              </p>
            </div>

            {/* Tourism Density Index */}
            <div>
              <div className="flex items-center justify-between mb-1 text-slate-300">
                <span className="font-medium">Tourism Density Index</span>
                <span className="text-emerald-400 font-bold font-mono text-xs">{metrics.tourismDensityIndex}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full" 
                  style={{ width: `${metrics.tourismDensityIndex}%` }} 
                />
              </div>
            </div>

            {/* Lifestyle Quotient */}
            <div>
              <div className="flex items-center justify-between mb-1 text-slate-300">
                <span className="font-medium">Lifestyle & Wellness Quotient</span>
                <span className="text-sky-400 font-bold font-mono text-xs">{metrics.lifestyleQuotient}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full" 
                  style={{ width: `${metrics.lifestyleQuotient}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Assortment Recommendation */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
          <h3 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
            Category Assortment Mapping
          </h3>
          <p className="text-[11px] text-slate-400 mb-2.5">
            Recommended SKU assortment calibrated to this store's surrounding ecosystem:
          </p>
          <ul className="space-y-1.5">
            {metrics.recommendedAssortment.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buffer Controls for this store */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-200 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Catchment Buffer Radius
            </h3>
            <span className="text-xs text-indigo-300 font-medium font-mono">{activeBufferRadiusKm} km active</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 5].map((r) => (
              <button
                key={r}
                onClick={() => onSetBufferRadius(r)}
                className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeBufferRadiusKm === r
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {r} km Buffer
              </button>
            ))}
          </div>
        </div>

        {/* Cannibalization & Sister Store Proximity */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
          <h3 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Sister Store Proximity ({nearbySisterStores.length})
          </h3>
          {nearbySisterStores.length === 0 ? (
            <p className="text-[11px] text-slate-400">
              No sister stores within 4.5km. Isolated trade catchment with minimal internal competition.
            </p>
          ) : (
            <div className="space-y-2">
              {nearbySisterStores.map(({ store, dist }) => {
                const isCritical = dist < 1.2;
                const isHigh = dist < 2.2;
                return (
                  <div
                    key={store.id}
                    onClick={() => onSelectSisterStore(store)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 cursor-pointer border border-slate-800 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200 text-xs flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          store.category === 'Market' ? 'bg-emerald-400' : store.category === 'Express' ? 'bg-sky-400' : 'bg-amber-400'
                        }`} />
                        {store.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isCritical ? (
                          <span className="text-red-400 font-semibold">Critical Overlap (&gt;65%)</span>
                        ) : isHigh ? (
                          <span className="text-orange-400 font-semibold">High Overlap (40-65%)</span>
                        ) : (
                          <span className="text-amber-400">Moderate Overlap</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-semibold">
                      <span>{dist} km</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
