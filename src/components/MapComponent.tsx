import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  OutletData, 
  StoreFormat, 
  ProportionalMetric, 
  BaseMapStyle, 
  CannibalizationPair, 
  HotspotPoint,
  SimulatorCandidate 
} from '../types';

interface MapComponentProps {
  outlets: OutletData[];
  selectedOutlet: OutletData | null;
  onSelectOutlet: (outlet: OutletData | null) => void;
  proportionalMetric: ProportionalMetric;
  baseMapStyle: BaseMapStyle;
  activeTool: 'none' | 'buffer' | 'cannibalization' | 'hotspot' | 'simulator';
  bufferRadiusKm: number;
  cannibalizationPairs: CannibalizationPair[];
  hotspotPoints: HotspotPoint[];
  voronoiPolygons: Array<{ outlet: OutletData; polygon: [number, number][] }>;
  simulatorCandidate: SimulatorCandidate | null;
  onMapClickForSimulator?: (lat: number, lng: number) => void;
}

const TILE_CONFIGS: Record<BaseMapStyle, { url: string; attribution: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap'
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

const FORMAT_COLORS: Record<StoreFormat, { primary: string; border: string; glow: string }> = {
  Market: { primary: '#10b981', border: '#047857', glow: 'rgba(16, 185, 129, 0.4)' },
  Express: { primary: '#0ea5e9', border: '#0369a1', glow: 'rgba(14, 165, 233, 0.4)' },
  'To-Go': { primary: '#f59e0b', border: '#b45309', glow: 'rgba(245, 158, 11, 0.4)' }
};

export const MapComponent: React.FC<MapComponentProps> = ({
  outlets,
  selectedOutlet,
  onSelectOutlet,
  proportionalMetric,
  baseMapStyle,
  activeTool,
  bufferRadiusKm,
  cannibalizationPairs,
  hotspotPoints,
  voronoiPolygons,
  simulatorCandidate,
  onMapClickForSimulator
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Layer Groups
  const markersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const bufferLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const cannibalizationLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const voronoiLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const hotspotLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const simulatorLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on South Bali (Canggu/Kuta/Denpasar/Ubud corridor)
    const map = L.map(mapContainerRef.current, {
      center: [-8.65, 115.19],
      zoom: 11,
      minZoom: 8,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Base Tile Layer
    const tileConfig = TILE_CONFIGS[baseMapStyle];
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add Layer Groups to map
    voronoiLayerRef.current.addTo(map);
    cannibalizationLayerRef.current.addTo(map);
    bufferLayerRef.current.addTo(map);
    hotspotLayerRef.current.addTo(map);
    markersLayerRef.current.addTo(map);
    simulatorLayerRef.current.addTo(map);

    mapInstanceRef.current = map;

    // Resize observer to prevent grey tile bugs
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update Tile Layer on BaseMap Style change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = TILE_CONFIGS[baseMapStyle];
    tileLayerRef.current.setUrl(tileConfig.url);
  }, [baseMapStyle]);

  // 3. Map Click Handler for Simulator
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (activeTool === 'simulator' && onMapClickForSimulator) {
        onMapClickForSimulator(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [activeTool, onMapClickForSimulator]);

  // 4. Render Voronoi / Thiessen Polygons (when in cannibalization tool or toggled)
  useEffect(() => {
    const layer = voronoiLayerRef.current;
    layer.clearLayers();

    if (activeTool === 'cannibalization' && voronoiPolygons.length > 0) {
      voronoiPolygons.forEach(({ outlet, polygon }) => {
        const colors = FORMAT_COLORS[outlet.category];
        const isSelected = selectedOutlet?.id === outlet.id;

        const poly = L.polygon(polygon, {
          color: isSelected ? '#38bdf8' : colors.border,
          weight: isSelected ? 2.5 : 1,
          dashArray: isSelected ? undefined : '4, 4',
          fillColor: colors.primary,
          fillOpacity: isSelected ? 0.25 : 0.08,
          interactive: true
        });

        poly.bindTooltip(
          `<strong>Trade Catchment:</strong> ${outlet.name}<br/><span style="color:#94a3b8">Voronoi polygon defines nearest customer territory</span>`,
          { className: 'leaflet-dark-tooltip' }
        );

        poly.on('click', () => {
          onSelectOutlet(outlet);
        });

        layer.addLayer(poly);
      });
    }
  }, [activeTool, voronoiPolygons, selectedOutlet, onSelectOutlet]);

  // 5. Render Cannibalization Connection Lines
  useEffect(() => {
    const layer = cannibalizationLayerRef.current;
    layer.clearLayers();

    if (activeTool === 'cannibalization') {
      cannibalizationPairs.forEach((pair) => {
        const p1: [number, number] = [pair.storeA.lat, pair.storeA.lng];
        const p2: [number, number] = [pair.storeB.lat, pair.storeB.lng];

        let strokeColor = '#3b82f6';
        let weight = 2;
        if (pair.riskLevel === 'Critical') {
          strokeColor = '#ef4444';
          weight = 3.5;
        } else if (pair.riskLevel === 'High') {
          strokeColor = '#f97316';
          weight = 2.8;
        } else if (pair.riskLevel === 'Moderate') {
          strokeColor = '#eab308';
          weight = 2;
        }

        const line = L.polyline([p1, p2], {
          color: strokeColor,
          weight,
          dashArray: '6, 6',
          opacity: 0.85
        });

        line.bindTooltip(
          `<strong>Cannibalization Risk: ${pair.riskLevel}</strong><br/>` +
          `${pair.storeA.name} ↔ ${pair.storeB.name}<br/>` +
          `Distance: <strong>${pair.distanceKm} km</strong> | Overlap: <strong>${pair.overlapPercentage}%</strong>`,
          { sticky: true }
        );

        layer.addLayer(line);
      });
    }
  }, [activeTool, cannibalizationPairs]);

  // 6. Render Buffer Catchments (1km, 3km, 5km)
  useEffect(() => {
    const layer = bufferLayerRef.current;
    layer.clearLayers();

    const renderBuffersForOutlet = (outlet: OutletData, radii: number[]) => {
      const colors = FORMAT_COLORS[outlet.category];
      radii.forEach((radiusKm) => {
        const circle = L.circle([outlet.lat, outlet.lng], {
          radius: radiusKm * 1000,
          color: colors.primary,
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: colors.primary,
          fillOpacity: 0.05 + (1 / radiusKm) * 0.04,
          interactive: false
        });
        layer.addLayer(circle);
      });
    };

    if (activeTool === 'buffer') {
      // If a store is selected, draw concentric 1km, 3km, 5km buffers
      if (selectedOutlet) {
        renderBuffersForOutlet(selectedOutlet, [1, 3, 5]);
      } else {
        // Draw selected buffer radius for all stores
        outlets.forEach((o) => {
          renderBuffersForOutlet(o, [bufferRadiusKm]);
        });
      }
    } else if (selectedOutlet && activeTool !== 'simulator') {
      // Draw standard buffer around selected store
      renderBuffersForOutlet(selectedOutlet, [bufferRadiusKm]);
    }
  }, [activeTool, selectedOutlet, outlets, bufferRadiusKm]);

  // 7. Render Getis-Ord Gi* Hotspot Layer
  useEffect(() => {
    const layer = hotspotLayerRef.current;
    layer.clearLayers();

    if (activeTool === 'hotspot') {
      hotspotPoints.forEach((hp) => {
        const isHot = hp.giZScore > 0;
        const radius = Math.max(14, Math.min(36, Math.abs(hp.giZScore) * 10));

        // Outer glow halo
        const halo = L.circleMarker([hp.lat, hp.lng], {
          radius: radius + 8,
          color: hp.color,
          weight: 1,
          fillColor: hp.color,
          fillOpacity: 0.18,
          interactive: false
        });
        layer.addLayer(halo);

        // Core statistical node
        const node = L.circleMarker([hp.lat, hp.lng], {
          radius: radius,
          color: '#ffffff',
          weight: 2,
          fillColor: hp.color,
          fillOpacity: 0.75
        });

        node.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px;">
            <div style="font-weight: 700; color: ${hp.color};">${hp.classification}</div>
            <div style="font-weight: 600; margin-top: 2px;">${hp.name}</div>
            <div>Getis-Ord Gi* Z-score: <strong>${hp.giZScore > 0 ? '+' : ''}${hp.giZScore}</strong></div>
            <div>p-value: <strong>${hp.giPValue}</strong> (${hp.giPValue < 0.05 ? 'Statistically Significant' : 'Marginal'})</div>
            <div>Surrounding POIs: <strong>${hp.totalPOIs}</strong></div>
          </div>`,
          { sticky: true }
        );

        layer.addLayer(node);
      });
    }
  }, [activeTool, hotspotPoints]);

  // 8. Render Simulator Target Pin & Radius
  useEffect(() => {
    const layer = simulatorLayerRef.current;
    layer.clearLayers();

    if (activeTool === 'simulator' && simulatorCandidate) {
      const { lat, lng, radiusKm, viabilityScore, format, cannibalizationRisk } = simulatorCandidate;

      // Catchment scan circle
      const scanCircle = L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: '#10b981',
        weight: 2,
        dashArray: '4, 4',
        fillColor: '#10b981',
        fillOpacity: 0.12
      });
      layer.addLayer(scanCircle);

      // Custom HTML Pin with pulsing ring
      const customPinIcon = L.divIcon({
        className: 'custom-simulator-pin',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div class="pulsing-marker" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); border: 2px solid #10b981;"></div>
            <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #0f172a; border: 3px solid #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
              <span style="font-size: 11px; font-weight: 800; color: #10b981;">★</span>
            </div>
            <div style="position: absolute; top: -20px; background: #022c22; border: 1px solid #10b981; color: #a7f3d0; padding: 1px 6px; border-radius: 9999px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
              Score: ${viabilityScore}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([lat, lng], { icon: customPinIcon });
      marker.bindTooltip(
        `<strong>What-If Simulation Target</strong><br/>Format: <strong>${format}</strong><br/>Viability Score: <strong>${viabilityScore}/100</strong><br/>Cannibalization: <strong>${cannibalizationRisk}</strong>`,
        { permanent: false, offset: [0, -20] }
      );

      layer.addLayer(marker);
    }
  }, [activeTool, simulatorCandidate]);

  // 9. Render Outlet Markers with Proportional Sizing
  useEffect(() => {
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // Calculate max value for proportional sizing
    const metricValues = outlets.map((o) => {
      if (proportionalMetric === 'villas') return o.villas;
      if (proportionalMetric === 'cafes') return o.cafes;
      if (proportionalMetric === 'spas') return o.spas;
      if (proportionalMetric === 'restaurants') return o.restaurants;
      if (proportionalMetric === 'totalPOIs') return o.totalPOIs;
      return 1;
    });
    const maxVal = Math.max(1, ...metricValues);

    outlets.forEach((outlet) => {
      const colors = FORMAT_COLORS[outlet.category];
      const isSelected = selectedOutlet?.id === outlet.id;

      // Proportional radius calculation
      let radius = 9;
      if (proportionalMetric !== 'fixed') {
        let val = outlet.totalPOIs;
        if (proportionalMetric === 'villas') val = outlet.villas;
        else if (proportionalMetric === 'cafes') val = outlet.cafes;
        else if (proportionalMetric === 'spas') val = outlet.spas;
        else if (proportionalMetric === 'restaurants') val = outlet.restaurants;

        // Radius between 7 and 24
        radius = Math.round(7 + (val / maxVal) * 17);
      }

      if (isSelected) {
        // Render selection glow ring
        const glow = L.circleMarker([outlet.lat, outlet.lng], {
          radius: radius + 7,
          color: '#ffffff',
          weight: 2,
          fillColor: colors.primary,
          fillOpacity: 0.25,
          interactive: false
        });
        layer.addLayer(glow);
      }

      const marker = L.circleMarker([outlet.lat, outlet.lng], {
        radius: isSelected ? radius + 2 : radius,
        color: isSelected ? '#ffffff' : colors.border,
        weight: isSelected ? 3 : 1.5,
        fillColor: colors.primary,
        fillOpacity: isSelected ? 0.95 : 0.85
      });

      // Custom rich popup content
      marker.bindPopup(`
        <div style="padding: 12px; min-width: 220px; font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background: ${colors.glow}; color: ${colors.primary};">
              ${outlet.category}
            </span>
            <span style="font-size: 11px; color: #94a3b8;">${outlet.region}</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">
            ${outlet.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; line-height: 1.3; margin-bottom: 10px;">
            ${outlet.address}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #1e293b; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 11px;">
            <div><span style="color: #94a3b8;">Villas:</span> <strong style="color: #f1f5f9;">${outlet.villas}</strong></div>
            <div><span style="color: #94a3b8;">Cafes:</span> <strong style="color: #f1f5f9;">${outlet.cafes}</strong></div>
            <div><span style="color: #94a3b8;">Spas:</span> <strong style="color: #f1f5f9;">${outlet.spas}</strong></div>
            <div><span style="color: #94a3b8;">Restaurants:</span> <strong style="color: #f1f5f9;">${outlet.restaurants}</strong></div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; border-top: 1px solid #334155; padding-top: 8px;">
            <span style="color: #94a3b8;">Total Surrounding POIs:</span>
            <strong style="color: #38bdf8; font-size: 13px;">${outlet.totalPOIs}</strong>
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectOutlet(outlet);
      });

      layer.addLayer(marker);
    });
  }, [outlets, selectedOutlet, proportionalMetric, onSelectOutlet]);

  // 10. Center on Selected Store
  useEffect(() => {
    if (selectedOutlet && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedOutlet.lat, selectedOutlet.lng], 13, {
        duration: 1.0
      });
    }
  }, [selectedOutlet]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" id="spatial-pulse-map" />

      {/* Map Legend (Floating bottom-left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-xs max-w-xs pointer-events-auto">
        <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
          <span>Store Formats</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {proportionalMetric === 'fixed' ? 'Fixed' : `Scale: ${proportionalMetric}`}
          </span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300"></span>
              <span className="text-slate-300">Market</span>
            </div>
            <span className="text-slate-400">Full-scale Supermarket</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-300"></span>
              <span className="text-slate-300">Express</span>
            </div>
            <span className="text-slate-400">Convenience Hub</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300"></span>
              <span className="text-slate-300">To-Go</span>
            </div>
            <span className="text-slate-400">Shop-in-Shop</span>
          </div>
        </div>

        {/* Dynamic Legend for Active Tool */}
        {activeTool === 'hotspot' && (
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <div className="font-semibold text-amber-400 mb-1.5 text-[11px]">
              Getis-Ord Gi* Statistics
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-slate-300">Hot Spot (99%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-300">Hot Spot (95%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span className="text-slate-300">Not Significant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-300">Cold Spot (95%)</span>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'cannibalization' && (
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <div className="font-semibold text-rose-400 mb-1.5 text-[11px]">
              Cannibalization Proximity
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 border-b border-red-500 border-dashed"></span>
                <span className="text-slate-300">Critical (&lt; 1.2km | &gt;65% Overlap)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-500 border-b border-orange-500 border-dashed"></span>
                <span className="text-slate-300">High (&lt; 2.2km | 40-65% Overlap)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Guidance Banner (when simulator active) */}
      {activeTool === 'simulator' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/95 backdrop-blur border border-emerald-500/50 rounded-full px-4 py-1.5 text-xs text-emerald-200 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Click anywhere on the map to evaluate site viability coordinates</span>
        </div>
      )}
    </div>
  );
};
