import React from "react";
import { NavLink } from "react-router-dom";

const bottomClass = ({ isActive }) =>
  `flex flex-col items-center text-xs px-5 py-4 ${
    isActive ? "bg-green-200" : "text-gray-500"
  }`;

const BottomNav = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-gray-200 shadow-md flex justify-around items-center md:hidden z-50">
      
      <NavLink to="/live-map" className={bottomClass}>
        🗺️
      </NavLink>

      <NavLink to="/cows" className={bottomClass}>
        🐄
      </NavLink>

      <NavLink to="/devices" className={bottomClass}>
        📟
      </NavLink>

      <NavLink to="/alerts" className={bottomClass}>
        🔔
      </NavLink>
    </footer>
  );
};

export default BottomNav;