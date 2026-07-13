import React from "react";
import {
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { SiSwisscows } from "react-icons/si";

const MobileSummaryBar = () => {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Logo */}
        <div className="flex items-center gap-1">
          <SiSwisscows className="text-3xl text-green-600" />

          <span className="h-8 border-r-3 border-gray-300"></span>

          <div className="flex items-baseline">
            <h1 className="text-2xl font-electrolize font-bold tracking-wide text-green-600">
              Cow
            </h1>

            <span className="text-2xl font-electrolize font-bold tracking-wide text-gray-500">
              Guard
            </span>
          </div>
        </div>


        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Notification */}
          <button
            className="
              relative 
              w-10 h-10 
              rounded-full 
              bg-gray-100 
              hover:bg-gray-200 
              transition 
              flex 
              items-center 
              justify-center
            "
          >
            <FaBell className="text-gray-700 text-lg" />

            {/* Notification dot */}
            <span
              className="
                absolute 
                top-2 
                right-2 
                w-2 
                h-2 
                rounded-full 
                bg-red-500
              "
            />
          </button>


          {/* Profile */}
          <button
            className="
              w-10 
              h-10 
              rounded-full 
              bg-green-50 
              border 
              border-green-200 
              flex 
              items-center 
              justify-center
            "
          >
            <FaUserCircle className="text-green-700 text-2xl" />
          </button>

        </div>

      </div>
    </header>
  );
};

export default MobileSummaryBar;