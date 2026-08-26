import { MapContainer, TileLayer, CircleMarker, Marker, GeoJSON, Polygon, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MUSTANG_BOUNDARY } from "./Boundary";

// npm install leaflet react-leaflet
// Tiles come from CartoDB's free light basemap, no API key needed.
// Swap the TileLayer url for Mapbox if you already pay for a Mapbox token.
//
// This file owns the map only: boundary, target-coverage rings, planting
// areas, planned tree locations, legend, and a progress stat card.
// ImpactMap.tsx imports and renders it inside the page layout.

// Approximate centroid of the placeholder Mustang boundary in Boundary.ts,
// used only to position the label callout. Recompute this once you swap in
// the real GeoJSON, or derive it programmatically with @turf/centroid. 28.79, 83.76
const MUSTANG_CENTER = { name: "Mustang District", lat: 28.79, lng: 83.76 }; 

// Total district-wide planting target. Drives the stat card and is split
// across zones below (zone targets should sum to this).
export const DISTRICT_TARGET_TREES = 10000;

const mustangLabelIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform: translateY(-46px);">
      <span style="background:white; color:#111827; font-weight:600; font-size:13px; padding:6px 12px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.15); white-space:nowrap;">
        ${MUSTANG_CENTER.name}
      </span>
      <span style="width:10px; height:10px; background:white; transform:translateY(-5px) rotate(45deg); box-shadow:2px 2px 4px rgba(0,0,0,0.06);"></span>
      <span style="width:20px; height:20px; border-radius:9999px; background:rgba(153,2,0,0.15); display:flex; align-items:center; justify-content:center; margin-top:-6px;">
        <span style="width:10px; height:10px; border-radius:9999px; background:#990200; border:2px solid white;"></span>
      </span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// ---------------------------------------------------------------------------
// Planting zones
// ---------------------------------------------------------------------------

export interface TreePoint {
  id: string;
  lat: number;
  lng: number;
  species: string;
  // How many actual planned trees this single dot stands in for. Used for
  // dot-density rendering so a 10,000-tree target doesn't mean 10,000 DOM
  // nodes on the map.
  treesRepresented: number;
  donor?: string;
}

export interface OrchardZone {
  id: string;
  name: string;
  color: string; // used for both the planting-area fill and its planned trees
  // Polygon outline of the plot, [lat, lng][]. Replace with real coordinates
  // from Overpass Turbo, HDX, geoBoundaries, or a hand-traced shape in
  // geojson.io once the backend has real plot boundaries.
  boundary: [number, number][];
  center: [number, number];
  targetTrees: number;
  trees: TreePoint[];
}

const SPECIES = ["Apple — Golden Delicious", "Apple — Fuji", "Apricot", "Walnut"];

// Builds a dot-density grid: `rows * cols` markers, each one standing in for
// `treesPerDot` planned trees, so rows * cols * treesPerDot ≈ targetTrees.
// This keeps the marker count in the low hundreds even for a district-wide
// target in the thousands, while still reading as dense planting rows.
// Alternate rows are offset by half a column step, the way real orchards
// stagger planting for spacing.
function generatePlannedGrid(
  bounds: { south: number; north: number; west: number; east: number },
  rows: number,
  cols: number,
  treesPerDot: number,
  idPrefix: string
): TreePoint[] {
  const trees: TreePoint[] = [];
  const latStep = (bounds.north - bounds.south) / (rows + 1);
  const lngStep = (bounds.east - bounds.west) / (cols + 1);

  let counter = 0;
  for (let r = 0; r < rows; r++) {
    const rowOffset = r % 2 === 0 ? 0 : lngStep / 2;
    for (let c = 0; c < cols; c++) {
      counter++;
      const lat = bounds.south + (r + 1) * latStep;
      const lng = bounds.west + (c + 1) * lngStep + rowOffset;

      trees.push({
        id: `${idPrefix}-t${counter}`,
        lat,
        lng,
        species: SPECIES[counter % SPECIES.length],
        treesRepresented: treesPerDot,
        donor: counter % 15 === 0 ? `Sponsored by donor #${counter}` : undefined,
      });
    }
  }
  return trees;
}

// Expands a zone's boundary outward from its center by `factor` to
// represent the projected target-coverage area — the land the district
// intends to bring under planting as the program scales, beyond what's
// currently mapped. Replace with a real projected-expansion polygon once
// the backend has one; this is a placeholder approximation.
function expandBoundary(
  boundary: [number, number][],
  center: [number, number],
  factor: number
): [number, number][] {
  return boundary.map(([lat, lng]) => [
    center[0] + (lat - center[0]) * factor,
    center[1] + (lng - center[1]) * factor,
  ]);
}

// Placeholder sites, both inside the Mustang boundary. Swap for real plot
// data from the backend, same shape. Targets sum to DISTRICT_TARGET_TREES.
// Each zone's rows * cols * treesPerDot equals its targetTrees exactly, so
// the "planned" count shown in the UI always matches the target.
export const ORCHARD_ZONES: OrchardZone[] = [
  {
    id: "kagbeni",
    name: "Kagbeni Community Orchard",
    color: "#11512a",
    boundary: [
      [28.798, 83.786],
      [28.799, 83.792],
      [28.803, 83.793],
      [28.804, 83.788],
      [28.801, 83.785],
    ],
    center: [28.801, 83.789],
    targetTrees: 6000,
    // 20 x 30 dots x 10 trees/dot = 600 markers standing in for 6,000 trees.
    trees: generatePlannedGrid(
      { south: 28.7985, north: 28.8035, west: 83.7865, east: 83.7925 },
      20,
      30,
      10,
      "kag"
    ),
  },
  {
    id: "jomsom",
    name: "Jomsom Valley Plantation",
    color: "#1d6fa5",
    boundary: [
      [28.78, 83.72],
      [28.783, 83.727],
      [28.787, 83.726],
      [28.786, 83.719],
      [28.782, 83.717],
    ],
    center: [28.784, 83.722],
    targetTrees: 4000,
    // 20 x 20 dots x 10 trees/dot = 400 markers standing in for 4,000 trees.
    trees: generatePlannedGrid(
      { south: 28.7805, north: 28.7865, west: 83.7175, east: 83.7265 },
      20,
      20,
      10,
      "jom"
    ),
  },
];

// Planned vs. target tree counts for a single zone. Replaces the old
// status-based zoneStatusCounts (planted/growing/mature no longer apply
// since these are projected, not-yet-planted locations).
export function zoneProgress(zone: OrchardZone) {
  const planned = zone.trees.reduce((sum, t) => sum + t.treesRepresented, 0);
  const pct = Math.round((planned / zone.targetTrees) * 100);
  return { planned, target: zone.targetTrees, pct };
}

// Compatibility alias — if ImpactMap.tsx (or anything else) still imports
// `zoneStatusCounts`, this keeps that import working with the new
// planned/target shape instead of the old status breakdown. Safe to delete
// once callers are updated to use zoneProgress directly.
export const zoneStatusCounts = zoneProgress;

function districtProgress() {
  const planned = ORCHARD_ZONES.reduce((sum, z) => sum + zoneProgress(z).planned, 0);
  return { planned, target: DISTRICT_TARGET_TREES, pct: Math.round((planned / DISTRICT_TARGET_TREES) * 100) };
}

function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-[500] bg-white rounded-xl shadow-md px-4 py-3">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Map key</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 inline-block" style={{ backgroundColor: "#ff4500" }} />
          <span className="text-xs text-gray-700">Mustang District boundary</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm inline-block border"
            style={{ backgroundColor: "rgba(77,148,99,0.18)", borderColor: "#11512a" }}
          />
          <span className="text-xs text-gray-700">Planting area</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm inline-block border border-dashed"
            style={{ backgroundColor: "rgba(77,148,99,0.06)", borderColor: "#4d9463" }}
          />
          <span className="text-xs text-gray-700">Target coverage area</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#11512a" }} />
          <span className="text-xs text-gray-700">Planned tree location (1 dot ≈ 10 trees)</span>
        </div>
      </div>
    </div>
  );
}

function ProgressStat() {
  const { planned, target, pct } = districtProgress();
  return (
    <div className="absolute top-4 right-4 z-[500] bg-white rounded-xl shadow-md px-4 py-3 min-w-[180px]">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Target coverage</p>
      <p className="text-lg font-bold text-gray-900">
        {planned.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ {target.toLocaleString()} trees</span>
      </p>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#11512a" }} />
      </div>
      <p className="text-[11px] text-gray-500 mt-1">{pct}% of district goal planned</p>
    </div>
  );
}

export default function MustangOrchardMap() {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height: 560 }}>
      <MapContainer
        center={[28.79, 83.76]}
        zoom={13}
        scrollWheelZoom={false}
        preferCanvas={true}
        style={{ height: "100%", width: "100%", background: "#f8f8f8" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* District boundary. MUSTANG_BOUNDARY is a placeholder shape, swap
            the file's contents for real coordinates from Overpass Turbo,
            HDX, or geoBoundaries and this renders unchanged. */}
        <GeoJSON data={MUSTANG_BOUNDARY as any} style={{ color: "#ff4500", weight: 3, fillOpacity: 0 }} />

        <Marker position={[MUSTANG_CENTER.lat, MUSTANG_CENTER.lng]} icon={mustangLabelIcon} interactive={false} />

        {ORCHARD_ZONES.map((zone) => (
          <div key={zone.id}>
            {/* Target coverage: the projected footprint once planting scales
                to the zone's full target — drawn first so it sits behind
                the committed planting area. */}
            <Polygon
              positions={expandBoundary(zone.boundary, zone.center, 1.6)}
              pathOptions={{ color: "#4d9463", weight: 1.5, dashArray: "6 6", fillColor: "#4d9463", fillOpacity: 0.06 }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{zone.name} — target coverage</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Projected planting footprint at full {zone.targetTrees.toLocaleString()}-tree target.
                  </p>
                </div>
              </Popup>
            </Polygon>

            {/* Planting area: the currently mapped, committed plot. */}
            <Polygon
              positions={zone.boundary}
              pathOptions={{ color: zone.color, weight: 2, fillColor: zone.color, fillOpacity: 0.15 }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{zone.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {zoneProgress(zone).planned.toLocaleString()} planned trees &middot; target {zone.targetTrees.toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Polygon>

            {/* Planned tree locations, rendered as a dot-density grid: each
                dot stands in for several trees (see treesRepresented), so
                the marker count stays low even at a 10k-tree target. Sized
                up (radius 6) so density reads clearly without zooming in. */}
            {zone.trees.map((tree) => (
              <CircleMarker
                key={tree.id}
                center={[tree.lat, tree.lng]}
                radius={6}
                pathOptions={{
                  color: "#ffffff",
                  weight: 0.75,
                  fillColor: zone.color,
                  fillOpacity: 0.85,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Planned tree cluster</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Represents {tree.treesRepresented} planned trees &middot; {tree.species}
                    </p>
                    <p className="text-gray-500 text-xs">{zone.name}</p>
                    {tree.donor && <p className="text-gray-500 text-xs">{tree.donor}</p>}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </div>
        ))}
      </MapContainer>

      <Legend />
      <ProgressStat />
    </div>
  );
}