import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function isInsideBoundary(point, polygon) {
  let inside = false;
  const n = polygon.length;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    if (
      (yi > point.lat) !== (yj > point.lat) &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    ) inside = !inside;
    j = i;
  }
  return inside;
}

function cornerIcon(index) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#16a34a;border:2px solid white;color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:9px;font-weight:bold;
      box-shadow:0 2px 6px rgba(0,0,0,.35);">${index + 1}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function cowMarkerIcon(inside, isSelected) {
  const size   = isSelected ? 40 : 28;
  const font   = isSelected ? 22 : 15;
  const ring   = isSelected ? `box-shadow:0 0 0 3px ${inside ? "#4ade80" : "#f87171"},0 4px 14px rgba(0,0,0,0.5);` : "box-shadow:0 2px 8px rgba(0,0,0,0.4);";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${inside ? "#16a34a" : "#dc2626"};
      border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:${font}px;${ring}
      transition:all 0.2s;">🐄</div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Bounded / Free view controller
function MapViewController({ mode, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (mode === "bounded") {
      map.fitBounds(bounds, { padding: [25, 25] });
      map.setMaxBounds(bounds.pad(0.03));
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.setMaxBounds(null);
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [map, bounds, mode]);
  return null;
}

// Fly to selected cow in free view
function FlyToCow({ lat, lng, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 18, { duration: 0.8 });
  }, [trigger]);   // eslint-disable-line
  return null;
}

const CowMapModal = ({ cow: initialCow, boundary, allCows = [], onClose }) => {
  const [mode, setMode]           = useState("bounded");
  const [selectedCow, setSelectedCow] = useState(initialCow);
  const [flyTrigger, setFlyTrigger]   = useState(0);

  const polygonPositions = boundary.map((p) => [p.lat, p.lng]);
  const bounds           = L.latLngBounds(polygonPositions);

  // Always use allCows if provided, else just the single cow
  const cowList = (allCows.length > 0 ? allCows : [initialCow]).map((c) => ({
    ...c,
    inside: isInsideBoundary({ lat: c.lat, lng: c.lng }, boundary),
  }));

  const sel          = cowList.find((c) => c.cowId === selectedCow.cowId) || cowList[0];
  const outsideCount = cowList.filter((c) => !c.inside).length;

  const handleSelectCow = (c) => {
    setSelectedCow(c);
    if (mode === "full") setFlyTrigger((t) => t + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-[820px] max-w-[96vw] bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col"
        style={{ height: "88vh", maxHeight: 660 }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center text-lg">🐄</div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {sel.name} · {sel.cowId}
              </h2>
              <p className="text-xs text-gray-500">{sel.breed} · {sel.loraId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Fence badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              ${sel.inside ? "bg-emerald-900/70 text-emerald-400" : "bg-red-900/70 text-red-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sel.inside ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`} />
              {sel.inside ? "Inside Boundary" : "OUTSIDE Boundary!"}
            </span>

            {/* View toggle */}
            <div className="flex bg-gray-800 border border-gray-700 rounded-full p-0.5">
              <button
                onClick={() => setMode("bounded")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition
                  ${mode === "bounded" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white"}`}
              >
                Farm View
              </button>
              <button
                onClick={() => setMode("full")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition
                  ${mode === "full" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white"}`}
              >
                Free View
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm flex items-center justify-center transition"
            >✕</button>
          </div>
        </div>

        {/* ── Map ── */}
        <div className="relative flex-1 min-h-0">

          {outsideCount > 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none
              bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg animate-bounce">
              ⚠️ {outsideCount} cow{outsideCount > 1 ? "s" : ""} outside the boundary!
            </div>
          )}

          <MapContainer center={[sel.lat, sel.lng]} zoom={17} className="w-full h-full">
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewController mode={mode} bounds={bounds} />

            {mode === "full" && (
              <FlyToCow lat={sel.lat} lng={sel.lng} trigger={flyTrigger} />
            )}

            {/* Farm boundary polygon */}
            <Polygon
              positions={polygonPositions}
              pathOptions={{
                color: "#16a34a",
                fillColor: "#22c55e",
                fillOpacity: 0.15,
                weight: 3,
              }}
            />

            {/* Corner markers */}
            {boundary.map((point, index) => (
              <Marker
                key={`corner-${index}`}
                position={[point.lat, point.lng]}
                icon={cornerIcon(index)}
              >
                <Popup>
                  <strong>Point {index + 1}</strong><br />
                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                </Popup>
              </Marker>
            ))}

            {/* Cow markers */}
            {cowList.map((c) => (
              <Marker
                key={c.cowId}
                position={[c.lat, c.lng]}
                icon={cowMarkerIcon(c.inside, c.cowId === sel.cowId)}
                eventHandlers={{ click: () => handleSelectCow(c) }}
              >
                <Popup>
                  <div style={{ minWidth: 150 }}>
                    <strong>{c.name} ({c.cowId})</strong><br />
                    Status:{" "}
                    <span style={{ color: c.inside ? "green" : "red", fontWeight: 600 }}>
                      {c.inside ? "Inside ✓" : "OUTSIDE ⚠️"}
                    </span><br />
                    Lat: {c.lat.toFixed(6)}<br />
                    Lng: {c.lng.toFixed(6)}<br />
                    Battery: {c.battery}%
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ── Bottom cow strip ── */}
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-2.5 flex gap-2.5 overflow-x-auto flex-shrink-0">
          {cowList.map((c) => (
            <button
              key={c.cowId}
              onClick={() => handleSelectCow(c)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all
                ${c.cowId === sel.cowId
                  ? "border-emerald-500 bg-emerald-950"
                  : c.inside
                    ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                    : "border-red-500 bg-red-950 animate-pulse"}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.inside ? "bg-emerald-400" : "bg-red-400"}`} />
              <div>
                <p className="text-xs font-semibold text-white">{c.name}</p>
                <p className={`text-xs ${c.inside ? "text-emerald-400" : "text-red-400"}`}>
                  {c.inside ? "Safe" : "Outside!"}
                </p>
              </div>
              <div className="ml-1 w-10">
                <div className="bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${c.battery > 50 ? "bg-emerald-400" : c.battery > 20 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${c.battery}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-right mt-0.5">{c.battery}%</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer info strip ── */}
        <div className="grid grid-cols-4 divide-x divide-gray-800 border-t border-gray-800 bg-gray-900 flex-shrink-0">
          {[
            { label: "Latitude",  value: sel.lat.toFixed(6) },
            { label: "Longitude", value: sel.lng.toFixed(6) },
            { label: "Battery",   value: `${sel.battery}%` },
            { label: "Last Seen", value: sel.status === "active" ? "● Live" : sel.status },
          ].map((item) => (
            <div key={item.label} className="px-4 py-2.5 text-center">
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <p className={`text-xs font-mono font-semibold
                ${item.label === "Last Seen" && sel.status === "active" ? "text-emerald-400" : "text-white"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CowMapModal;