import React from "react";
import {
  FaShieldAlt,
  FaBell,
  FaCircle,
  FaUserCircle,
} from "react-icons/fa";

const MobileSummaryBar = () => {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              CowGuard
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center">
            <FaBell className="text-gray-700 text-lg" />

            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
          </button>

          <button className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <FaUserCircle className="text-green-700 text-2xl" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileSummaryBar;