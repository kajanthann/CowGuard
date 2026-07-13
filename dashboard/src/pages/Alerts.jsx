import React, { useState, useContext } from "react";
import FarmMap from "../components/FarmMap";
import { AppContext } from "../context/AppContext.jsx";

const Alerts = () => {
  const { enrichedCows } = useContext(AppContext);

  const [filter, setFilter] = useState("all");
  const [mapAlert, setMapAlert] = useState(null);

  const generateAlerts = () => {
    return enrichedCows
      .map((cow) => {
        let messages = [];
        let severity = "warning";

        // Boundary Logic
        if (!cow.inside) {
          messages.push("Cow has left the farm boundary");

          severity = "critical";
        }

        // Battery Logic

        if (cow.battery < 20) {
          messages.push(`Battery dropped to ${cow.battery}%`);
        }

        // LoRa Offline Logic

        if (cow.status === "Offline") {
          messages.push("Device disconnected from network");

          severity = "critical";
        }

        // GPS Logic

        if (!cow.lat || !cow.lng) {
          messages.push("GPS signal not detected");
        }

        // No Movement Logic

        if (
          cow.speed === 0 &&
          cow.lastMovement &&
          Date.now() - cow.lastMovement > 4 * 60 * 60 * 1000
        ) {
          messages.push("No movement detected for 4 hours");
        }

        // High Speed Logic

        if (cow.speed > 60) {
          messages.push("Unusual high speed detected (possible theft)");

          severity = "critical";
        }

        if (messages.length === 0) {
          return null;
        }

        return {
          id: cow.cowId,

          cowId: cow.cowId,

          cow: cow,

          messages: messages,

          severity: severity,
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
      <h1 className="text-2xl font-bold text-red-600 mb-5">Alerts</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        {["all", "critical", "warning"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-3 py-0.5 rounded-full text-sm border border-gray-300 ${
              filter === item
                ? "bg-gray-900 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Time</th>

              <th className="p-3 text-left">Cow ID</th>

              <th className="p-3 text-left">Alert Message</th>

              <th className="p-3 text-left">Severity</th>

              <th className="p-3 text-left">Status</th>

              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="6" className="p-5 text-center text-gray-400">
                  No Active Alerts
                </td>
              </tr>
            )}

            {filteredAlerts.map((alert) => (
              <tr key={alert.cowId} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="p-3 text-xs text-gray-500">
                  <div>{alert.cow.lastSeenDate || "-"}</div>

                  <div>{alert.cow.lastSeenTime || "-"}</div>
                </td>

                <td className="p-3 font-semibold">
                  {alert.cowId}

                  <br />

                  <span className="text-xs text-gray-400">
                    {alert.cow.name}
                  </span>
                </td>

                <td className="p-3 text-gray-600">
                  <ul className="list-disc ml-5">
                    {alert.messages.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={
                      alert.cow.status === "Online"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {alert.cow.status}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => setMapAlert(alert)}
                    className="text-blue-600 hover:underline"
                  >
                    View Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mapAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMapAlert(null)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden w-[95%] md:w-[820px] h-[85vh] flex flex-col">
            <div className="p-4 border-b flex justify-between">
              <div>
                <h2 className="font-semibold">{mapAlert.cowId}</h2>

                <p className="text-xs text-gray-500">
                  {mapAlert.messages.join(", ")}
                </p>
              </div>

              <button onClick={() => setMapAlert(null)}>✕</button>
            </div>

            <div className="flex-1">
              {getAlertData(mapAlert) ? (
                <FarmMap
                  mode="alert"
                  alertData={getAlertData(mapAlert)}
                  interactive={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  GPS Not Available
                </div>
              )}
            </div>

            <div className="border-t p-3 text-sm flex justify-between">
              <span>
                Last Seen:
                {mapAlert.cow.lastSeenDate} {mapAlert.cow.lastSeenTime}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
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
