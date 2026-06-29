import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const navClass = ({ isActive }) =>
    `px-5 py-4 text-sm font-medium transition-all duration-200 border-t-4 border-r4 ${
      isActive
        ? "border-green-500 text-green-600 bg-green-50"
        : "border-transparent text-gray-700 hover:text-green-600 hover:bg-gray-50"
    }`;

  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between pr-3 shadow-sm">
      
      {/* Navigation */}
      <nav className="flex items-center">
        {/* <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink> */}

        <NavLink to="/live-map" className={navClass}>
          Live Map
        </NavLink>
        <NavLink to="/cows" className={navClass}>
          Cows
        </NavLink>

        <NavLink to="/alerts" className={navClass}>
          Alerts
        </NavLink>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">
          Status: Live
        </button>
      </div>
    </header>
  );
};

export default Header;