import React, { useState, useContext } from "react";
import FarmMap from "../components/FarmMap";
import { AppContext } from "../context/AppContext.jsx";
 
// Map each alert cow name to approximate coords (linked to enrichedCows at runtime)
const Alerts = () => {
  const { enrichedCows } = useContext(AppContext);
  const [filter, setFilter]           = useState("all");
  const [mapAlert, setMapAlert]       = useState(null); // alert whose map is open
 
  const alerts = [
    { id: 1, time: "10:45 AM", cow: "Mala",    cowId: "COW_01", type: "Boundary Alert",  message: "Cow has left the farm boundary",                severity: "critical" },
    { id: 2, time: "10:40 AM", cow: "Nila",    cowId: "COW_02", type: "Low Battery",     message: "Battery dropped to 15%",                        severity: "warning"  },
    { id: 3, time: "10:35 AM", cow: "Ganga",   cowId: "COW_03", type: "LoRa Offline",    message: "Device disconnected from network",               severity: "critical" },
    { id: 4, time: "10:20 AM", cow: "Kamala",  cowId: "COW_04", type: "GPS Lost",        message: "GPS signal not detected",                        severity: "warning"  },
    { id: 5, time: "09:55 AM", cow: "Sundari", cowId: "COW_05", type: "No Movement",     message: "No movement detected for 4 hours",               severity: "warning"  },
    { id: 6, time: "09:30 AM", cow: "Mala",    cowId: "COW_01", type: "Fast Movement",   message: "Unusual high speed detected (possible theft)",   severity: "critical" },
  ];
 
  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
 
  // Build alertData for FarmMap from the matched enrichedCow
  const buildAlertData = (alert) => {
    const match = enrichedCows.find((c) => c.cowId === alert.cowId);
    if (!match) return null;
    return {
      lat:     match.lat,
      lng:     match.lng,
      cowName: alert.cow,
      type:    alert.type,
      message: alert.message,
    };
  };
 
  return (
    <div>
 
      {/* Header */}
      <h1 className="text-2xl font-bold text-red-600 mb-4">Alerts Dashboard</h1>
 
      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "critical", "warning"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full text-sm border transition ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
 
      {/* Alert table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto pb-2">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Cow</th>
              <th className="p-3">Alert Type</th>
              <th className="p-3">Message</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((a) => (
              <tr key={a.id} className="border-b border-gray-200 hover:bg-gray-50">
 
                <td className="p-3 text-xs text-gray-500">{a.time}</td>
 
                <td className="p-3 font-medium">{a.cow}</td>
 
                <td className="p-3">{a.type}</td>
 
                <td className="p-3">{a.message}</td>
 
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      a.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.severity}
                  </span>
                </td>
 
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMapAlert(a)}
                      className="text-blue-600 hover:underline"
                    >
                      View Map
                    </button>
                    <button className="text-green-600 hover:underline">
                      Resolve
                    </button>
                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </td>
 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* Alert Map Modal */}
      {mapAlert && (() => {
        const alertData = buildAlertData(mapAlert);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
 
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMapAlert(null)}
            />
 
            {/* Modal */}
            <div
              className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
              style={{ width: 820, height: 580 }}
            >
 
              {/* Header */}
              <div className="px-5 py-3 border-b flex justify-between items-center bg-white">
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        mapAlert.severity === "critical"
                          ? "bg-red-500"
                          : "bg-yellow-400"
                      }`}
                    />
                    {mapAlert.type} — {mapAlert.cow}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">{mapAlert.message}</p>
                </div>
                <button
                  onClick={() => setMapAlert(null)}
                  className="text-xl text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>
 
              {/* Map */}
              <div className="flex-1">
                {alertData ? (
                  <FarmMap
                    mode="alert"
                    alertData={alertData}
                    interactive
                    showCorners={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Location data not available for this alert.
                  </div>
                )}
              </div>
 
              {/* Footer */}
              <div className="px-4 py-2 border-t text-sm flex justify-between items-center bg-white">
                <span className="text-gray-500">{mapAlert.time}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    mapAlert.severity === "critical"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {mapAlert.severity}
                </span>
              </div>
 
            </div>
          </div>
        );
      })()}
 
    </div>
  );
};
 
export default Alerts;