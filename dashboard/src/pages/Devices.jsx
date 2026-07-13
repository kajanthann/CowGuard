import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  FaWifi,
  FaLocationDot,
  FaBatteryHalf,
  FaMicrochip,
  FaSignal,
} from "react-icons/fa6";

const Devices = () => {
  const { cows } = useContext(AppContext);

  const getLastSeen = (timestamp) => {
    if (!timestamp) {
      return {
        text: "-",
        online: false,
      };
    }

    const diff = Date.now() - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    let text = "";

    if (seconds < 60) {
      text = `${seconds} sec ago`;
    } else if (minutes < 60) {
      text = `${minutes} min ago`;
    } else {
      text = `${Math.floor(minutes / 60)} hour ago`;
    }

    return {
      text,
      online: diff < 120000,
    };
  };

  const devices = cows.map((device) => {
    const lastSeen = getLastSeen(device.receivedAt);

    return {
      id: device.id,

      deviceId: device.deviceId || device.cowId,

      cow: device.cowId,

      battery: device.battery ?? 0,

      gps:
        device.status === "Online" &&
        device.lat &&
        device.lng &&
        device.satellites > 0,

      lora: device.status === "Online",

      rssi: device.rssi ?? "-",

      snr: device.snr ?? "-",

      date: device.date ?? "-",

      time: device.time ?? "-",

      lastSeen: device.lastSeenText || lastSeen.text,

      isDummy: device.isDummy || false,

      status: device.status,
    };
  });

  return (
    <div className="w-full">
      {/* Header */}

      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-green-600">
          Device Management
        </h1>

        <p className="text-gray-500 text-sm">
          Manage LoRa GPS tracking devices
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card title="Total" value={devices.length} />

        <Card
          title="Online"
          value={devices.filter((d) => d.lora).length}
          color="text-green-600"
        />

        <Card
          title="Offline"
          value={devices.filter((d) => !d.lora).length}
          color="text-red-600"
        />

        <Card
          title="Low Battery"
          value={devices.filter((d) => d.battery < 20).length}
          color="text-yellow-500"
        />
      </div>

      {/* Mobile View */}

      <div className="md:hidden space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-xl shadow border border-gray-200 p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FaMicrochip className="text-green-600" />

                <div>
                  <p className="font-semibold text-sm">
                    {device.deviceId}

                    {device.isDummy && (
                      <span className="ml-2 text-xs text-orange-500">
                        Dummy
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-gray-500">Cow: {device.cow}</p>
                </div>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  device.lora
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {device.lora ? "Online" : "Offline"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FaBatteryHalf className="text-yellow-500" />

                <span>{device.battery}%</span>
              </div>

              <div className="flex items-center gap-2">
                <FaLocationDot
                  className={device.gps ? "text-green-600" : "text-red-600"}
                />

                <span>{device.gps ? "GPS Active" : "GPS Lost"}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaWifi
                  className={device.lora ? "text-green-600" : "text-red-600"}
                />

                <span>LoRa</span>
              </div>

              <div className="flex items-center gap-2">
                <FaSignal className="text-gray-500" />

                <span>{device.rssi} dBm</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              <p>
                Last Seen:
                <span className="font-medium ml-1">
                  {device.date} {device.time}
                </span>
              </p>

              <p>{device.lastSeen}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}

      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Device ID</th>

              <th className="p-3 text-left">Cow</th>

              <th className="p-3 text-center">Battery</th>

              <th className="p-3 text-center">GPS</th>

              <th className="p-3 text-center">LoRa</th>

              <th className="p-3 text-center">Last Seen</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <tr
                key={device.id}
                className="border-b border-gray-300 hover:bg-gray-50"
              >
                <td className="p-3 font-mono">
                  {device.deviceId}

                  {device.isDummy && (
                    <span className="ml-2 text-xs text-orange-500">Dummy</span>
                  )}
                </td>

                <td className="p-3">{device.cow}</td>

                <td className="p-3 text-center">{device.battery}%</td>

                <td className="p-3 text-center">
                  {device.gps ? (
                    <span className="text-green-600 font-semibold">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">✗ Lost</span>
                  )}
                </td>

                <td className="p-3 text-center">
                  {device.lora ? (
                    <div>
                      <p className="text-green-600 font-semibold">✓ Online</p>

                      <p className="text-xs text-gray-500">
                        RSSI {device.rssi} dBm
                      </p>

                      <p className="text-xs text-gray-500">
                        SNR {device.snr} dB
                      </p>
                    </div>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ✗ Offline
                    </span>
                  )}
                </td>

                <td className="p-3 text-center">
                  <p>
                    {device.date} | {device.time}
                  </p>

                  <p className="text-xs text-gray-500">{device.lastSeen}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function Card({ title, value, color = "" }) {
  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4">
      <p className="text-gray-500 text-xs sm:text-sm">{title}</p>

      <h2 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

export default Devices;