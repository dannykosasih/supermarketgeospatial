import React from 'react';
import { 
  X, 
  Trash2, 
  Download, 
  BookmarkCheck, 
  MapPin, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { SimulatorCandidate } from '../types';

interface ScenarioComparisonModalProps {
  scenarios: SimulatorCandidate[];
  onClose: () => void;
  onDeleteScenario: (id: string) => void;
  onClearAll: () => void;
}

export const ScenarioComparisonModal: React.FC<ScenarioComparisonModalProps> = ({
  scenarios,
  onClose,
  onDeleteScenario,
  onClearAll
}) => {
  const exportScenariosCSV = () => {
    if (scenarios.length === 0) return;

    const headers = [
      'Scenario Title',
      'Format',
      'Region',
      'Latitude',
      'Longitude',
      'Scan Radius (km)',
      'Viability Score',
      'Ecosystem Score',
      'Estimated Villas',
      'Estimated Cafes',
      'Estimated Restaurants',
      'Estimated Spas',
      'Estimated Total POIs',
      'Nearest Sister Store',
      'Distance to Sister Store (km)',
      'Cannibalization Risk',
      'Verdict'
    ];

    const rows = scenarios.map(s => [
      `"${s.title.replace(/"/g, '""')}"`,
      s.format,
      s.region,
      s.lat,
      s.lng,
      s.radiusKm,
      s.viabilityScore,
      s.ecosystemScore,
      s.estimatedVillas,
      s.estimatedCafes,
      s.estimatedRestaurants,
      s.estimatedSpas,
      s.estimatedTotalPOIs,
      `"${s.nearestStoreName.replace(/"/g, '""')}"`,
      s.nearestStoreDistKm,
      s.cannibalizationRisk,
      `"${s.verdict.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spatialpulse_scenario_comparison_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="scenario-comparison-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Site Selection Scenario Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Benchmarking {scenarios.length} saved hypothetical store expansion scenarios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scenarios.length > 0 && (
              <>
                <button
                  onClick={exportScenariosCSV}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Matrix (CSV)
                </button>
                <button
                  onClick={onClearAll}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
                >
                  Clear All
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table Content */}
        <div className="flex-1 overflow-auto p-4">
          {scenarios.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-200 text-sm mb-1">No Scenarios Saved Yet</h3>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Use the <strong>Site Simulator</strong> on the top toolbar to test blank coordinates, tweak format parameters, and save candidates here for side-by-side evaluation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
                    <th className="p-3">Scenario / Location</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Viability Score</th>
                    <th className="p-3">Est. POIs</th>
                    <th className="p-3">Villas / Cafes</th>
                    <th className="p-3">Nearest Sister Store</th>
                    <th className="p-3">Cannibalization Risk</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scenarios.map((sc) => {
                    const scoreBadge =
                      sc.viabilityScore >= 75
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : sc.viabilityScore >= 55
                        ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                        : 'bg-rose-950/80 text-rose-400 border-rose-500/40';

                    return (
                      <tr key={sc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-200">
                          <div>{sc.title}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {sc.lat.toFixed(4)}, {sc.lng.toFixed(4)} ({sc.region})
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            sc.format === 'Market' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            sc.format === 'Express' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {sc.format}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold font-mono border ${scoreBadge}`}>
                            {sc.viabilityScore}/100
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-200">
                          ~{sc.estimatedTotalPOIs}
                        </td>
                        <td className="p-3 text-slate-300">
                          <span>{sc.estimatedVillas} Villas</span>
                          <span className="text-slate-500 mx-1">•</span>
                          <span>{sc.estimatedCafes} Cafes</span>
                        </td>
                        <td className="p-3 text-slate-300">
                          <div className="truncate max-w-[160px]">{sc.nearestStoreName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sc.nearestStoreDistKm} km away</div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            sc.cannibalizationRisk === 'Critical' ? 'text-rose-400 bg-rose-950/60 border border-rose-800' :
                            sc.cannibalizationRisk === 'High' ? 'text-orange-400 bg-orange-950/60 border border-orange-800' :
                            'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                          }`}>
                            {sc.cannibalizationRisk}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onDeleteScenario(sc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete scenario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
