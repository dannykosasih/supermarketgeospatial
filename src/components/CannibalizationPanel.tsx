import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Shuffle, 
  ChevronRight, 
  ArrowRight, 
  Filter, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { CannibalizationPair, OutletData } from '../types';

interface CannibalizationPanelProps {
  pairs: CannibalizationPair[];
  onClose: () => void;
  onSelectStore: (store: OutletData) => void;
}

export const CannibalizationPanel: React.FC<CannibalizationPanelProps> = ({
  pairs,
  onClose,
  onSelectStore
}) => {
  const [filterRisk, setFilterRisk] = useState<'All' | 'Critical' | 'High' | 'Moderate'>('All');

  const filteredPairs = filterRisk === 'All' 
    ? pairs 
    : pairs.filter(p => p.riskLevel === filterRisk);

  const criticalCount = pairs.filter(p => p.riskLevel === 'Critical').length;
  const highCount = pairs.filter(p => p.riskLevel === 'High').length;
  const moderateCount = pairs.filter(p => p.riskLevel === 'Moderate').length;

  return (
    <div 
      id="cannibalization-analysis-panel"
      className="absolute top-12 left-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden text-slate-100 text-xs"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              Cannibalization Checker
            </h2>
            <p className="text-[11px] text-slate-400">
              Voronoi & Trade Catchment Overlap Matrix
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

      {/* Summary KPI Pills */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 grid grid-cols-3 gap-2 text-center">
        <button
          onClick={() => setFilterRisk(filterRisk === 'Critical' ? 'All' : 'Critical')}
          className={`p-2 rounded-xl border transition-all ${
            filterRisk === 'Critical'
              ? 'bg-rose-950/80 border-rose-500 ring-1 ring-rose-400'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-rose-400 font-bold text-base">{criticalCount}</div>
          <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">Critical (&lt;1.2km)</div>
        </button>
        <button
          onClick={() => setFilterRisk(filterRisk === 'High' ? 'All' : 'High')}
          className={`p-2 rounded-xl border transition-all ${
            filterRisk === 'High'
              ? 'bg-orange-950/80 border-orange-500 ring-1 ring-orange-400'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-orange-400 font-bold text-base">{highCount}</div>
          <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">High (&lt;2.2km)</div>
        </button>
        <button
          onClick={() => setFilterRisk(filterRisk === 'Moderate' ? 'All' : 'Moderate')}
          className={`p-2 rounded-xl border transition-all ${
            filterRisk === 'Moderate'
              ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-400'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-amber-400 font-bold text-base">{moderateCount}</div>
          <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">Moderate</div>
        </button>
      </div>

      {/* Methodology Note */}
      <div className="px-3.5 py-2 bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <span>
          Pairs within 2.2km have trade overlap &gt;40%, risking internal cannibalization of margin and foot traffic.
        </span>
      </div>

      {/* Pairs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredPairs.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p>No store pairs matching this cannibalization filter.</p>
          </div>
        ) : (
          filteredPairs.map((pair, idx) => {
            const isCritical = pair.riskLevel === 'Critical';
            const isHigh = pair.riskLevel === 'High';

            return (
              <div
                key={idx}
                className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isCritical 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : isHigh 
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {pair.riskLevel} Risk
                  </span>
                  <div className="flex items-center gap-2 font-mono text-slate-300 font-semibold">
                    <span>{pair.distanceKm} km apart</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-rose-400">{pair.overlapPercentage}% overlap</span>
                  </div>
                </div>

                {/* Stores Involved */}
                <div className="space-y-1.5 mb-2.5">
                  <button
                    onClick={() => onSelectStore(pair.storeA)}
                    className="w-full text-left p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        pair.storeA.category === 'Market' ? 'bg-emerald-400' : 'bg-sky-400'
                      }`} />
                      <span className="font-semibold text-slate-200 truncate">{pair.storeA.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200" />
                  </button>

                  <div className="flex justify-center text-slate-600">
                    <span className="text-[10px] uppercase font-mono tracking-widest">vs sister branch</span>
                  </div>

                  <button
                    onClick={() => onSelectStore(pair.storeB)}
                    className="w-full text-left p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        pair.storeB.category === 'Market' ? 'bg-emerald-400' : 'bg-sky-400'
                      }`} />
                      <span className="font-semibold text-slate-200 truncate">{pair.storeB.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200" />
                  </button>
                </div>

                {/* Recommended Resolution */}
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-tight">
                  <span className="text-slate-400 font-medium">Strategic Action:</span> {pair.recommendedAction}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
