import React from 'react';
import { 
  Search, 
  Map, 
  CircleDot, 
  MapPin, 
  Check, 
  X,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';
import { StoreFormat, IslandRegion, StoreCluster, ProportionalMetric, BaseMapStyle } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFormats: StoreFormat[];
  onToggleFormat: (format: StoreFormat) => void;
  selectedRegion: IslandRegion | 'All';
  onRegionChange: (region: IslandRegion | 'All') => void;
  selectedCluster: StoreCluster | 'All';
  onClusterChange: (cluster: StoreCluster | 'All') => void;
  proportionalMetric: ProportionalMetric;
  onMetricChange: (metric: ProportionalMetric) => void;
  baseMapStyle: BaseMapStyle;
  onBaseMapChange: (style: BaseMapStyle) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalCount: number;
}

const REGIONS: Array<IslandRegion | 'All'> = [
  'All',
  'Badung',
  'Denpasar',
  'Gianyar',
  'Tabanan',
  'Buleleng',
  'Lombok'
];

const CLUSTERS: Array<StoreCluster | 'All'> = [
  'All',
  'Tourist Villa Hotspot',
  'Expat Lifestyle Haven',
  'Urban Commercial Hub',
  'Local Residential / Transit',
  'Coastal Resort Corridor'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFormats,
  onToggleFormat,
  selectedRegion,
  onRegionChange,
  selectedCluster,
  onClusterChange,
  proportionalMetric,
  onMetricChange,
  baseMapStyle,
  onBaseMapChange,
  onResetFilters,
  totalFilteredCount,
  totalCount
}) => {
  const isFiltered =
    selectedFormats.length < 3 ||
    selectedRegion !== 'All' ||
    selectedCluster !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2.5 z-20">
      {/* Left side: Search & Format Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative min-w-[190px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-store-search"
            type="text"
            placeholder="Search store or address..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Format toggles */}
        <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            id="toggle-format-market"
            onClick={() => onToggleFormat('Market')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              selectedFormats.includes('Market')
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-emerald-300"></span>
            Market
          </button>
          <button
            id="toggle-format-express"
            onClick={() => onToggleFormat('Express')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              selectedFormats.includes('Express')
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 ring-1 ring-sky-300"></span>
            Express
          </button>
          <button
            id="toggle-format-togo"
            onClick={() => onToggleFormat('To-Go')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              selectedFormats.includes('To-Go')
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-amber-300"></span>
            To-Go
          </button>
        </div>

        {/* Region selector */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="select-region" className="text-slate-400 font-medium hidden sm:inline">Region:</label>
          <select
            id="select-region"
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value as IslandRegion | 'All')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Regions' : r}
              </option>
            ))}
          </select>
        </div>

        {/* Cluster selector */}
        <div className="hidden md:flex items-center gap-1.5">
          <label htmlFor="select-cluster" className="text-slate-400 font-medium">Cluster:</label>
          <select
            id="select-cluster"
            value={selectedCluster}
            onChange={(e) => onClusterChange(e.target.value as StoreCluster | 'All')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 max-w-[160px] truncate"
          >
            {CLUSTERS.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Clusters' : c}
              </option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button
            id="btn-reset-filters"
            onClick={onResetFilters}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 ml-1"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Right side: Proportional Symbol Metric & Base Map */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Proportional Symbol Sizing */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 hidden xl:inline">Symbol Scale:</span>
          <select
            id="select-proportional-metric"
            value={proportionalMetric}
            onChange={(e) => onMetricChange(e.target.value as ProportionalMetric)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="totalPOIs" className="bg-slate-900">Total POIs</option>
            <option value="villas" className="bg-slate-900">Villas (#)</option>
            <option value="cafes" className="bg-slate-900">Cafes (#)</option>
            <option value="spas" className="bg-slate-900">Spas (#)</option>
            <option value="restaurants" className="bg-slate-900">Restaurants (#)</option>
            <option value="fixed" className="bg-slate-900">Fixed Marker Size</option>
          </select>
        </div>

        {/* Base Map Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <Map className="w-3.5 h-3.5 text-sky-400" />
          <select
            id="select-basemap-style"
            value={baseMapStyle}
            onChange={(e) => onBaseMapChange(e.target.value as BaseMapStyle)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="dark" className="bg-slate-900">Dark Matter</option>
            <option value="light" className="bg-slate-900">Positron Light</option>
            <option value="satellite" className="bg-slate-900">Satellite Hybrid</option>
            <option value="street" className="bg-slate-900">OpenStreetMap</option>
          </select>
        </div>

        {/* Count Pill */}
        <div className="text-[11px] text-slate-400 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 font-mono">
          Showing <span className="text-emerald-400 font-semibold">{totalFilteredCount}</span> of {totalCount}
        </div>
      </div>
    </div>
  );
};
