import React from "react";
import FarmMap from "./FarmMap";
 
const CowMapModal = ({ cow, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
 
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
 
      {/* Modal */}
      <div
        className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
        style={{ width: 850, height: 620 }}
      >
 
        {/* Header */}
        <div className="px-5 py-3 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="font-semibold text-gray-800">
              {cow.name} · {cow.cowId}
            </h2>
            <p className="text-xs text-gray-500">
              {cow.breed} · {cow.loraId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>
 
        {/* Map — single cow mode, not interactive (bounded to farm) */}
        <div className="flex-1">
          <FarmMap
            mode="single"
            cow={cow}
            interactive={false}
            showCorners={false}
          />
        </div>
 
        {/* Footer */}
        <div className="px-4 py-2 border-t text-sm flex justify-between bg-white">
          <span>
            Status:{" "}
            <b style={{ color: cow.inside ? "green" : "red" }}>
              {cow.inside ? "Inside" : "Outside"}
            </b>
          </span>
          <span>Battery: {cow.battery}%</span>
        </div>
 
      </div>
    </div>
  );
};
 
export default CowMapModal;
 