import { useState, useEffect } from "react";
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
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

// ── Sample cows inside the boundary ─────────────────────────────────────────
const SAMPLE_COWS = [
  { id: "COW_01", name: "Mala",    lat: 6.851606, lng: 79.905722, battery: 85 },
  { id: "COW_02", name: "Nila",    lat: 6.8528, lng: 79.9035, battery: 72 },
  { id: "COW_03", name: "Ganga",   lat: 6.8522, lng: 79.9020, battery: 91 },
  { id: "COW_04", name: "Kamala",  lat: 6.8518, lng: 79.9030, battery: 38 },
  { id: "COW_05", name: "Sundari", lat: 6.8525, lng: 79.9055, battery: 60 },
];

// ── Ray-casting geofence check ────────────────────────────────────────────────
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

// ── Icons ─────────────────────────────────────────────────────────────────────
function cornerIcon(index) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#16a34a;border:2px solid white;color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:9px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,.35);">
      ${index + 1}
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function cowIcon(inside) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:25px;height:25px;border-radius:50%;
      background:${inside ? "#16a34a" : "#dc2626"};
      border:1px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:15px;box-shadow:0 3px 10px rgba(0,0,0,0.45);">🐄</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

// ── Map controller ────────────────────────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────────────────────
const Boundary = () => {
  const [mode, setMode] = useState("bounded");
  const [selectedCow, setSelectedCow] = useState(null);

  const polygonPositions = INITIAL_BOUNDARY.map((p) => [p.lat, p.lng]);
  const bounds = L.latLngBounds(polygonPositions);
  const center = bounds.getCenter();

  const enrichedCows = SAMPLE_COWS.map((cow) => ({
    ...cow,
    inside: isInsideBoundary({ lat: cow.lat, lng: cow.lng }, INITIAL_BOUNDARY),
  }));

  const insideCount  = enrichedCows.filter((c) => c.inside).length;
  const outsideCount = enrichedCows.filter((c) => !c.inside).length;

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">


      {/* ── Map area ── */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1">

          {/* View toggle */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex bg-gray-900/90 backdrop-blur border border-gray-700 rounded-full p-1 shadow-lg">
            <button
              onClick={() => setMode("bounded")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                mode === "bounded" ? "bg-emerald-500 text-white shadow" : "text-gray-300 hover:text-white"
              }`}
            >
              Bounded View
            </button>
            <button
              onClick={() => setMode("full")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                mode === "full" ? "bg-emerald-500 text-white shadow" : "text-gray-300 hover:text-white"
              }`}
            >
              Full View
            </button>
          </div>

          {/* Alert banner */}
          {outsideCount > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
              bg-red-600 text-white text-xs font-semibold px-5 py-2 rounded-full shadow-lg animate-bounce">
              ⚠️ {outsideCount} cow{outsideCount > 1 ? "s" : ""} outside the boundary!
            </div>
          )}

          <MapContainer center={center} zoom={17} className="w-full h-full">
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewController mode={mode} bounds={bounds} />

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

            {/* Boundary corner markers */}
            {INITIAL_BOUNDARY.map((point, index) => (
              <Marker key={`corner-${index}`} position={[point.lat, point.lng]} icon={cornerIcon(index)}>
                <Popup>
                  <strong>Point {index + 1}</strong><br />
                  {point.lat}, {point.lng}
                </Popup>
              </Marker>
            ))}

            {/* Cow markers */}
            {enrichedCows.map((cow) => (
              <Marker
                key={cow.id}
                position={[cow.lat, cow.lng]}
                icon={cowIcon(cow.inside)}
                eventHandlers={{ click: () => setSelectedCow(cow) }}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <strong>{cow.name} ({cow.id})</strong><br />
                    Status: <span style={{ color: cow.inside ? "green" : "red", fontWeight: 600 }}>
                      {cow.inside ? "Inside" : "OUTSIDE"}
                    </span><br />
                    Battery: {cow.battery}%<br />
                    {cow.lat.toFixed(5)}, {cow.lng.toFixed(5)}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ── Bottom cow strip ── */}
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 flex gap-3 overflow-x-auto">
          {enrichedCows.map((cow) => (
            <button
              key={cow.id}
              onClick={() => setSelectedCow(selectedCow?.id === cow.id ? null : cow)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all
                ${selectedCow?.id === cow.id
                  ? "border-emerald-500 bg-emerald-950"
                  : cow.inside
                    ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                    : "border-red-500 bg-red-950 animate-pulse"}`}
            >
              <span className={`w-2 h-2 rounded-full ${cow.inside ? "bg-emerald-400" : "bg-red-400"}`} />
              <div>
                <p className="text-xs font-semibold text-white">{cow.name}</p>
                <p className={`text-xs ${cow.inside ? "text-emerald-400" : "text-red-400"}`}>
                  {cow.inside ? "Safe" : "Outside!"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Boundary;