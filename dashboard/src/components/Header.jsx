import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const navClass = ({ isActive }) =>
    `px-5 py-4 text-sm font-medium transition-all duration-200 border-t-4 ${
      isActive
        ? "border-green-500 text-green-600 bg-green-50"
        : "border-transparent text-gray-700 hover:text-green-600 hover:bg-gray-50"
    }`;

  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between pr-3 shadow-sm">
      {/* Nav hidden on mobile, bottom nav takes over */}
      <nav className="hidden md:flex items-center">
        <NavLink to="/live-map" className={navClass}>Live Map</NavLink>
        <NavLink to="/cows" className={navClass}>Cows</NavLink>
        <NavLink to="/devices" className={navClass}>Devices</NavLink>
        <NavLink to="/alerts" className={navClass}>Alerts</NavLink>
      </nav>

      {/* On mobile, show app name where nav used to be */}
      <span className="md:hidden px-4 text-sm font-semibold text-gray-800">CowGuard</span>

      <div className="flex items-center gap-3">
  <button className="px-2 border border-green-500 text-green-900 rounded-full text-sm flex items-center gap-2">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    Live
  </button>
</div>
    </header>
  );
};

export default Header;