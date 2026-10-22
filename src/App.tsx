/**
 * SpatialPulse: Bali Retail & POI Intelligence Platform
 * Calibrated geospatial analytics application for Pepito Outlets Bali & Lombok
 */

import React, { useState, useMemo } from 'react';
import { 
  StoreFormat, 
  IslandRegion, 
  StoreCluster, 
  ProportionalMetric, 
  BaseMapStyle, 
  OutletData, 
  SimulatorCandidate 
} from './types';
import { INITIAL_PEPITO_OUTLETS, PRESET_VACANT_SITES } from './data/pepitoOutlets';
import { 
  computeCannibalizationMatrix, 
  calculateGetisOrdGi, 
  computeVoronoiPolygons,
  evaluateSiteSelection 
} from './utils/spatialCalculations';

// Components
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MapComponent } from './components/MapComponent';
import { StoreDrawer } from './components/StoreDrawer';
import { CannibalizationPanel } from './components/CannibalizationPanel';
import { HotspotPanel } from './components/HotspotPanel';
import { SimulatorDrawer } from './components/SimulatorDrawer';
import { ScenarioComparisonModal } from './components/ScenarioComparisonModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // 1. Data & Filters
  const [outlets] = useState<OutletData[]>(INITIAL_PEPITO_OUTLETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<StoreFormat[]>(['Market', 'Express', 'To-Go']);
  const [selectedRegion, setSelectedRegion] = useState<IslandRegion | 'All'>('All');
  const [selectedCluster, setSelectedCluster] = useState<StoreCluster | 'All'>('All');
  
  // 2. Map & Display Configurations
  const [proportionalMetric, setProportionalMetric] = useState<ProportionalMetric>('totalPOIs');
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('dark');
  const [showFilters, setShowFilters] = useState(true);

  // 3. Active Tool & Inspection
  const [activeTool, setActiveTool] = useState<'none' | 'buffer' | 'cannibalization' | 'hotspot' | 'simulator'>('none');
  const [selectedOutlet, setSelectedOutlet] = useState<OutletData | null>(null);
  const [bufferRadiusKm, setBufferRadiusKm] = useState<number>(3);

  // 4. Simulator State
  const [simulatorCandidate, setSimulatorCandidate] = useState<SimulatorCandidate | null>(() => {
    const initialPreset = PRESET_VACANT_SITES[0];
    const initialEval = evaluateSiteSelection(
      initialPreset.lat,
      initialPreset.lng,
      initialPreset.recommendedFormat,
      2.5,
      INITIAL_PEPITO_OUTLETS
    );

    return {
      id: `sim-init-${Date.now()}`,
      title: initialPreset.name,
      format: initialPreset.recommendedFormat,
      lat: initialPreset.lat,
      lng: initialPreset.lng,
      region: initialPreset.region,
      radiusKm: 2.5,
      weights: {
        villas: 0.30,
        cafes: 0.25,
        restaurants: 0.20,
        wellness: 0.15,
        cannibalizationPenalty: 0.35
      },
      estimatedVillas: initialEval.estimatedVillas,
      estimatedSports: initialEval.estimatedSports,
      estimatedBeauty: initialEval.estimatedBeauty,
      estimatedSpas: initialEval.estimatedSpas,
      estimatedCafes: initialEval.estimatedCafes,
      estimatedRestaurants: initialEval.estimatedRestaurants,
      estimatedTotalPOIs: initialEval.estimatedTotalPOIs,
      nearestStoreName: initialEval.nearestStore.name,
      nearestStoreDistKm: initialEval.nearestDistKm,
      nearestStoreFormat: initialEval.nearestStore.category,
      cannibalizationRisk: initialEval.cannibalizationRisk,
      viabilityScore: initialEval.viabilityScore,
      ecosystemScore: initialEval.ecosystemScore,
      cannibalizationScore: initialEval.cannibalizationScore,
      verdict: initialEval.verdict,
      recommendedAssortment: initialEval.recommendedAssortment,
      notes: initialPreset.description,
      createdAt: new Date().toISOString()
    };
  });

  // 5. Scenarios Comparison & Modals
  const [savedScenarios, setSavedScenarios] = useState<SimulatorCandidate[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Format count badges
  const formatCounts = useMemo(() => {
    return {
      Market: outlets.filter(o => o.category === 'Market').length,
      Express: outlets.filter(o => o.category === 'Express').length,
      'To-Go': outlets.filter(o => o.category === 'To-Go').length
    };
  }, [outlets]);

  // Spatial Analytics Computations (Memoized)
  const cannibalizationPairs = useMemo(() => {
    return computeCannibalizationMatrix(outlets);
  }, [outlets]);

  const hotspotPoints = useMemo(() => {
    return calculateGetisOrdGi(outlets);
  }, [outlets]);

  const voronoiPolygons = useMemo(() => {
    return computeVoronoiPolygons(outlets);
  }, [outlets]);

  // Filtered outlets
  const filteredOutlets = useMemo(() => {
    return outlets.filter((outlet) => {
      // Format filter
      if (!selectedFormats.includes(outlet.category)) return false;

      // Region filter
      if (selectedRegion !== 'All' && outlet.region !== selectedRegion) return false;

      // Cluster filter
      if (selectedCluster !== 'All' && outlet.cluster !== selectedCluster) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = outlet.name.toLowerCase().includes(query);
        const matchAddress = outlet.address.toLowerCase().includes(query);
        if (!matchName && !matchAddress) return false;
      }

      return true;
    });
  }, [outlets, selectedFormats, selectedRegion, selectedCluster, searchQuery]);

  // Format toggle handler
  const handleToggleFormat = (format: StoreFormat) => {
    setSelectedFormats((prev) => {
      if (prev.includes(format)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((f) => f !== format);
      }
      return [...prev, format];
    });
  };

  const handleResetFilters = () => {
    setSelectedFormats(['Market', 'Express', 'To-Go']);
    setSelectedRegion('All');
    setSelectedCluster('All');
    setSearchQuery('');
  };

  // Tool selection handler
  const handleSelectTool = (tool: 'none' | 'buffer' | 'cannibalization' | 'hotspot' | 'simulator') => {
    setActiveTool(tool);
    if (tool === 'simulator') {
      setSelectedOutlet(null);
    }
  };

  // Map Click for Site Selection Simulator
  const handleMapClickForSimulator = (lat: number, lng: number) => {
    const currentCandidate = simulatorCandidate;
    const format = currentCandidate?.format || 'Express';
    const radius = currentCandidate?.radiusKm || 2.5;

    const evaluated = evaluateSiteSelection(
      lat,
      lng,
      format,
      radius,
      outlets,
      currentCandidate?.weights
    );

    // Approximate region from lat/lng
    let region: IslandRegion = 'Badung';
    if (lng > 115.8) region = 'Lombok';
    else if (lat < -8.1 && lat > -8.3) region = 'Buleleng';
    else if (lat > -8.6 && lng > 115.22) region = 'Denpasar';
    else if (lat < -8.45 && lng > 115.22) region = 'Gianyar';
    else if (lng < 115.13 && lat < -8.5) region = 'Tabanan';

    setSimulatorCandidate({
      id: `sim-${Date.now()}`,
      title: `Map Coordinate Target (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      format,
      lat,
      lng,
      region,
      radiusKm: radius,
      weights: currentCandidate?.weights || {
        villas: 0.30,
        cafes: 0.25,
        restaurants: 0.20,
        wellness: 0.15,
        cannibalizationPenalty: 0.35
      },
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
      createdAt: new Date().toISOString()
    });
  };

  // Save candidate scenario
  const handleSaveScenario = (scenario: SimulatorCandidate) => {
    setSavedScenarios((prev) => {
      // Check if already in list
      if (prev.some(s => s.id === scenario.id)) return prev;
      return [scenario, ...prev];
    });
  };

  const isCurrentCandidateSaved = Boolean(
    simulatorCandidate && savedScenarios.some(s => s.id === simulatorCandidate.id)
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* 1. Global Navigation Bar */}
      <Navbar
        totalStores={outlets.length}
        formatCounts={formatCounts}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        savedScenariosCount={savedScenarios.length}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* 2. Filter Bar & Layer Settings */}
      {showFilters && (
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFormats={selectedFormats}
          onToggleFormat={handleToggleFormat}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedCluster={selectedCluster}
          onClusterChange={setSelectedCluster}
          proportionalMetric={proportionalMetric}
          onMetricChange={setProportionalMetric}
          baseMapStyle={baseMapStyle}
          onBaseMapChange={setBaseMapStyle}
          onResetFilters={handleResetFilters}
          totalFilteredCount={filteredOutlets.length}
          totalCount={outlets.length}
        />
      )}

      {/* 3. Main Geospatial Stage */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Interactive Leaflet Map Component */}
        <MapComponent
          outlets={filteredOutlets}
          selectedOutlet={selectedOutlet}
          onSelectOutlet={(outlet) => {
            setSelectedOutlet(outlet);
            if (outlet && activeTool === 'simulator') {
              setActiveTool('none');
            }
          }}
          proportionalMetric={proportionalMetric}
          baseMapStyle={baseMapStyle}
          activeTool={activeTool}
          bufferRadiusKm={bufferRadiusKm}
          cannibalizationPairs={cannibalizationPairs}
          hotspotPoints={hotspotPoints}
          voronoiPolygons={voronoiPolygons}
          simulatorCandidate={activeTool === 'simulator' ? simulatorCandidate : null}
          onMapClickForSimulator={handleMapClickForSimulator}
        />

        {/* Store Profiling & Metrics Panel (Module 2) */}
        {selectedOutlet && activeTool !== 'simulator' && (
          <StoreDrawer
            outlet={selectedOutlet}
            onClose={() => setSelectedOutlet(null)}
            allOutlets={outlets}
            onSelectSisterStore={(store) => setSelectedOutlet(store)}
            activeBufferRadiusKm={bufferRadiusKm}
            onSetBufferRadius={setBufferRadiusKm}
          />
        )}

        {/* Cannibalization Checker Panel (Module 3) */}
        {activeTool === 'cannibalization' && (
          <CannibalizationPanel
            pairs={cannibalizationPairs}
            onClose={() => setActiveTool('none')}
            onSelectStore={(store) => setSelectedOutlet(store)}
          />
        )}

        {/* Getis-Ord Gi* Hotspot Statistics Panel (Module 3) */}
        {activeTool === 'hotspot' && (
          <HotspotPanel
            hotspots={hotspotPoints}
            allOutlets={outlets}
            onClose={() => setActiveTool('none')}
            onSelectStore={(store) => setSelectedOutlet(store)}
          />
        )}

        {/* Predictive Site Selection Simulator Drawer (Module 4) */}
        {activeTool === 'simulator' && (
          <SimulatorDrawer
            simulatorCandidate={simulatorCandidate}
            onUpdateCandidate={setSimulatorCandidate}
            onClose={() => setActiveTool('none')}
            outlets={outlets}
            onSaveScenario={handleSaveScenario}
            isSaved={isCurrentCandidateSaved}
          />
        )}
      </main>

      {/* Scenario Comparison Matrix Modal */}
      {isComparisonOpen && (
        <ScenarioComparisonModal
          scenarios={savedScenarios}
          onClose={() => setIsComparisonOpen(false)}
          onDeleteScenario={(id) => setSavedScenarios(prev => prev.filter(s => s.id !== id))}
          onClearAll={() => setSavedScenarios([])}
        />
      )}

      {/* Export GIS & Data Modal */}
      {isExportOpen && (
        <ExportModal
          outlets={filteredOutlets}
          cannibalizationPairs={cannibalizationPairs}
          hotspots={hotspotPoints}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
