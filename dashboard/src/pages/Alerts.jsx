import React, { useState, useContext } from "react";
import FarmMap from "../components/FarmMap";
import { AppContext } from "../context/AppContext.jsx";
import {
  FaTriangleExclamation,
  FaMapLocationDot,
  FaCircleCheck,
} from "react-icons/fa6";

const Alerts = () => {
  const { enrichedCows } = useContext(AppContext);

  const [filter, setFilter] = useState("all");
  const [mapAlert, setMapAlert] = useState(null);

  const generateAlerts = () => {
    return enrichedCows
      .map((cow) => {
        let messages = [];
        let severity = "warning";

        if (!cow.inside) {
          messages.push("Cow has left the farm boundary");
          severity = "critical";
        }

        if (cow.battery < 20) {
          messages.push(`Battery dropped to ${cow.battery}%`);
        }

        if (cow.status === "Offline") {
          messages.push("Device disconnected from network");
          severity = "critical";
        }

        if (!cow.lat || !cow.lng) {
          messages.push("GPS signal not detected");
        }

        if (
          cow.speed === 0 &&
          cow.lastMovement &&
          Date.now() - cow.lastMovement > 4 * 60 * 60 * 1000
        ) {
          messages.push("No movement detected for 4 hours");
        }

        if (cow.speed > 60) {
          messages.push("Unusual high speed detected");
          severity = "critical";
        }

        if (messages.length === 0) return null;

        return {
          id: cow.cowId,
          cowId: cow.cowId,
          cow,
          messages,
          severity,
        };
      })
      .filter(Boolean);
  };

  const alerts = generateAlerts();

  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const getAlertData = (alert) => {
    const cow = alert.cow;

    if (!cow.lat || !cow.lng) return null;

    return {
      lat: cow.lat,
      lng: cow.lng,
      cowName: cow.name,
      type: "Cow Alert",
      message: alert.messages.join(", "),
    };
  };

  return (
    <div className="w-full">
      <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">
        Alerts
      </h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["all", "critical", "warning"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm border border-gray-400 transition ${
              filter === item ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredAlerts.length === 0 && (
          <div className="text-center text-gray-400 py-10">No Active Alerts</div>
        )}

        {filteredAlerts.map((alert) => (
          <div
            key={alert.cowId}
            className="bg-white rounded-xl shadow border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{alert.cowId}</p>
                <p className="text-xs text-gray-400">{alert.cow.name}</p>
              </div>

              <span
                className={`px-2 py-2 rounded-full text-xs font-semibold ${
                  alert.severity === "critical"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <ul className="text-sm text-gray-600 list-disc ml-5 mt-3">
              {alert.messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-4">
              <span
                className={
                  alert.cow.status === "Online"
                    ? "text-green-600 text-sm"
                    : "text-red-600 text-sm"
                }
              >
                {alert.cow.status}
              </span>

              <button
                onClick={() => setMapAlert(alert)}
                className="flex items-center gap-1 text-blue-600 text-sm"
              >
                <FaMapLocationDot />
                View Map
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Cow ID</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlerts.map((alert) => (
              <tr key={alert.cowId} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="p-3 text-xs">
                  {alert.cow.lastSeenDate}
                  <br />
                  {alert.cow.lastSeenTime}
                </td>

                <td className="p-3 font-semibold">
                  {alert.cowId}
                  <p className="text-xs text-gray-400">{alert.cow.name}</p>
                </td>

                <td className="p-3">
                  <ul className="list-disc ml-5 text-gray-500">
                    {alert.messages.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      alert.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="p-3">{alert.cow.status}</td>

                <td className="p-3">
                  <button onClick={() => setMapAlert(alert)} className="text-blue-600">
                    View Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Map Modal */}
      {mapAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMapAlert(null)} />

          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-[820px] h-[80vh] flex flex-col">
            <div className="p-3 border-b flex justify-between">
              <div>
                <h2 className="font-semibold">{mapAlert.cowId}</h2>
                <p className="text-xs text-gray-500">{mapAlert.messages.join(",")}</p>
              </div>

              <button onClick={() => setMapAlert(null)}>✕</button>
            </div>

            <div className="flex-1">
              {getAlertData(mapAlert) ? (
                <FarmMap mode="alert" alertData={getAlertData(mapAlert)} interactive={true} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  GPS Not Available
                </div>
              )}
            </div>

            <div className="border-t p-3 flex justify-between text-xs">
              <span>
                {mapAlert.cow.lastSeenDate} {mapAlert.cow.lastSeenTime}
              </span>

              <span
                className={`px-2 py-1 rounded-full ${
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
      )}
    </div>
  );
};

export default Alerts;