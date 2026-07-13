import React from "react";
import { NavLink } from "react-router-dom";
import { FaMapLocationDot, FaBell } from "react-icons/fa6";
import { PiCowDuotone } from "react-icons/pi";
import { TbDeviceAirtag } from "react-icons/tb";

const navItems = [
  { path: "/live-map", icon: FaMapLocationDot, label: "Map" },
  { path: "/cows", icon: PiCowDuotone, label: "Cows" },
  { path: "/devices", icon: TbDeviceAirtag, label: "Devices" },
  { path: "/alerts", icon: FaBell, label: "Alerts" },
];

const BottomNav = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center md:hidden z-50">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-0.5 w-full h-full relative"
          >
            {({ isActive }) => (
              <>
                {/* Active top indicator */}
                <span
                  className={`absolute top-0 h-0.5 w-12.5 rounded-full bg-green-600 transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div
                  className={`flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-green-100 scale-110 px-3 py-2 rounded-b-4xl"
                      : "bg-transparent px-3 py-1.5"
                  }`}
                >
                  <Icon
                    className={`text-xl transition-colors duration-200 ${
                      isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </footer>
  );
};

export default BottomNav;