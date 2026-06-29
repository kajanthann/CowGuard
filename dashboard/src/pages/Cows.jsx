import React, { useState } from "react";
import AddCow from "../components/AddCow";

const Cows = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    cowId: "",
    name: "",
    breed: "",
    deviceId: "",
  });

  // 🔥 Dummy IoT data (you will replace with Firebase later)
  const [cows, setCows] = useState([
    {
      cowId: "COW_01",
      name: "Rani",
      breed: "Jersey",
      deviceId: "24:6F:28:AB:CD:EF",
      battery: 78,
      status: "active",
      loraId: "NODE_12",
    },
    {
      cowId: "COW_02",
      name: "Kali",
      breed: "Local",
      deviceId: "AA:BB:CC:DD:EE:FF",
      battery: 12,
      status: "2 min ago",
      loraId: "NODE_07",
    },
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addCow = (e) => {
    e.preventDefault();

    setCows([
      ...cows,
      {
        ...form,
        battery: 100,
        status: "active",
        lastSeen: "just now",
        loraId: "NODE_NEW",
      },
    ]);

    setForm({
      cowId: "",
      name: "",
      breed: "",
      deviceId: "",
    });

    setIsOpen(false);
  };

  const deleteCow = (id) => {
    setCows(cows.filter((c) => c.cowId !== id));
  };

  const viewMap = (cow) => {
    alert(`Map View (UI only)\n\nCow: ${cow.cowId}\nLat/Lng: (coming from GPS)`);
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">🐄 Cows Dashboard</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Add Cow
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm text-left">

          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Cow ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Breed</th>
              <th className="p-3">Device ID</th>
              <th className="p-3">Battery</th>
              <th className="p-3">Status</th>
              <th className="p-3">LoRa ID</th>
              <th className="p-3">Map</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {cows.map((cow) => (
              <tr key={cow.cowId} className="border-b hover:bg-gray-50">

                <td className="p-3 font-mono">{cow.cowId}</td>
                <td className="p-3">{cow.name}</td>
                <td className="p-3">{cow.breed}</td>
                <td className="p-3 font-mono text-xs">{cow.deviceId}</td>

                {/* Battery */}
                <td className="p-3">
                  <span
                    className={`font-semibold ${
                      cow.battery < 20 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    🔋 {cow.battery}%
                  </span>
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      cow.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {cow.status}
                  </span>
                </td>

                {/* LoRa */}
                <td className="p-3 font-mono text-xs">{cow.loraId}</td>


                {/* Map */}
                <td className="p-3">
                  <button
                    onClick={() => viewMap(cow)}
                    className="text-blue-600 hover:underline"
                  >
                    View Map
                  </button>
                </td>

                {/* Actions */}
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => alert("Edit UI later")}
                    className="text-yellow-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCow(cow.cowId)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">

          {/* Blur background (only main content) */}
          <div
            className="absolute inset-0 bg-white/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div className="relative z-10 w-[500px]">

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-8 top-8 text-black font-bold"
            >
              ✕
            </button>

            <AddCow
              form={form}
              handleChange={handleChange}
              addCow={addCow}
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default Cows;