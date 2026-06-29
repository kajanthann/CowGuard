import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const LOW_BATTERY_THRESHOLD = 20;

function polygonAreaM2(boundary) {
  if (!boundary || boundary.length < 3) return 0;
  const R = 6378137;
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
  return Math.abs((area * R * R) / 2);
}

const MobileSummaryBar = () => {
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
    <div className="md:hidden border-b border-gray-200 bg-white px-3 py-3 space-y-3">
      {/* Boundary points / inside / outside */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-gray-800">{boundaryLength}</p>
          <p className="text-[10px] text-gray-500">Points</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-green-700">{insideCows.length}</p>
          <p className="text-[10px] text-green-600">Inside</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-red-700">{outsideCows.length}</p>
          <p className="text-[10px] text-red-600">Outside</p>
        </div>
      </div>

      {/* Area */}
      <div className="bg-gray-50 rounded-lg px-3 py-2">
        <p className="text-[10px] text-gray-500">Estimated boundary area</p>
        <p className="text-xs font-semibold text-gray-800 mt-0.5">
          {areaAcres} acres{" "}
          <span className="text-[10px] text-gray-500">
            ({Math.round(areaM2).toLocaleString()} m²)
          </span>
        </p>
      </div>

      {/* Cows tracked */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐄</span>
          <p className="text-xs font-semibold text-gray-800">{totalCows} Cows Tracked</p>
        </div>
        <p className="text-base font-bold text-green-700">{totalCows}</p>
      </div>

      {/* Outside alert */}
      <div className={`rounded-lg p-2 flex items-center gap-2 ${
        outsideCows.length > 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
      }`}>
        <span className="text-base">{outsideCows.length > 0 ? "🚨" : "✅"}</span>
        <p className={`text-xs font-semibold ${outsideCows.length > 0 ? "text-red-700" : "text-green-700"}`}>
          {outsideCows.length > 0
            ? `${outsideCows.length} Cow(s) Outside — ${outsideCows.map((c) => c.name || c.cowId).join(", ")}`
            : "All Cows Inside"}
        </p>
      </div>

      {/* Battery alert (only render if relevant, to save space) */}
      {lowBatteryCows.length > 0 && (
        <div className="rounded-lg p-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200">
          <span className="text-base">🔋</span>
          <p className="text-xs font-semibold text-yellow-700">
            {lowBatteryCows.length} Low Battery — {lowBatteryCows.map((c) => `${c.name || c.cowId} (${c.battery}%)`).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileSummaryBar;