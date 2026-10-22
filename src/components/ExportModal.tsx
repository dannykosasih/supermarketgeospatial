import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  FileText, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { OutletData, CannibalizationPair, HotspotPoint } from '../types';
import { calculateDerivedMetrics } from '../utils/spatialCalculations';

interface ExportModalProps {
  outlets: OutletData[];
  cannibalizationPairs: CannibalizationPair[];
  hotspots: HotspotPoint[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  outlets,
  cannibalizationPairs,
  hotspots,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  // 1. Export Standard CSV
  const exportCSV = () => {
    const headers = [
      'Category',
      'Name of the outlet',
      'Address',
      'Latitude',
      'Longitude',
      'Region',
      '# of Villas',
      '# of Sports Arenas',
      '# of Beauty Clinics',
      '# of Spas',
      '# of Coffeeshops / Cafes',
      '# of Restaurants',
      'Total Surrounding POIs',
      'Cafe-to-Villa Ratio',
      'Tourism Density Index',
      'Lifestyle Quotient',
      'Store Cluster'
    ];

    const rows = outlets.map((o) => {
      const m = calculateDerivedMetrics(o);
      return [
        `"${o.category}"`,
        `"${o.name.replace(/"/g, '""')}"`,
        `"${o.address.replace(/"/g, '""')}"`,
        o.lat,
        o.lng,
        `"${o.region}"`,
        o.villas,
        o.sportsArenas,
        o.beautyClinics,
        o.spas,
        o.cafes,
        o.restaurants,
        o.totalPOIs,
        m.cafeToVillaRatio,
        m.tourismDensityIndex,
        m.lifestyleQuotient,
        `"${o.cluster}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csvContent, `spatialpulse_pepito_outlets_${formatDate()}.csv`, 'text/csv');
  };

  // 2. Export GeoJSON (RFC 7946 Standard for QGIS / ArcGIS / Mapbox)
  const exportGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      metadata: {
        platform: 'SpatialPulse: Bali Retail & POI Intelligence Platform',
        generatedAt: new Date().toISOString(),
        totalOutlets: outlets.length
      },
      features: outlets.map((o) => {
        const m = calculateDerivedMetrics(o);
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [o.lng, o.lat]
          },
          properties: {
            id: o.id,
            category: o.category,
            name: o.name,
            address: o.address,
            region: o.region,
            villas: o.villas,
            sportsArenas: o.sportsArenas,
            beautyClinics: o.beautyClinics,
            spas: o.spas,
            cafes: o.cafes,
            restaurants: o.restaurants,
            totalPOIs: o.totalPOIs,
            cluster: o.cluster,
            cafeToVillaRatio: m.cafeToVillaRatio,
            tourismDensityIndex: m.tourismDensityIndex,
            lifestyleQuotient: m.lifestyleQuotient,
            averageBasketSizeIDR: o.averageBasketSizeIDR
          }
        };
      })
    };

    const jsonString = JSON.stringify(featureCollection, null, 2);
    downloadFile(jsonString, `spatialpulse_pepito_geodata_${formatDate()}.geojson`, 'application/geo+json');
  };

  // 3. Export Executive GIS Markdown Summary
  const generateSummaryReport = () => {
    const criticalCannibalization = cannibalizationPairs.filter((p) => p.riskLevel === 'Critical');
    const highCannibalization = cannibalizationPairs.filter((p) => p.riskLevel === 'High');
    const topHotspots = [...hotspots].filter((h) => h.giZScore >= 1.96).sort((a, b) => b.giZScore - a.giZScore);

    return `# SpatialPulse: Executive Geospatial Intelligence Briefing
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Target Region: Bali & Lombok Retail Footprint Calibration

## 1. Network Macro Footprint
- Total Calibrated Outlets: ${outlets.length} stores
  - Market Format: ${outlets.filter((o) => o.category === 'Market').length}
  - Express Format: ${outlets.filter((o) => o.category === 'Express').length}
  - To-Go Format: ${outlets.filter((o) => o.category === 'To-Go').length}
- Aggregate Surrounding Ecosystem: ${outlets.reduce((acc, o) => acc + o.totalPOIs, 0).toLocaleString()} Total Surrounding POIs
- Core Cluster Breakdown:
  - Tourist Villa Hotspots: ${outlets.filter((o) => o.cluster === 'Tourist Villa Hotspot').length} stores
  - Expat Lifestyle Havens: ${outlets.filter((o) => o.cluster === 'Expat Lifestyle Haven').length} stores
  - Urban Commercial & Transit: ${outlets.filter((o) => o.cluster === 'Urban Commercial Hub' || o.cluster === 'Local Residential / Transit').length} stores

## 2. Cannibalization Vulnerabilities & Store Pairs
- Critical Overlap (< 1.2km): ${criticalCannibalization.length} store pairs
${criticalCannibalization
  .map(
    (p) =>
      `  - ${p.storeA.name} ↔ ${p.storeB.name} (${p.distanceKm}km apart, estimated ${p.overlapPercentage}% trade area overlap)`
  )
  .join('\n')}
- High Proximity Overlap (< 2.2km): ${highCannibalization.length} store pairs

## 3. Spatial Statistical Clustering (Getis-Ord Gi*)
- Statistically Significant Hot Spots (95%+ Confidence, z >= +1.96):
${topHotspots.map((h) => `  - ${h.name} (Gi* Z: +${h.giZScore}, p: ${h.giPValue}, POIs: ${h.totalPOIs})`).join('\n')}

## 4. Expansion Assortment Strategy
- Villa Hotspots (Canggu, Seminyak, Ubud, Bingin): Prioritize high-margin European imports, artisanal cheeses, organic produce, and premium alcoholic beverages.
- Urban/Residential Hubs (Renon, Gatot Subroto, Kediri Tabanan): Prioritize bulk household staples, local butchery, and competitive everyday value SKUs.
`;
  };

  const exportSummaryReport = () => {
    const text = generateSummaryReport();
    downloadFile(text, `spatialpulse_executive_gis_briefing_${formatDate()}.md`, 'text/markdown');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateSummaryReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = () => new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="export-data-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 text-xs"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Export Analytics & GIS Data
              </h2>
              <p className="text-[11px] text-slate-400">
                Download filtered dataset for QGIS, ArcGIS, Excel, or executive briefs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          {/* CSV Option */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-xs">
                  CSV / Excel Format (.csv)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  Includes all {outlets.length} outlets, individual POI metrics (villas, spas, cafes), and computed ratio indicators.
                </p>
              </div>
            </div>
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>

          {/* GeoJSON Option */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 mt-0.5">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-xs">
                  GeoJSON Spatial Feature Collection (.geojson)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  Standard RFC 7946 geodata with Point coordinates and full attribute table for direct import into QGIS, ArcGIS, or Mapbox.
                </p>
              </div>
            </div>
            <button
              onClick={exportGeoJSON}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download GeoJSON
            </button>
          </div>

          {/* Executive Markdown Option */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-xs">
                  Executive GIS Briefing Report (.md)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  Comprehensive markdown summary with cannibalization conflict list, Getis-Ord Gi* hotspot findings, and category recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                title="Copy report markdown to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Copy'}
              </button>
              <button
                onClick={exportSummaryReport}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 text-center">
          Calibrated with Pepito Outlets Bali & Lombok Retail GIS Intelligence Engine
        </div>
      </div>
    </div>
  );
};
