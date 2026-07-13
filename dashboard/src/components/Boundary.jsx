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
import { renderToStaticMarkup } from "react-dom/server";
import { PiCowThin } from "react-icons/pi";

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

function cowIcon(inside, isSelected, isMobile) {
  const size = isSelected ? 30 : 25;

  const ring = isSelected
    ? `box-shadow:0 0 0 4px ${
        inside ? "#4ade80" : "#f87171"
      },0 4px 12px rgba(0,0,0,0.35);`
    : "box-shadow:0 3px 8px rgba(0,0,0,0.25);";

  // On mobile, show a plain rounded dot instead of the cow icon
  const innerContent = isMobile
    ? ""
    : renderToStaticMarkup(
        <PiCowThin size={isSelected ? 18 : 14} color="white" strokeWidth={1.5} />
      );

  const dotSize = isMobile ? (isSelected ? 12 : 10) : size;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${dotSize}px;
        height:${dotSize}px;
        border-radius:50%;
        background:${inside ? "#16a34a" : "#dc2626"};
        border:2px solid white;
        display:flex;
        align-items:center;
        justify-content:center;
        ${ring}
        transition:all .2s;
      ">
        ${innerContent}
      </div>
    `,
    iconSize: [dotSize, dotSize],
    iconAnchor: [dotSize / 2, dotSize / 2],
  });
}

// ── Map controller ────────────────────────────────────────────────────────────
function MapViewController({ mode, bounds }) {
  const map = useMap();

  useEffect(() => {
    const applyMode = () => {
      // Force Leaflet to re-measure the container before fitting bounds.
      // Without this, mobile layouts (where height depends on responsive
      // Tailwind classes) can be measured before CSS has finished settling.
      map.invalidateSize();

      if (mode === "bounded") {
        map.fitBounds(bounds, {
          padding: [30, 30],
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
    };

    // Small delay lets the flex/tailwind layout settle before Leaflet
    // measures the container (fixes mobile fitBounds being wrong on mount)
    const timer = setTimeout(applyMode, 150);

    // Re-fit whenever the viewport changes size (mobile rotation, resizing)
    window.addEventListener("resize", applyMode);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", applyMode);
    };
  }, [map, bounds, mode]);

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
const Boundary = () => {
  const { boundary, enrichedCows } = useContext(AppContext);

  const [mode, setMode] = useState("bounded");
  const [selectedCow, setSelectedCow] = useState(null);

  // Track mobile vs desktop so we can simplify markers on small screens
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handleChange = (e) => setIsMobile(e.matches);

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

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
    <div className="flex h-full bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* ── Map area ── */}
      <div className="flex-1 flex flex-col h-full">
        <div className="relative flex-1">
          {/* View toggle */}
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] flex bg-white/90 backdrop-blur border border-gray-200 rounded-full p-1 shadow-md w-[90%] max-w-fit justify-center">
            <button
              onClick={() => setMode("bounded")}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition flex-1 whitespace-nowrap ${
                mode === "bounded"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="hidden sm:inline">Bounded View</span>
              <span className="sm:hidden">Bounded</span>
            </button>

            <button
              onClick={() => setMode("full")}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition flex-1 whitespace-nowrap ${
                mode === "full"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="hidden sm:inline">Full View</span>
              <span className="sm:hidden">Full</span>
            </button>
          </div>

          {/* Alert banner */}
          {outsideCount > 0 && (
            <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white text-[10px] md:text-xs font-semibold px-2 md:px-5 py-2 rounded-full shadow-lg animate-bounce pointer-events-none">
              {outsideCount} cow{outsideCount > 1 ? "s" : ""} outside the boundary!
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

            {/* Boundary corner markers — hidden on mobile */}
            {!isMobile &&
              boundary.map((point, index) => (
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
                icon={cowIcon(cow.inside, selectedCow?.id === cow.id, isMobile)}
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
      </div>
    </div>
  );
};

export default Boundary;