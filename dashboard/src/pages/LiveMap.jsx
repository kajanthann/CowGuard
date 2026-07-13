import React, { useContext } from "react";
import Boundary from "../components/Boundary";
import { AppContext } from "../context/AppContext";
import {
  FaCow,
  FaTriangleExclamation,
  FaBatteryQuarter,
} from "react-icons/fa6";

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

const LiveMap = () => {
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
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-[18px] md:text-2xl font-bold text-green-600">
          Live Map
        </h1>
      </div>

      {/* Map */}
      <div className="h-[38vh] md:flex-1 md:h-auto rounded-xl overflow-hidden border border-gray-300">
        <Boundary />
      </div>
      {/* Mobile Summary */}
      <div className="md:hidden mt-3 space-y-3 overflow-y-auto pb-20">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-center">
            <p className="font-bold">{boundaryLength}</p>
            <p className="text-[10px] text-gray-500">Points</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="font-bold text-green-700">
              {insideCows.length}
            </p>
            <p className="text-[10px] text-green-600">
              Inside
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="font-bold text-red-700">
              {outsideCows.length}
            </p>
            <p className="text-[10px] text-red-600">
              Outside
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            Estimated Boundary Area
          </p>

          <p className="font-semibold mt-1">
            {areaAcres} acres
          </p>

          <p className="text-xs text-gray-500">
            ({Math.round(areaM2).toLocaleString()} m²)
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCow className="text-green-600" />

            <div>
              <p className="font-semibold text-sm">
                {totalCows} Cows Tracked
              </p>

              <p className="text-xs text-gray-500">
                Live Monitoring
              </p>
            </div>
          </div>

          <span className="text-xl font-bold text-green-700">
            {totalCows}
          </span>
        </div>

        <div
          className={`rounded-lg border p-3 flex items-center gap-3 ${
            outsideCows.length
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <FaTriangleExclamation
            className={
              outsideCows.length
                ? "text-red-600"
                : "text-green-600"
            }
          />

          <div>
            <p
              className={`font-semibold text-sm ${
                outsideCows.length
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {outsideCows.length
                ? `${outsideCows.length} Cow(s) Outside`
                : "All Cows Inside"}
            </p>

            {outsideCows.length > 0 && (
              <p className="text-xs text-red-600">
                {outsideCows
                  .map((c) => c.name || c.cowId)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        {lowBatteryCows.length > 0 && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 flex items-center gap-3">
            <FaBatteryQuarter className="text-yellow-600" />

            <div>
              <p className="font-semibold text-yellow-700 text-sm">
                {lowBatteryCows.length} Low Battery
              </p>

              <p className="text-xs text-yellow-700">
                {lowBatteryCows
                  .map(
                    (c) =>
                      `${c.name || c.cowId} (${c.battery}%)`
                  )
                  .join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;