import React, { useState, createContext } from "react";

// named export — must match what Boundary.jsx imports
export const AppContext = createContext();

const INITIAL_BOUNDARY = [
  { lat: 6.853737, lng: 79.905842 },
  { lat: 6.852922, lng: 79.905770 },
  { lat: 6.851838, lng: 79.905475 },
  { lat: 6.851726, lng: 79.904571 },
  { lat: 6.851275, lng: 79.904172 },
  { lat: 6.851579, lng: 79.902837 },
  { lat: 6.851493, lng: 79.901925 },
  { lat: 6.852037, lng: 79.901640 },
  { lat: 6.851706, lng: 79.900750 },
  { lat: 6.851882, lng: 79.899242 },
  { lat: 6.852811, lng: 79.899720 },
  { lat: 6.852645, lng: 79.901454 },
  { lat: 6.852713, lng: 79.903075 },
  { lat: 6.855174, lng: 79.903442 },
  { lat: 6.855224, lng: 79.903987 },
  { lat: 6.855348, lng: 79.904339 },
  { lat: 6.855046, lng: 79.906410 },
];

const INITIAL_COWS = [
  { id: "COW_01", cowId: "COW_01", name: "Mala",    breed: "Jersey",   deviceId: "24:6F:28:AB:CD:EF", loraId: "NODE_01", lat: 6.8534, lng: 79.9048, battery: 85, status: "active"    },
  { id: "COW_02", cowId: "COW_02", name: "Nila",    breed: "Holstein", deviceId: "AA:BB:CC:DD:EE:FF", loraId: "NODE_02", lat: 6.8528, lng: 79.9035, battery: 72, status: "active"    },
  { id: "COW_03", cowId: "COW_03", name: "Ganga",   breed: "Sahiwal",  deviceId: "11:22:33:44:55:66", loraId: "NODE_03", lat: 6.851157, lng: 79.9045, battery: 91, status: "active"    },
  { id: "COW_04", cowId: "COW_04", name: "Kamala",  breed: "Local",    deviceId: "AA:11:BB:22:CC:33", loraId: "NODE_04", lat: 6.8518, lng: 79.9030, battery: 38, status: "5 min ago" },
  { id: "COW_05", cowId: "COW_05", name: "Sundari", breed: "Friesian", deviceId: "FF:EE:DD:CC:BB:AA", loraId: "NODE_05", lat: 6.8525, lng: 79.9055, battery: 60, status: "2 min ago" },
];

function isInsideBoundary(point, polygon) {
  let inside = false;
  const n = polygon.length;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    if (
      (yi > point.lat) !== (yj > point.lat) &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    ) inside = !inside;
    j = i;
  }
  return inside;
}

// default export — wrap your app with this in main.jsx
const AppContextProvider = ({ children }) => {
  const [cows, setCows]   = useState(INITIAL_COWS);
  const [boundary]        = useState(INITIAL_BOUNDARY);

  const enrichedCows = cows.map((c) => ({
    ...c,
    inside: isInsideBoundary({ lat: c.lat, lng: c.lng }, boundary),
  }));

  const addCow = (formData) => {
    setCows((prev) => [...prev, {
      ...formData,
      id:      formData.cowId,
      battery: 100,
      status:  "active",
      loraId:  "NODE_NEW",
      lat:     6.8528,
      lng:     79.9035,
    }]);
  };

  const deleteCow = (cowId) => {
    setCows((prev) => prev.filter((c) => c.cowId !== cowId));
  };

  return (
    <AppContext.Provider value={{
      boundary,
      cows,
      enrichedCows,
      addCow,
      deleteCow,
      isInsideBoundary,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;