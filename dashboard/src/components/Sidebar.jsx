import React, { useContext } from "react";
import { AppContext } from "../context/AppContext"; // adjust path to match your project
 import { SiSwisscows } from "react-icons/si";
 import { GiCow } from "react-icons/gi";
 import { AiFillAlert } from "react-icons/ai";
 import { BsBatteryLow } from "react-icons/bs";

const LOW_BATTERY_THRESHOLD = 20;
 
// Shoelace formula → area in m² for lat/lng polygon (approx, good enough for small areas)
function polygonAreaM2(boundary) {
  if (!boundary || boundary.length < 3) return 0;
 
  const R = 6378137; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
 
  let area = 0;
  const n = boundary.length;
  for (let i = 0; i < n; i++) {
    const p1 = boundary[i];
    const p2 = boundary[(i + 1) % n];
    area +=
      toRad(p2.lng - p1.lng) *
      (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  area = Math.abs((area * R * R) / 2);
  return area;
}
 
const Sidebar = () => {
  const { boundary, enrichedCows } = useContext(AppContext);
 
  const totalCows = enrichedCows.length;
  const insideCows = enrichedCows.filter((c) => c.inside);
  const outsideCows = enrichedCows.filter((c) => !c.inside);
  const lowBatteryCows = enrichedCows.filter(
    (c) => c.battery <= LOW_BATTERY_THRESHOLD
  );
 
  const boundaryLength = boundary?.length ?? 0;
  const areaM2 = polygonAreaM2(boundary);
  const areaAcres = (areaM2 / 4046.8564224).toFixed(2);
 
  return (
    <div className="w-80 h-full border-r border-gray-200 flex flex-col overflow-y-auto">
 
      {/* ─── Header ───────────────────────────── */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center">
        <div className="flex items-center gap-1">
          <SiSwisscows className="text-3xl text-green-600" />
          <span className="border-r border-2 border-gray-400 h-8"></span>
          <h1 className="text-3xl font-electrolize font-bold tracking-wide text-green-600">
            Cow
          </h1>
          <span className="text-3xl font-electrolize font-bold tracking-wide text-gray-500">
            Guard
          </span>
        </div>
      </header>
 
      {/* ─── Boundary Stats ───────────────────── */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase mb-2">
          Boundary
        </p>
 
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="font-bold text-gray-800">
              {boundaryLength}
            </p>
            <p className="text-xs text-gray-500">Points</p>
          </div>
 
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="font-bold text-green-700">
              {insideCows.length}
            </p>
            <p className="text-xs text-green-600">Inside</p>
          </div>
 
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="font-bold text-red-700">
              {outsideCows.length}
            </p>
            <p className="text-xs text-red-600">Outside</p>
          </div>
        </div>
      </div>
 
      {/* ─── Area ─────────────────────────────── */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Estimated boundary area
        </p>
        <p className="text-sm font-semibold text-gray-800 mt-1">
          {areaAcres} acres{" "}
          <span className="text-xs text-gray-500">
            ({Math.round(areaM2).toLocaleString()} m²)
          </span>
        </p>
      </div>

      {/* ─── Cow List ─────────────────────────── */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-700 uppercase mb-2">
          All Cows
        </p>
 
        <div className="space-y-1.5">
          {enrichedCows.map((cow) => (
            <div
              key={cow.cowId}
              className="flex items-center gap-2 bg-gray-50/75 border border-gray-200 rounded-lg px-3 py-2"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  cow.inside ? "bg-green-500" : "bg-red-500"
                }`}
              />
 
              <div className="flex justify-between items-center flex-1">
                <div>
                   <p className="text-xs font-semibold text-gray-800">
                  {cow.name || cow.cowId}
                </p>
                <p className="text-xs font-mono text-gray-400">
                  {cow.cowId}
                </p>
                </div>
               
                <p
                  className={`text-xs ${
                    cow.inside
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {cow.inside ? "Inside" : "Outside"}
                </p>
              </div>
 
              <span
                className={`text-xs font-mono ${
                  cow.battery <= LOW_BATTERY_THRESHOLD
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {cow.battery}%
              </span>
            </div>
          ))}
        </div>
      </div>
 
      {/* ─── Livestock Summary ───────────────── */}
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 uppercase mb-2">
          Livestock
        </p>
 
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GiCow className="text-3xl text-gray-700" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {totalCows} Cows Tracked
              </p>
              <p className="text-xs text-gray-500">
                Live geofence monitoring
              </p>
            </div>
          </div>
 
          <p className="text-xl font-bold text-green-700">
            {totalCows}
          </p>
        </div>
      </div>
 
      {/* ─── Outside Alert ────────────────────── */}
      <div className="px-4">
        <div
          className={`rounded-lg p-2 flex items-center gap-3 ${
            outsideCows.length > 0
              ? "bg-red-50 border border-red-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <span className="text-xl">
            {outsideCows.length > 0 ? <AiFillAlert className="text-red-600" /> : <GiCow />}
          </span>
 
          <div>
            <p
              className={`text-sm font-semibold ${
                outsideCows.length > 0
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {outsideCows.length > 0
                ? `${outsideCows.length} Cow(s) Outside Fence`
                : "All Cows Inside"}
            </p>
 
            {outsideCows.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                {outsideCows.map((c) => c.name || c.cowId).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>


 
      {/* ─── Battery Alert ────────────────────── */}
      <div className="p-4 ">
        <div
          className={`rounded-lg p-2 flex items-center gap-3 ${
            lowBatteryCows.length > 0
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <span className="text-xl">
            {lowBatteryCows.length > 0 ? <BsBatteryLow className="text-yellow-600" /> : <GiCow className="text-green-600" />}
          </span>
 
          <div>
            <p
              className={`text-sm font-semibold ${
                lowBatteryCows.length > 0
                  ? "text-yellow-700"
                  : "text-green-700"
              }`}
            >
              {lowBatteryCows.length > 0
                ? `${lowBatteryCows.length} Low Battery Alert`
                : "All Batteries OK"}
            </p>
 
            {lowBatteryCows.length > 0 && (
              <div className="mt-1">
                {lowBatteryCows.map((c) => (
                  <p
                    key={c.cowId}
                    className="text-xs text-yellow-600"
                  >
                    {c.name || c.cowId} — {c.battery}%
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Sidebar;
 