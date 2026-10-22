import React, { useState } from 'react';
import { 
  Flame, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ChevronRight, 
  MapPin, 
  HelpCircle 
} from 'lucide-react';
import { HotspotPoint, OutletData } from '../types';

interface HotspotPanelProps {
  hotspots: HotspotPoint[];
  allOutlets: OutletData[];
  onClose: () => void;
  onSelectStore: (store: OutletData) => void;
}

export const HotspotPanel: React.FC<HotspotPanelProps> = ({
  hotspots,
  allOutlets,
  onClose,
  onSelectStore
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Hot' | 'Cold'>('All');

  const sortedHotspots = [...hotspots].sort((a, b) => b.giZScore - a.giZScore);

  const filteredList = sortedHotspots.filter((h) => {
    if (filterType === 'Hot') return h.giZScore > 1.65;
    if (filterType === 'Cold') return h.giZScore < -1.65;
    return true;
  });

  const hotCount = hotspots.filter((h) => h.giZScore >= 1.96).length;
  const coldCount = hotspots.filter((h) => h.giZScore <= -1.96).length;
  const notSigCount = hotspots.filter((h) => Math.abs(h.giZScore) < 1.96).length;

  return (
    <div 
      id="hotspot-statistics-panel"
      className="absolute top-12 left-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden text-slate-100 text-xs"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              Getis-Ord Gi* Hotspot Analysis
            </h2>
            <p className="text-[11px] text-slate-400">
              Spatial Autocorrelation & POI Clustering
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Statistical Overview Pills */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 grid grid-cols-3 gap-2 text-center">
        <button
          onClick={() => setFilterType(filterType === 'Hot' ? 'All' : 'Hot')}
          className={`p-2 rounded-xl border transition-all ${
            filterType === 'Hot'
              ? 'bg-red-950/80 border-red-500 ring-1 ring-red-400'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-red-400 font-bold text-base flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {hotCount}
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">Hot Spots (95%+)</div>
        </button>

        <button
          onClick={() => setFilterType('All')}
          className={`p-2 rounded-xl border transition-all ${
            filterType === 'All'
              ? 'bg-slate-800/80 border-slate-600 ring-1 ring-slate-400'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-slate-300 font-bold text-base">{notSigCount}</div>
          <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">Neutral</div>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'Cold' ? 'All' : 'Cold')}
          className={`p-2 rounded-xl border transition-all ${
            filterType === 'Cold'
              ? 'bg-blue-950/80 border-blue-500 ring-1 ring-blue-400'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-cyan-400 font-bold text-base flex items-center justify-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            {coldCount}
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">Cold Spots</div>
        </button>
      </div>

      {/* GIS Explanation Card */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 leading-snug">
        <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          What is Getis-Ord Gi*?
        </div>
        <p>
          Calculates local spatial statistics to verify if high/low POI clusters are statistically significant beyond random chance. Z-scores &gt; +1.96 indicate high-density lifestyle corridors (e.g. Canggu & Seminyak).
        </p>
      </div>

      {/* Hotspots List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredList.map((hp) => {
          const outlet = allOutlets.find((o) => o.id === hp.outletId);
          const isHot = hp.giZScore > 0;

          return (
            <div
              key={hp.id}
              onClick={() => outlet && onSelectStore(outlet)}
              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: hp.color }} 
                    />
                    {hp.name}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Surrounding POIs: <strong className="text-slate-200">{hp.totalPOIs}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs" style={{ color: hp.color }}>
                    Z: {hp.giZScore > 0 ? '+' : ''}{hp.giZScore}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    p = {hp.giPValue}
                  </div>
                </div>
              </div>

              {/* Classification Tag */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span 
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ 
                    backgroundColor: `${hp.color}20`,
                    color: hp.color,
                    border: `1px solid ${hp.color}40`
                  }}
                >
                  {hp.classification}
                </span>

                <span className="text-[11px] text-slate-400 flex items-center gap-1 hover:text-slate-200">
                  Inspect <ChevronRight className="w-3 h-3 text-slate-500" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
