import { useState, useEffect, useContext } from "react";
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
import { AppContext } from "../context/AppContext.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Icons ─────────────────────────────────────────────────────────────────────
function cornerIcon(index) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:15px;height:15px;border-radius:50%;
      background:#16a34a;border:1px solid white;color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:9px;
      box-shadow:0 2px 6px rgba(0,0,0,.35);">${index + 1}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function cowIcon(inside, isSelected) {
  const size = isSelected ? 38 : 26;
  const font = isSelected ? 20 : 14;
  const ring = isSelected
    ? `box-shadow:0 0 0 3px ${inside ? "#4ade80" : "#f87171"},0 4px 12px rgba(0,0,0,0.3);`
    : "box-shadow:0 2px 8px rgba(0,0,0,0.25);";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${inside ? "#16a34a" : "#dc2626"};
      border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:${font}px;${ring}
      transition:all 0.2s;">🐄</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ── Map controller ────────────────────────────────────────────────────────────
function MapViewController({ mode, bounds }) {
  const map = useMap();

  useEffect(() => {
    if (mode === "bounded") {
      map.fitBounds(bounds, {
        padding: [40, 40],
      });

      map.setMaxBounds(bounds.pad(0.15));

      // Disable zoom
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();

      // Disable zoom control buttons
      if (map.zoomControl) {
        map.zoomControl.remove();
      }

      // Allow dragging
      map.dragging.enable();
    } else {
      // Full view

      map.setMaxBounds(null);

      // Enable zoom
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();

      // Add zoom buttons back
      if (!map.zoomControl) {
        L.control
          .zoom({
            position: "topright",
          })
          .addTo(map);
      }

      map.dragging.enable();
    }
  }, [map, bounds, mode]);

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
const Boundary = () => {
  const { boundary, enrichedCows } = useContext(AppContext);

  const [mode, setMode] = useState("bounded");
  const [selectedCow, setSelectedCow] = useState(null);

  const polygonPositions = boundary.map((p) => [p.lat, p.lng]);
  const allMapPoints = [
    ...polygonPositions,
    ...enrichedCows.map((cow) => [cow.lat, cow.lng]),
  ];
  const bounds = L.latLngBounds(allMapPoints);
  const center = bounds.getCenter();

  const insideCount = enrichedCows.filter((c) => c.inside).length;
  const outsideCount = enrichedCows.filter((c) => !c.inside).length;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* ── Map area ── */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1">
          {/* View toggle */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex bg-white/90 backdrop-blur border border-gray-200 rounded-full p-1 shadow-md">
            <button
              onClick={() => setMode("bounded")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                mode === "bounded"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Bounded View
            </button>
            <button
              onClick={() => setMode("full")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                mode === "full"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Full View
            </button>
          </div>

          {/* Alert banner */}
          {outsideCount > 0 && (
            <div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000]
              bg-red-500 text-white text-xs font-semibold px-5 py-2 rounded-full shadow-lg animate-bounce pointer-events-none"
            >
              {outsideCount} cow{outsideCount > 1 ? "s" : ""} outside the
              boundary!
            </div>
          )}

          <MapContainer
            center={center}
            zoom={17}
            zoomControl={false}
            className="w-full h-full"
          >
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
                weight: 2,
              }}
            />

            {/* Boundary corner markers */}
            {boundary.map((point, index) => (
              <Marker
                key={`corner-${index}`}
                position={[point.lat, point.lng]}
                icon={cornerIcon(index)}
              >
                <Popup>
                  <strong>Point {index + 1}</strong>
                  <br />
                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                </Popup>
              </Marker>
            ))}

            {/* Cow markers */}
            {enrichedCows.map((cow) => (
              <Marker
                key={cow.id}
                position={[cow.lat, cow.lng]}
                icon={cowIcon(cow.inside, selectedCow?.id === cow.id)}
                eventHandlers={{ click: () => setSelectedCow(cow) }}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <strong>
                      {cow.name} ({cow.id})
                    </strong>
                    <br />
                    Status:
                    <span
                      style={{
                        color: cow.inside ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      {cow.inside ? "Inside Boundary" : "OUTSIDE Boundary"}
                    </span>
                    <br />
                    Device:
                    <span
                      style={{
                        color: cow.status === "Online" ? "green" : "red",
                      }}
                    >
                      {cow.status}
                    </span>
                    <br />
                    Last Seen:
                    {cow.lastSeenDate} {cow.lastSeenTime}
                    <br />
                    Battery: {cow.battery}%<br />
                    {cow.lat.toFixed(5)}, {cow.lng.toFixed(5)}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ── Bottom cow strip ── */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 overflow-x-auto shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          {enrichedCows.map((cow) => (
            <button
              key={cow.id}
              onClick={() =>
                setSelectedCow(selectedCow?.id === cow.id ? null : cow)
              }
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all
                ${
                  selectedCow?.id === cow.id
                    ? "border-emerald-400 bg-emerald-50 shadow-sm"
                    : cow.inside
                      ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      : "border-red-300 bg-red-50 animate-pulse"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${cow.inside ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  {cow.name}
                </p>
                <p
                  className={`text-xs ${cow.inside ? "text-emerald-500" : "text-red-500"}`}
                >
                  {cow.inside ? "Safe" : "Outside!"}
                </p>
              </div>
              <div className="ml-1 w-10">
                <div className="bg-gray-100 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${cow.battery > 50 ? "bg-emerald-400" : cow.battery > 20 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${cow.battery}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-right mt-0.5">
                  {cow.battery}%
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
