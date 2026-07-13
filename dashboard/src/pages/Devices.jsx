import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Devices = () => {
  const { deviceData } = useContext(AppContext);

  const getLastSeen = (timestamp) => {
    if (!timestamp) return { text: "-", online: false };

    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    let text = "";

    if (seconds < 60) {
      text = `${seconds} sec ago`;
    } else if (minutes < 60) {
      text = `${minutes} min ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      text = `${hours} hour ago`;
    }

    return {
      text,
      online: diff < 120000,
    };
  };

  const devices = Object.keys(deviceData).map((id) => {
    const device = deviceData[id];

    const lastSeen = getLastSeen(device.receivedAt);

    return {
      id,
      deviceId: id,
      cow: id,
      battery: device.battery ?? 0,

      gps:
        lastSeen.online &&
        device.latitude &&
        device.longitude &&
        device.satellites > 0,

      lora: lastSeen.online,

      rssi: device.rssi ?? "-",
      snr: device.snr ?? "-",

      receivedAt: device.receivedAt,

      date: device.date ?? "-",
      time: device.time ?? "-",

      lastSeen: lastSeen.text,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-600">
          Device Management
        </h1>
        <p className="text-gray-500 text-sm">
          Manage LoRa GPS tracking devices
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card title="Total Devices" value={devices.length} />

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
          title="GPS Lost"
          value={devices.filter((d) => !d.gps).length}
          color="text-orange-500"
        />

        <Card
          title="Low Battery"
          value={devices.filter((d) => d.battery < 20).length}
          color="text-yellow-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
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
              <tr key={device.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 font-mono">
                  {device.deviceId}
                </td>

                <td className="p-3">
                  {device.cow}
                </td>

                <td className="p-3 text-center">
                  {device.battery}%
                </td>

                <td className="text-center">
                  {device.gps ? (
                    <span className="text-green-600 font-semibold">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-600">
                       <span className="text-red-600 font-semibold">✗</span> Offline
                    </span>
                  )}
                </td>

                <td className="text-center">
                  {device.lora ? (
                    <div>
                      <span className="text-green-600 font-semibold block">
                        ✓ Online
                      </span>

                      <span className="text-xs text-gray-500">
                        RSSI: {device.rssi} dBm
                      </span>

                      <br />

                      <span className="text-xs text-gray-500">
                        SNR: {device.snr} dB
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-600">
                       <span className="text-red-600 font-semibold">✗</span> Offline
                    </span>
                  )}
                </td>

                <td className="text-center">
                  <div>
                    <div className="flex justify-center items-center gap-2">
                      <p>{device.date}</p>|<p> {device.time}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {device.lastSeen}
                    </p>
                  </div>
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
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-500 text-sm">
        {title}
      </p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}

export default Devices;