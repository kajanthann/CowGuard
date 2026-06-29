import { useEffect, useContext } from "react";
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
 
// ── Fix default icons ──────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
 
// ── Icon helpers ───────────────────────────────────────────────────────────────
function cowIcon(inside, isSelected) {
  const size = isSelected ? 40 : 28;
  const font = isSelected ? 20 : 14;
  const bg   = inside ? "#16a34a" : "#dc2626";
  const ring = isSelected
    ? `box-shadow:0 0 0 3px ${inside ? "#4ade80" : "#f87171"},0 4px 12px rgba(0,0,0,.3);`
    : "box-shadow:0 2px 8px rgba(0,0,0,.2);";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:${font}px;${ring}transition:all .2s;"
    >🐄</div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
 
function alertIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:#ef4444;border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.25);"
    >⚠️</div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 16],
  });
}
 
function cornerIcon(index) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#16a34a;border:2px solid white;color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:9px;font-weight:bold;
      box-shadow:0 2px 6px rgba(0,0,0,.35);"
    >${index + 1}</div>`,
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  });
}
 
// ── Map controller ─────────────────────────────────────────────────────────────
function MapViewController({ bounds, interactive }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [25, 25] });
 
    if (!interactive) {
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
  }, [map, bounds, interactive]);
  return null;
}
 
// ── FarmMap ────────────────────────────────────────────────────────────────────
/**
 * Props:
 *  mode          "all" | "single" | "alert"
 *                  all    → show all cows (LiveMap / Boundary)
 *                  single → show one cow (CowMapModal)
 *                  alert  → show alert pin + nearest cow (Alerts)
 *  cow           required when mode="single"
 *  alertData     { lat, lng, cowName, type, message } — required when mode="alert"
 *  selectedCowId cow id to highlight (mode="all")
 *  onCowClick    (cow) => void — called when a cow marker is clicked (mode="all")
 *  interactive   bool — enable pan/zoom (default false for single, true for all)
 *  showCorners   bool — show numbered boundary corners (default false)
 *  className     extra classes on the wrapper div
 *  style         extra inline styles on the wrapper div
 */
const FarmMap = ({
  mode = "all",
  cow = null,
  alertData = null,
  selectedCowId = null,
  onCowClick,
  interactive = true,
  showCorners = false,
  className = "",
  style = {},
}) => {
  const { boundary, enrichedCows } = useContext(AppContext);
 
  const polygonPositions = boundary.map((p) => [p.lat, p.lng]);
  const bounds = L.latLngBounds(polygonPositions);
  const center = bounds.getCenter();
 
  // derive initial center / zoom
  const initCenter =
    mode === "single" && cow
      ? [cow.lat, cow.lng]
      : mode === "alert" && alertData
      ? [alertData.lat, alertData.lng]
      : center;
 
  return (
    <div className={`w-full h-full ${className}`} style={style}>
      <MapContainer
        center={initCenter}
        zoom={17}
        className="w-full h-full"
        zoomControl={interactive}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
 
        <MapViewController bounds={bounds} interactive={interactive} />
 
        {/* Farm boundary */}
        <Polygon
          positions={polygonPositions}
          pathOptions={{
            color: "#16a34a",
            fillColor: "#22c55e",
            fillOpacity: 0.15,
            weight: 3,
          }}
        />
 
        {/* Numbered corner markers */}
        {showCorners &&
          boundary.map((pt, i) => (
            <Marker key={`corner-${i}`} position={[pt.lat, pt.lng]} icon={cornerIcon(i)}>
              <Popup>
                <strong>Point {i + 1}</strong>
                <br />
                {pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}
              </Popup>
            </Marker>
          ))}
 
        {/* ── mode: all — render every cow ── */}
        {mode === "all" &&
          enrichedCows.map((c) => (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={cowIcon(c.inside, selectedCowId === c.id)}
              eventHandlers={{ click: () => onCowClick?.(c) }}
            >
              <Popup>
                <div style={{ minWidth: 140 }}>
                  <strong>
                    {c.name} ({c.cowId})
                  </strong>
                  <br />
                  Status:{" "}
                  <span style={{ color: c.inside ? "green" : "red", fontWeight: 600 }}>
                    {c.inside ? "Inside" : "OUTSIDE"}
                  </span>
                  <br />
                  Battery: {c.battery}%
                  <br />
                  {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                </div>
              </Popup>
            </Marker>
          ))}
 
        {/* ── mode: single — one highlighted cow ── */}
        {mode === "single" && cow && (
          <Marker position={[cow.lat, cow.lng]} icon={cowIcon(cow.inside, true)}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{cow.name}</strong>
                <br />
                Status:{" "}
                <span style={{ color: cow.inside ? "green" : "red" }}>
                  {cow.inside ? "Inside" : "Outside"}
                </span>
                <br />
                Battery: {cow.battery}%
                <br />
                {cow.lat.toFixed(5)}, {cow.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
 
        {/* ── mode: alert — alert pin ── */}
        {mode === "alert" && alertData && (
          <Marker position={[alertData.lat, alertData.lng]} icon={alertIcon()}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong>{alertData.type}</strong>
                <br />
                {alertData.cowName}
                <br />
                <span style={{ color: "#dc2626", fontSize: 12 }}>{alertData.message}</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
 
export default FarmMap;