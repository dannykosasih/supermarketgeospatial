import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  Save, 
  Layers, 
  CheckCircle2, 
  Building2, 
  Coffee, 
  Home, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Target
} from 'lucide-react';
import { StoreFormat, IslandRegion, SimulatorCandidate, OutletData } from '../types';
import { PRESET_VACANT_SITES } from '../data/pepitoOutlets';
import { evaluateSiteSelection } from '../utils/spatialCalculations';

interface SimulatorDrawerProps {
  simulatorCandidate: SimulatorCandidate | null;
  onUpdateCandidate: (updated: SimulatorCandidate) => void;
  onClose: () => void;
  outlets: OutletData[];
  onSaveScenario: (scenario: SimulatorCandidate) => void;
  isSaved: boolean;
}

export const SimulatorDrawer: React.FC<SimulatorDrawerProps> = ({
  simulatorCandidate,
  onUpdateCandidate,
  onClose,
  outlets,
  onSaveScenario,
  isSaved
}) => {
  if (!simulatorCandidate) return null;

  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);

  // Format change handler
  const handleFormatChange = (newFormat: StoreFormat) => {
    const evaluated = evaluateSiteSelection(
      simulatorCandidate.lat,
      simulatorCandidate.lng,
      newFormat,
      simulatorCandidate.radiusKm,
      outlets
    );

    onUpdateCandidate({
      ...simulatorCandidate,
      format: newFormat,
      estimatedVillas: evaluated.estimatedVillas,
      estimatedSports: evaluated.estimatedSports,
      estimatedBeauty: evaluated.estimatedBeauty,
      estimatedSpas: evaluated.estimatedSpas,
      estimatedCafes: evaluated.estimatedCafes,
      estimatedRestaurants: evaluated.estimatedRestaurants,
      estimatedTotalPOIs: evaluated.estimatedTotalPOIs,
      nearestStoreName: evaluated.nearestStore.name,
      nearestStoreDistKm: evaluated.nearestDistKm,
      nearestStoreFormat: evaluated.nearestStore.category,
      cannibalizationRisk: evaluated.cannibalizationRisk,
      viabilityScore: evaluated.viabilityScore,
      ecosystemScore: evaluated.ecosystemScore,
      cannibalizationScore: evaluated.cannibalizationScore,
      verdict: evaluated.verdict,
      recommendedAssortment: evaluated.recommendedAssortment
    });
  };

  // Radius change handler
  const handleRadiusChange = (newRadiusKm: number) => {
    const evaluated = evaluateSiteSelection(
      simulatorCandidate.lat,
      simulatorCandidate.lng,
      simulatorCandidate.format,
      newRadiusKm,
      outlets,
      simulatorCandidate.weights
    );

    onUpdateCandidate({
      ...simulatorCandidate,
      radiusKm: newRadiusKm,
      estimatedVillas: evaluated.estimatedVillas,
      estimatedSports: evaluated.estimatedSports,
      estimatedBeauty: evaluated.estimatedBeauty,
      estimatedSpas: evaluated.estimatedSpas,
      estimatedCafes: evaluated.estimatedCafes,
      estimatedRestaurants: evaluated.estimatedRestaurants,
      estimatedTotalPOIs: evaluated.estimatedTotalPOIs,
      viabilityScore: evaluated.viabilityScore,
      ecosystemScore: evaluated.ecosystemScore,
      cannibalizationScore: evaluated.cannibalizationScore,
      verdict: evaluated.verdict,
      recommendedAssortment: evaluated.recommendedAssortment
    });
  };

  // Select Preset Candidate
  const handleSelectPreset = (preset: typeof PRESET_VACANT_SITES[0]) => {
    const evaluated = evaluateSiteSelection(
      preset.lat,
      preset.lng,
      preset.recommendedFormat,
      2.5,
      outlets
    );

    onUpdateCandidate({
      ...simulatorCandidate,
      title: preset.name,
      format: preset.recommendedFormat,
      lat: preset.lat,
      lng: preset.lng,
      region: preset.region,
      radiusKm: 2.5,
      estimatedVillas: evaluated.estimatedVillas,
      estimatedSports: evaluated.estimatedSports,
      estimatedBeauty: evaluated.estimatedBeauty,
      estimatedSpas: evaluated.estimatedSpas,
      estimatedCafes: evaluated.estimatedCafes,
      estimatedRestaurants: evaluated.estimatedRestaurants,
      estimatedTotalPOIs: evaluated.estimatedTotalPOIs,
      nearestStoreName: evaluated.nearestStore.name,
      nearestStoreDistKm: evaluated.nearestDistKm,
      nearestStoreFormat: evaluated.nearestStore.category,
      cannibalizationRisk: evaluated.cannibalizationRisk,
      viabilityScore: evaluated.viabilityScore,
      ecosystemScore: evaluated.ecosystemScore,
      cannibalizationScore: evaluated.cannibalizationScore,
      verdict: evaluated.verdict,
      recommendedAssortment: evaluated.recommendedAssortment,
      notes: preset.description
    });
  };

  // Custom Weight adjustment
  const handleWeightChange = (key: keyof SimulatorCandidate['weights'], value: number) => {
    const newWeights = {
      ...simulatorCandidate.weights,
      [key]: value
    };

    const evaluated = evaluateSiteSelection(
      simulatorCandidate.lat,
      simulatorCandidate.lng,
      simulatorCandidate.format,
      simulatorCandidate.radiusKm,
      outlets,
      newWeights
    );

    onUpdateCandidate({
      ...simulatorCandidate,
      weights: newWeights,
      viabilityScore: evaluated.viabilityScore,
      ecosystemScore: evaluated.ecosystemScore,
      cannibalizationScore: evaluated.cannibalizationScore,
      verdict: evaluated.verdict
    });
  };

  // Score color badge
  const scoreColor =
    simulatorCandidate.viabilityScore >= 75
      ? 'text-emerald-400 border-emerald-500 bg-emerald-950/60'
      : simulatorCandidate.viabilityScore >= 55
      ? 'text-amber-400 border-amber-500 bg-amber-950/60'
      : 'text-rose-400 border-rose-500 bg-rose-950/60';

  return (
    <aside 
      id="predictive-site-simulator-drawer"
      aria-label="Predictive Site Selection Simulator"
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[440px] bg-slate-900/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col overflow-hidden text-slate-100"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-50 flex items-center gap-2">
                Site Selection Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Predictive Location Viability & POI Scan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Coordinates */}
        <div className="mt-3 flex items-center justify-between text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-200 truncate max-w-[200px]">{simulatorCandidate.title}</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            {simulatorCandidate.lat.toFixed(4)}, {simulatorCandidate.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Preset Vacant Sites Shortcut */}
        <div>
          <label htmlFor="select-preset-site" className="text-slate-400 font-medium block mb-1.5 text-[11px] uppercase tracking-wider">
            Quick-Select Candidate Opportunity Plots:
          </label>
          <select
            id="select-preset-site"
            onChange={(e) => {
              const found = PRESET_VACANT_SITES.find(p => p.id === e.target.value);
              if (found) handleSelectPreset(found);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Choose Vacant Land Plot Preset --</option>
            {PRESET_VACANT_SITES.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.region}) - Suggested: {preset.recommendedFormat}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selector */}
        <div>
          <label className="text-slate-400 font-medium block mb-1.5 text-[11px] uppercase tracking-wider">
            Simulated Retail Format:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Market', 'Express', 'To-Go'] as StoreFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormatChange(fmt)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  simulatorCandidate.format === fmt
                    ? fmt === 'Market'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                      : fmt === 'Express'
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950'
                      : 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <span>{fmt}</span>
                <span className="text-[10px] opacity-80 font-normal">
                  {fmt === 'Market' ? 'Supermarket' : fmt === 'Express' ? 'Convenience' : 'Shop-in-Shop'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Catchment Radius Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
              Automated Catchment Scan Radius:
            </span>
            <span className="text-emerald-400 font-bold font-mono">{simulatorCandidate.radiusKm} km</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 5].map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  simulatorCandidate.radiusKm === r
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Location Viability Scorecard (0 - 100) */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 text-center relative overflow-hidden">
          <div className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-2">
            Location Viability Score
          </div>

          <div className="flex items-center justify-center gap-4 my-2">
            <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${scoreColor}`}>
              <span className="text-2xl font-extrabold tracking-tight">
                {simulatorCandidate.viabilityScore}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">/ 100</span>
            </div>

            <div className="text-left space-y-1.5 text-xs">
              <div>
                <span className="text-slate-400">Ecosystem Density: </span>
                <strong className="text-slate-200">{simulatorCandidate.ecosystemScore}/100</strong>
              </div>
              <div>
                <span className="text-slate-400">Cannibalization Safety: </span>
                <strong className="text-slate-200">{simulatorCandidate.cannibalizationScore}/100</strong>
              </div>
              <div>
                <span className="text-slate-400">Risk Level: </span>
                <span className={`font-bold ${
                  simulatorCandidate.cannibalizationRisk === 'Critical' 
                    ? 'text-rose-400' 
                    : simulatorCandidate.cannibalizationRisk === 'High' 
                    ? 'text-orange-400' 
                    : 'text-emerald-400'
                }`}>
                  {simulatorCandidate.cannibalizationRisk}
                </span>
              </div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-200 leading-relaxed text-left">
            <strong>Strategic Verdict: </strong>
            {simulatorCandidate.verdict}
          </div>
        </div>

        {/* Surrounding Ecosystem Scan Results */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-semibold text-slate-200 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Scanned Surrounding POIs ({simulatorCandidate.radiusKm}km)
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ~{simulatorCandidate.estimatedTotalPOIs} POIs
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1">
                <Home className="w-3 h-3 text-indigo-400" /> Est. Villas
              </span>
              <strong className="text-slate-100">{simulatorCandidate.estimatedVillas}</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-400" /> Est. Cafes
              </span>
              <strong className="text-slate-100">{simulatorCandidate.estimatedCafes}</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Est. Restaurants</span>
              <strong className="text-slate-100">{simulatorCandidate.estimatedRestaurants}</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Est. Spas & Wellness</span>
              <strong className="text-slate-100">{simulatorCandidate.estimatedSpas}</strong>
            </div>
          </div>
        </div>

        {/* Nearest Sister Store Conflict Check */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-200 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Nearest Pepito Sister Branch
            </span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              {simulatorCandidate.nearestStoreDistKm} km
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 text-[11px] flex items-center justify-between border border-slate-800">
            <span className="font-medium text-slate-200 truncate">{simulatorCandidate.nearestStoreName}</span>
            <span className="text-slate-400 shrink-0 ml-2">({simulatorCandidate.nearestStoreFormat})</span>
          </div>
          {simulatorCandidate.nearestStoreDistKm < 1.8 && (
            <p className="text-[10px] text-rose-400 mt-1.5">
              Warning: Within 1.8km radius, risk of margin dilution and delivery catchment cannibalization.
            </p>
          )}
        </div>

        {/* Advanced Scoring Weights Accordion */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
            className="w-full p-3 flex items-center justify-between text-xs text-slate-300 hover:bg-slate-900/80 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Custom Scoring Weights (Analyst Mode)
            </span>
            {showAdvancedWeights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvancedWeights && (
            <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-950">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Villas Weight</span>
                  <span className="text-slate-200 font-mono">{Math.round(simulatorCandidate.weights.villas * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={simulatorCandidate.weights.villas}
                  onChange={(e) => handleWeightChange('villas', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Cafes Weight</span>
                  <span className="text-slate-200 font-mono">{Math.round(simulatorCandidate.weights.cafes * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={simulatorCandidate.weights.cafes}
                  onChange={(e) => handleWeightChange('cafes', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Cannibalization Penalty Sensitivity</span>
                  <span className="text-rose-400 font-mono">{Math.round(simulatorCandidate.weights.cannibalizationPenalty * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.7"
                  step="0.05"
                  value={simulatorCandidate.weights.cannibalizationPenalty}
                  onChange={(e) => handleWeightChange('cannibalizationPenalty', parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            // Reset to current coordinates
            handleFormatChange(simulatorCandidate.format);
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-800"
          title="Recalculate Model"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSaveScenario(simulatorCandidate)}
          disabled={isSaved}
          className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
            isSaved
              ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scenario Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Scenario to Comparison</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
