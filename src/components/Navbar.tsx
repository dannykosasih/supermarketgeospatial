import React from 'react';
import { 
  Compass, 
  Layers, 
  Flame, 
  Shuffle, 
  Download, 
  MapPin, 
  SlidersHorizontal,
  BookmarkCheck,
  Building2,
  Store
} from 'lucide-react';
import { StoreFormat } from '../types';

interface NavbarProps {
  totalStores: number;
  formatCounts: Record<StoreFormat, number>;
  activeTool: 'none' | 'buffer' | 'cannibalization' | 'hotspot' | 'simulator';
  onSelectTool: (tool: 'none' | 'buffer' | 'cannibalization' | 'hotspot' | 'simulator') => void;
  savedScenariosCount: number;
  onOpenComparison: () => void;
  onOpenExport: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalStores,
  formatCounts,
  activeTool,
  onSelectTool,
  savedScenariosCount,
  onOpenComparison,
  onOpenExport,
  showFilters,
  onToggleFilters
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 z-30 relative px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Platform Identity */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                SpatialPulse
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Bali & Lombok GIS
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Pepito Retail Footprint & POI Expansion Intelligence
            </p>
          </div>
        </div>

        {/* Quick Format Pills */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium mr-1">Network:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Market: <strong>{formatCounts.Market}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-300 border border-sky-800/60">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Express: <strong>{formatCounts.Express}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            To-Go: <strong>{formatCounts['To-Go']}</strong>
          </span>
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Filter Toggle */}
          <button
            id="btn-toggle-filters"
            onClick={onToggleFilters}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              showFilters
                ? 'bg-slate-800 text-slate-100 border-slate-600'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Filter Sidebar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Buffer Analysis Tool */}
          <button
            id="tool-btn-buffer"
            onClick={() => onSelectTool(activeTool === 'buffer' ? 'none' : 'buffer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              activeTool === 'buffer'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-950'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Catchment</span> Buffers
          </button>

          {/* Cannibalization Tool */}
          <button
            id="tool-btn-cannibalization"
            onClick={() => onSelectTool(activeTool === 'cannibalization' ? 'none' : 'cannibalization')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              activeTool === 'cannibalization'
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            Cannibalization
          </button>

          {/* Hotspot Gi* Tool */}
          <button
            id="tool-btn-hotspot"
            onClick={() => onSelectTool(activeTool === 'hotspot' ? 'none' : 'hotspot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              activeTool === 'hotspot'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Hotspots (Gi*)
          </button>

          {/* Simulator Tool */}
          <button
            id="tool-btn-simulator"
            onClick={() => onSelectTool(activeTool === 'simulator' ? 'none' : 'simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeTool === 'simulator'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950 font-bold'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Site Simulator
          </button>

          {/* Saved Scenarios */}
          {savedScenariosCount > 0 && (
            <button
              id="btn-open-scenarios"
              onClick={onOpenComparison}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900/60 flex items-center gap-1.5"
              title="Compare Saved Scenarios"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scenarios ({savedScenariosCount})</span>
            </button>
          )}

          {/* Export Button */}
          <button
            id="btn-export-gis"
            onClick={onOpenExport}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
