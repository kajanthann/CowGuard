import React, { useState, useContext } from "react";
import AddCow from "../components/AddCow";
import CowMapModal from "../components/CowMapModal"; // now uses FarmMap internally
import { AppContext } from "../context/AppContext.jsx";
 
const Cows = () => {
  const { enrichedCows, addCow, deleteCow } = useContext(AppContext);
 
  const [isOpen, setIsOpen]           = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
 
  const [form, setForm] = useState({
    cowId: "",
    name: "",
    breed: "",
    deviceId: "",
  });
 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleAddCow = (e) => {
    e.preventDefault();
    addCow(form);
    setForm({ cowId: "", name: "", breed: "", deviceId: "" });
    setIsOpen(false);
  };
 
  return (
    <div>
 
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Cows Dashboard</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Add Cow
        </button>
      </div>
 
      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Cow ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Breed</th>
              <th className="p-3">Device ID</th>
              <th className="p-3">Battery</th>
              <th className="p-3">Boundary</th>
              <th className="p-3">Status</th>
              <th className="p-3">Map</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrichedCows.map((cow) => (
              <tr key={cow.cowId} className="border-b hover:bg-gray-50">
 
                <td className="p-3 font-mono">{cow.cowId}</td>
                <td className="p-3">{cow.name}</td>
                <td className="p-3">{cow.breed}</td>
                <td className="p-3 font-mono text-xs">{cow.deviceId}</td>
 
                <td className="p-3">🔋 {cow.battery}%</td>
 
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{cow.inside ? "🟢" : "🔴"}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        cow.inside
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cow.inside ? "In" : "Out"}
                    </span>
                  </div>
                </td>
 
                <td className="p-3">{cow.status}</td>
 
                <td className="p-3">
                  <button
                    onClick={() => setSelectedCow(cow)}
                    className="text-blue-600 hover:underline"
                  >
                    View Map
                  </button>
                </td>
 
                <td className="p-3">
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
 
      {/* Add Cow Modal */}
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-white/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 w-8 h-8 font-bold text-black flex items-center justify-center"
            >
              ✕
            </button>
            <AddCow form={form} handleChange={handleChange} addCow={handleAddCow} />
          </div>
        </div>
      )}
 
      {/* Cow Map Modal */}
      {selectedCow && (
        <div className="fixed inset-0 z-[9999]">
          <CowMapModal cow={selectedCow} onClose={() => setSelectedCow(null)} />
        </div>
      )}
 
    </div>
  );
};
 
export default Cows;