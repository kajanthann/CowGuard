import React, { useState } from "react";

const Devices = () => {
  const [devices, setDevices] = useState([
    {
      id: 1,
      deviceId: "DEV-001",
      loraId: "LORA-001",
      assignedCow: "Cow-001",
      battery: 92,
      gps: true,
      online: true,
      rssi: -63,
      firmware: "v1.2.0",
      lastSeen: "10 sec ago",
    },
    {
      id: 2,
      deviceId: "DEV-002",
      loraId: "LORA-002",
      assignedCow: "Cow-002",
      battery: 65,
      gps: true,
      online: true,
      rssi: -71,
      firmware: "v1.2.0",
      lastSeen: "20 sec ago",
    },
    {
      id: 3,
      deviceId: "DEV-003",
      loraId: "LORA-003",
      assignedCow: "Cow-003",
      battery: 18,
      gps: true,
      online: true,
      rssi: -89,
      firmware: "v1.1.8",
      lastSeen: "40 sec ago",
    },
    {
      id: 4,
      deviceId: "DEV-004",
      loraId: "LORA-004",
      assignedCow: "Cow-004",
      battery: 84,
      gps: false,
      online: false,
      rssi: "-",
      firmware: "v1.0.5",
      lastSeen: "15 min ago",
    },
    {
      id: 5,
      deviceId: "DEV-005",
      loraId: "LORA-005",
      assignedCow: "Cow-005",
      battery: 47,
      gps: true,
      online: true,
      rssi: -74,
      firmware: "v1.2.1",
      lastSeen: "5 sec ago",
    },
  ]);

  const deleteDevice = (id) => {
    setDevices(devices.filter((d) => d.id !== id));
  };

  return (
    <div className="">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Device Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage LoRa GPS tracking devices
          </p>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-5 gap-4 mb-6">

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Total Devices</p>
          <h2 className="text-3xl font-bold mt-2">{devices.length}</h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Online</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {devices.filter(d=>d.online).length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Offline</p>
          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {devices.filter(d=>!d.online).length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">GPS Lost</p>
          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {devices.filter(d=>!d.gps).length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Low Battery</p>
          <h2 className="text-3xl font-bold text-yellow-500 mt-2">
            {devices.filter(d=>d.battery<20).length}
          </h2>
        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Device ID</th>
              <th className="p-3 text-left">LoRa ID</th>
              <th className="p-3 text-left">Assigned Cow</th>
              <th className="p-3 text-center">Battery</th>
              <th className="p-3 text-center">GPS</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">RSSI</th>
              <th className="p-3 text-center">Last Seen</th>

            </tr>

          </thead>

          <tbody>

            {devices.map((device) => (

              <tr
                key={device.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3 font-mono">
                  {device.deviceId}
                </td>

                <td className="p-3 font-mono">
                  {device.loraId}
                </td>

                <td className="p-3">
                  {device.assignedCow}
                </td>

                <td className="p-3">

                  <div className="flex items-center justify-center gap-2">

                    <div className="w-20 bg-gray-200 rounded-full h-2">

                      <div
                        className={`h-2 rounded-full ${
                          device.battery > 60
                            ? "bg-green-500"
                            : device.battery > 20
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${device.battery}%` }}
                      />

                    </div>

                    <span>{device.battery}%</span>

                  </div>

                </td>

                <td className="text-center">

                  {device.gps ? (
                    <span className="text-green-600 font-semibold">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ✗ Lost
                    </span>
                  )}

                </td>

                <td className="text-center">

                  {device.online ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      Online
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                      Offline
                    </span>
                  )}

                </td>

                <td className="text-center">
                  {device.rssi}
                </td>

                <td className="text-center">
                  {device.lastSeen}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Devices;