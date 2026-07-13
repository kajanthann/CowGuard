import React, { useState, useContext } from "react";
import AddCow from "../components/AddCow";
import CowMapModal from "../components/CowMapModal";
import { AppContext } from "../context/AppContext.jsx";
import {
  FaBatteryHalf,
  FaMapLocationDot,
  FaTrash,
  FaPlus,
} from "react-icons/fa6";

const Cows = () => {
  const { enrichedCows, addCow, deleteCow } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);

  const [form, setForm] = useState({
    cowId: "",
    name: "",
    breed: "",
    deviceId: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddCow = (e) => {
    e.preventDefault();

    addCow(form);

    setForm({
      cowId: "",
      name: "",
      breed: "",
      deviceId: "",
    });

    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-row justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-green-600">
            Cows <span className="text-xs text-gray-500">({enrichedCows.length})</span>
          </h1>
          <p className="text-sm text-gray-500">Manage livestock tracking</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 bg-green-600 text-white m-3 px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
        >
          <FaPlus />
          Add Cow
        </button>
      </div>

      {/* Mobile Cow Cards */}
      <div className="md:hidden space-y-3">
        {enrichedCows.map((cow) => (
          <div key={cow.cowId} className="bg-white rounded-xl shadow border border-gray-300 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{cow.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{cow.cowId}</p>
              </div>

              <span
                className={`px-3 pt-3 rounded-full text-xs font-semibold ${
                  cow.inside ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {cow.inside ? "Inside" : "Outside"}
              </span>
            </div>

            <div className="mt-3 text-sm space-y-1">
              <p>
                <b>Breed:</b> {cow.breed || "Native"}
              </p>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2">
                <FaBatteryHalf
                  className={cow.battery < 20 ? "text-red-500" : "text-green-500"}
                />
                {cow.battery}%
              </p>
              <p>
                Status:
                <span
                  className={
                    cow.status === "Online" ? "text-green-600 ml-2" : "text-red-600 ml-2"
                  }
                >
                  {cow.status}
                </span>
              </p>
              </div>
              
              {cow.status === "Offline" && (
                <p className="text-xs text-gray-500">{cow.lastSeenText}</p>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setSelectedCow(cow)}
                className="flex items-center gap-1 text-blue-600 text-sm"
              >
                <FaMapLocationDot />
                Map
              </button>

              <button
                onClick={() => deleteCow(cow.cowId)}
                className="flex items-center gap-1 text-red-600 text-sm"
              >
                <FaTrash />
                Delete
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
              <th className="p-3 text-left">Cow ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Breed</th>
              <th className="p-3 text-left">Device ID</th>
              <th className="p-3">Battery</th>
              <th className="p-3">Boundary</th>
              <th className="p-3">Status</th>
              <th className="p-3">Map</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {enrichedCows.map((cow) => (
              <tr key={cow.cowId} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="p-3 font-mono">{cow.cowId}</td>
                <td className="p-3">{cow.name}</td>
                <td className="p-3">
                  {cow.breed && cow.breed.trim() !== "" ? cow.breed : "Native"}
                </td>
                <td className="p-3 font-mono text-xs">{cow.deviceId}</td>

                <td className="p-3 text-center">
                  <div className="flex justify-center items-center gap-1">
                    <FaBatteryHalf />
                    {cow.battery}%
                  </div>
                </td>

                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      cow.inside ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cow.inside ? "Inside" : "Outside"}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <p>{cow.status}</p>
                  {cow.status === "Offline" && (
                    <p className="text-xs text-gray-500">{cow.lastSeenText}</p>
                  )}
                </td>

                <td className="p-3 text-center">
                  <button onClick={() => setSelectedCow(cow)} className="text-blue-600">
                    View Map
                  </button>
                </td>

                <td className="p-3 text-center">
                  <button onClick={() => deleteCow(cow.cowId)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Cow Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md">
            <button onClick={() => setIsOpen(false)} className="absolute right-3 top-3 z-10">
              ✕
            </button>

            <AddCow form={form} handleChange={handleChange} addCow={handleAddCow} />
          </div>
        </div>
      )}

      {/* Map Modal */}
      {selectedCow && (
        <div className="fixed inset-0 z-[9999]">
          <CowMapModal cow={selectedCow} onClose={() => setSelectedCow(null)} />
        </div>
      )}
    </div>
  );
};

export default Cows;