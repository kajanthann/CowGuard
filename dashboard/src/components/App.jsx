import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Paste your collected boundary points here ───────────────────────────────
const INITIAL_BOUNDARY = [
  { lat: 6.853737, lng: 79.905842 },
  { lat: 6.852922, lng: 79.905770 },
  { lat: 6.851838, lng: 79.905475 },
  { lat: 6.851726, lng: 79.904571 },
  { lat: 6.851275, lng: 79.904172 },
  { lat: 6.851579, lng: 79.902837 },
  { lat: 6.851493, lng: 79.901925 },
  { lat: 6.852037, lng: 79.901640 },
  { lat: 6.851706, lng: 79.900750 },
  { lat: 6.851882, lng: 79.899242 },
  { lat: 6.852811, lng: 79.899720 },
  { lat: 6.852645, lng: 79.901454 },
  { lat: 6.852713, lng: 79.903075 },
  { lat: 6.855174, lng: 79.903442 },
  { lat: 6.855224, lng: 79.903987 },
  { lat: 6.855348, lng: 79.904339 },
  { lat: 6.855046, lng: 79.906410 },
];

// ─── Sample cows (replace with real MQTT/API data) ───────────────────────────
const SAMPLE_COWS = [
  { id: "COW_01", lat: 7.8733, lng: 80.7726, battery: 87 },
  { id: "COW_02", lat: 7.8720, lng: 80.7740, battery: 62 },
  { id: "COW_03", lat: 7.8726, lng: 80.7719, battery: 45 },
];

// ─── Ray-casting geofence check ──────────────────────────────────────────────
function isInsideBoundary(point, polygon) {
  let inside = false;
  const n = polygon.length;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    if ((yi > point.lat) !== (yj > point.lat) &&
        point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
}

// ─── Area calculation (Shoelace formula, in m²) ──────────────────────────────
function calcArea(pts) {
  if (pts.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = (pts[i].lng * Math.PI) / 180 * Math.cos((pts[i].lat * Math.PI) / 180);
    const yi = (pts[i].lat * Math.PI) / 180;
    const xj = (pts[j].lng * Math.PI) / 180 * Math.cos((pts[j].lat * Math.PI) / 180);
    const yj = (pts[j].lat * Math.PI) / 180;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2) * R * R;
}

// ─── Map click handler component ─────────────────────────────────────────────
function MapClickHandler({ addMode, onMapClick }) {
  useMapEvents({ click: (e) => { if (addMode) onMapClick(e.latlng); } });
  return null;
}

// ─── Cow marker icon factory ──────────────────────────────────────────────────
function cowIcon(inside) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${inside ? "#22c55e" : "#ef4444"};
      border:3px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🐄</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// ─── Corner marker icon ───────────────────────────────────────────────────────
function cornerIcon(index) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:#f59e0b;border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;color:white;
      box-shadow:0 1px 4px rgba(0,0,0,0.5)">${index + 1}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [boundary, setBoundary]   = useState(INITIAL_BOUNDARY);
  const [cows, setCows]           = useState(SAMPLE_COWS);
  const [addMode, setAddMode]     = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  const [latInput, setLatInput]   = useState("");
  const [lngInput, setLngInput]   = useState("");
  const [toast, setToast]         = useState(null);
  const mapCenter = boundary.length
    ? [boundary[0].lat, boundary[0].lng]
    : [7.8731, 80.7718];

  // Enrich cows with inside/outside status
  const enrichedCows = cows.map(cow => ({
    ...cow,
    inside: isInsideBoundary({ lat: cow.lat, lng: cow.lng }, boundary),
  }));

  const insideCount  = enrichedCows.filter(c => c.inside).length;
  const outsideCount = enrichedCows.filter(c => !c.inside).length;
  const areaM2       = calcArea(boundary);
  const areaAcres    = (areaM2 / 4047).toFixed(2);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleMapClick(latlng) {
    const pt = { lat: +latlng.lat.toFixed(6), lng: +latlng.lng.toFixed(6) };
    setBoundary(prev => [...prev, pt]);
    showToast(`Point ${boundary.length + 1} added`);
  }

  function addManualPoint() {
    const lat = parseFloat(latInput), lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) { showToast("Invalid coordinates", "error"); return; }
    setBoundary(prev => [...prev, { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }]);
    setLatInput(""); setLngInput("");
    showToast("Point added manually");
  }

  function removePoint(i) {
    setBoundary(prev => prev.filter((_, idx) => idx !== i));
    showToast("Point removed", "error");
  }

  function exportCode() {
    const lines = boundary.map(p => `  { ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)} }`).join(",\n");
    const code  = `Point fence[${boundary.length}] = {\n${lines}\n};`;
    navigator.clipboard.writeText(code);
    showToast("Arduino code copied to clipboard!");
  }

  function exportJSON() {
    const json = JSON.stringify(boundary, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "farm_boundary.json"; a.click();
    showToast("JSON downloaded");
  }

  const polygonPositions = boundary.map(p => [p.lat, p.lng]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all
          ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      

      <div className="flex h-[calc(100vh-65px)]">

        {/* ── Left Sidebar ── */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">

          {/* Stats */}
          <div className="p-4 grid grid-cols-3 gap-2 border-b border-gray-800">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-white">{boundary.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Points</p>
            </div>
            <div className="bg-emerald-950 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{insideCount}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Inside</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${outsideCount > 0 ? "bg-red-950" : "bg-gray-800"}`}>
              <p className={`text-xl font-bold ${outsideCount > 0 ? "text-red-400" : "text-gray-500"}`}>{outsideCount}</p>
              <p className={`text-xs mt-0.5 ${outsideCount > 0 ? "text-red-600" : "text-gray-600"}`}>Outside</p>
            </div>
          </div>

          {/* Area */}
          {boundary.length >= 3 && (
            <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/50">
              <p className="text-xs text-gray-400">Estimated boundary area</p>
              <p className="text-base font-semibold text-amber-400 mt-0.5">
                {areaAcres} acres
                <span className="text-xs text-gray-500 ml-1">({Math.round(areaM2).toLocaleString()} m²)</span>
              </p>
            </div>
          )}

          {/* Add mode toggle */}
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={() => { setAddMode(m => !m); showToast(addMode ? "Edit mode off" : "Click map to add boundary points"); }}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all
                ${addMode
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}>
              {addMode ? "✏️ Click map to add points — ON" : "✏️ Click map to add points"}
            </button>
          </div>

          {/* Manual input */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Add point manually</p>
            <div className="flex gap-2 mb-2">
              <input value={latInput} onChange={e => setLatInput(e.target.value)}
                placeholder="Latitude" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"/>
              <input value={lngInput} onChange={e => setLngInput(e.target.value)}
                placeholder="Longitude" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"/>
            </div>
            <button onClick={addManualPoint}
              className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-200 transition-colors">
              + Add Coordinate
            </button>
          </div>

          {/* Boundary points list */}
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Boundary points</p>
              {boundary.length > 0 && (
                <button onClick={() => { setBoundary([]); showToast("All points cleared", "error"); }}
                  className="text-xs text-red-400 hover:text-red-300">Clear all</button>
              )}
            </div>
            {boundary.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">No points yet. Click map or add manually.</p>
            )}
            <div className="space-y-1.5">
              {boundary.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 group">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-mono">{p.lat.toFixed(5)}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.lng.toFixed(5)}</p>
                  </div>
                  <button onClick={() => removePoint(i)}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Export buttons */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            <button onClick={exportCode}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-medium text-white transition-colors">
              📋 Copy Arduino Code
            </button>
            <button onClick={exportJSON}
              className="w-full py-2 bg-blue-800 hover:bg-blue-700 rounded-lg text-xs font-medium text-white transition-colors">
              💾 Download JSON
            </button>
          </div>
        </aside>

        {/* ── Main: Map + Cow Panel ── */}
        <div className="flex-1 flex flex-col">

          {/* Map */}
          <div className="flex-1 relative">
            <MapContainer center={mapCenter} zoom={17} className="w-full h-full"
              style={{ background: "#0f172a" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"/>
              <MapClickHandler addMode={addMode} onMapClick={handleMapClick}/>

              {/* Boundary polygon */}
              {polygonPositions.length >= 3 && (
                <Polygon
                  positions={polygonPositions}
                  pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.1, weight: 2, dashArray: "6 4" }}/>
              )}

              {/* Corner markers */}
              {boundary.map((p, i) => (
                <Marker key={i} position={[p.lat, p.lng]} icon={cornerIcon(i)}>
                  <Popup>
                    <div className="text-sm">
                      <strong>Point {i + 1}</strong><br/>
                      Lat: {p.lat.toFixed(6)}<br/>
                      Lng: {p.lng.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Cow markers */}
              {enrichedCows.map(cow => (
                <Marker key={cow.id} position={[cow.lat, cow.lng]} icon={cowIcon(cow.inside)}
                  eventHandlers={{ click: () => setSelectedCow(cow) }}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{cow.id}</strong><br/>
                      Status: <span style={{ color: cow.inside ? "green" : "red" }}>
                        {cow.inside ? "Inside ✓" : "OUTSIDE ⚠️"}
                      </span><br/>
                      Battery: {cow.battery}%
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Add mode overlay hint */}
            {addMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999]
                bg-amber-500 text-black text-xs font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none">
                Click anywhere on the map to add a boundary corner
              </div>
            )}
          </div>

          {/* ── Cow status bar ── */}
          <div className="bg-gray-900 border-t border-gray-800 p-3 flex gap-3 overflow-x-auto">
            {enrichedCows.map(cow => (
              <button key={cow.id}
                onClick={() => setSelectedCow(selectedCow?.id === cow.id ? null : cow)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left
                  ${selectedCow?.id === cow.id
                    ? "border-amber-500 bg-amber-950"
                    : cow.inside
                      ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                      : "border-red-500 bg-red-950 animate-pulse"}`}>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cow.inside ? "bg-emerald-400" : "bg-red-400"}`}/>
                <div>
                  <p className="text-xs font-semibold text-white">{cow.id}</p>
                  <p className={`text-xs ${cow.inside ? "text-emerald-400" : "text-red-400"}`}>
                    {cow.inside ? "Safe" : "OUTSIDE!"}
                  </p>
                </div>
                <div className="ml-1 text-right">
                  <p className="text-xs text-gray-500">🔋</p>
                  <p className={`text-xs ${cow.battery < 20 ? "text-red-400" : "text-gray-400"}`}>{cow.battery}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Cow detail panel ── */}
        {selectedCow && (() => {
          const cow = enrichedCows.find(c => c.id === selectedCow.id);
          return (
            <aside className="w-64 bg-gray-900 border-l border-gray-800 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">{cow.id}</h2>
                <button onClick={() => setSelectedCow(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
              </div>
              <div className={`rounded-xl p-4 mb-4 text-center ${cow.inside ? "bg-emerald-950" : "bg-red-950"}`}>
                <p className="text-3xl mb-1">🐄</p>
                <p className={`text-sm font-bold ${cow.inside ? "text-emerald-400" : "text-red-400"}`}>
                  {cow.inside ? "Inside boundary" : "OUTSIDE boundary!"}
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Latitude</p>
                  <p className="text-sm font-mono text-white">{cow.lat.toFixed(6)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Longitude</p>
                  <p className="text-sm font-mono text-white">{cow.lng.toFixed(6)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Battery</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${cow.battery > 50 ? "bg-emerald-400" : cow.battery > 20 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${cow.battery}%` }}/>
                    </div>
                    <span className="text-xs text-gray-300">{cow.battery}%</span>
                  </div>
                </div>
              </div>
              {!cow.inside && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-xs text-red-300 font-medium">⚠️ Breach alert</p>
                  <p className="text-xs text-red-400 mt-1">{cow.id} is outside the farm boundary!</p>
                </div>
              )}
            </aside>
          );
        })()}
      </div>
    </div>
  );
}