import React from "react";

const LOW_BATTERY_THRESHOLD = 20;

// ─── Dummy boundary stats ─────────────────────────────
const DUMMY_BOUNDARY_LENGTH = 17;
const DUMMY_INSIDE_COUNT = 2;
const DUMMY_OUTSIDE_COUNT = 1;
const DUMMY_AREA_ACRES = "4.32";
const DUMMY_AREA_M2 = 17489;

// ─── Dummy cow data ───────────────────────────────────
const DUMMY_COWS = [
  { id: "COW_01", inside: true, battery: 87 },
  { id: "COW_02", inside: true, battery: 62 },
  { id: "COW_03", inside: false, battery: 15 },
  { id: "COW_04", inside: true, battery: 8 },
];

const Sidebar = () => {
  const cows = DUMMY_COWS;

  const totalCows = cows.length;
  const outsideCows = cows.filter((c) => !c.inside);
  const lowBatteryCows = cows.filter(
    (c) => c.battery <= LOW_BATTERY_THRESHOLD
  );

  return (
    <div className="w-80 h-full border-r border-gray-200 flex flex-col overflow-y-auto">

      {/* ─── Header ───────────────────────────── */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-800">
          CowGuard
        </h1>
      </header>

      {/* ─── Boundary Stats ───────────────────── */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase mb-2">
          Boundary Points
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-800">
              {DUMMY_BOUNDARY_LENGTH}
            </p>
            <p className="text-xs text-gray-500">Points</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-700">
              {DUMMY_INSIDE_COUNT}
            </p>
            <p className="text-xs text-green-600">Inside</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-red-700">
              {DUMMY_OUTSIDE_COUNT}
            </p>
            <p className="text-xs text-red-600">Outside</p>
          </div>
        </div>
      </div>

      {/* ─── Area ─────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Estimated boundary area
        </p>
        <p className="text-sm font-semibold text-gray-800 mt-1">
          {DUMMY_AREA_ACRES} acres{" "}
          <span className="text-xs text-gray-500">
            ({DUMMY_AREA_M2.toLocaleString()} m²)
          </span>
        </p>
      </div>

      {/* ─── Livestock Summary ───────────────── */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase mb-2">
          Livestock
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐄</span>
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
      <div className="p-4 border-b border-gray-200">
        <div
          className={`rounded-lg p-3 flex items-center gap-3 ${
            outsideCows.length > 0
              ? "bg-red-50 border border-red-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <span className="text-xl">
            {outsideCows.length > 0 ? "🚨" : "✅"}
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
                {outsideCows.map((c) => c.id).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Battery Alert ────────────────────── */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={`rounded-lg p-3 flex items-center gap-3 ${
            lowBatteryCows.length > 0
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <span className="text-xl">
            {lowBatteryCows.length > 0 ? "🔋" : "🔌"}
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
                    key={c.id}
                    className="text-xs text-yellow-600"
                  >
                    {c.id} — {c.battery}%
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Cow List ─────────────────────────── */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase mb-2">
          All Cows
        </p>

        <div className="space-y-2">
          {cows.map((cow) => (
            <div
              key={cow.id}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  cow.inside ? "bg-green-500" : "bg-red-500"
                }`}
              />

              <div className="flex-1">
                <p className="text-xs font-mono text-gray-800">
                  {cow.id}
                </p>
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
    </div>
  );
};

export default Sidebar;