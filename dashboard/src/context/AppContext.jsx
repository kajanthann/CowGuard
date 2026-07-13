import React, { useState, createContext, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";

export const AppContext = createContext();

const INITIAL_BOUNDARY = [
  { lat: 6.853737, lng: 79.905842 },
  { lat: 6.852922, lng: 79.90577 },
  { lat: 6.851838, lng: 79.905475 },
  { lat: 6.851726, lng: 79.904571 },
  { lat: 6.851275, lng: 79.904172 },
  { lat: 6.851579, lng: 79.902837 },
  { lat: 6.851493, lng: 79.901925 },
  { lat: 6.852037, lng: 79.90164 },
  { lat: 6.851706, lng: 79.90075 },
  { lat: 6.851882, lng: 79.899242 },
  { lat: 6.852811, lng: 79.89972 },
  { lat: 6.852645, lng: 79.901454 },
  { lat: 6.852713, lng: 79.903075 },
  { lat: 6.855174, lng: 79.903442 },
  { lat: 6.855224, lng: 79.903987 },
  { lat: 6.855348, lng: 79.904339 },
  { lat: 6.855046, lng: 79.90641 },
];

export function isInsideBoundary(point, polygon) {
  let inside = false;

  let j = polygon.length - 1;

  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;

    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }

    j = i;
  }

  return inside;
}

function getStatus(receivedAt, date, time) {
  if (!receivedAt) {
    return {
      status: "Offline",
      lastSeenDate: date || "-",
      lastSeenTime: time || "-",
      lastSeenText: "No Data",
    };
  }

  const diff = Date.now() - receivedAt;

  const minutes = Math.floor(diff / 60000);

  let status = "Online";

  if (diff > 180000) {
    status = "Offline";
  }

  let text = "Just now";

  if (minutes > 0 && minutes < 60) {
    text = `${minutes} min ago`;
  }

  if (minutes >= 60) {
    text = `${Math.floor(minutes / 60)} hour ago`;
  }

  return {
    status,

    lastSeenDate: date || "-",

    lastSeenTime: time || "-",

    lastSeenText: text,
  };
}

const AppContextProvider = ({ children }) => {
  const [deviceData, setDeviceData] = useState({});

  const [cows, setCows] = useState([]);

  const [boundary] = useState(INITIAL_BOUNDARY);

  const [refresh, setRefresh] = useState(0);

  // refresh status every minute

  useEffect(() => {
    const timer = setInterval(() => {
      setRefresh((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cowsRef = ref(database, "cows");

    const unsubscribe = onValue(cowsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setDeviceData(data);

        const cowArray = Object.keys(data).map((cowId) => {
          const cow = data[cowId];

          const statusData = getStatus(cow.receivedAt, cow.date, cow.time);

          return {
            id: cowId,

            cowId,

            name: cow.name || cowId,

            breed: cow.breed || "-",

            deviceId: cow.deviceId || cowId,

            lat: cow.latitude || 0,

            lng: cow.longitude || 0,

            altitude: cow.altitude || 0,

            speed: cow.speed || 0,

            satellites: cow.satellites || 0,

            hdop: cow.hdop || 0,

            packetID: cow.packetID || 0,

            rssi: cow.rssi || "-",

            snr: cow.snr || "-",

            date: cow.date,

            time: cow.time,

            receivedAt: cow.receivedAt,

            status: statusData.status,

            lastSeenDate: statusData.lastSeenDate,

            lastSeenTime: statusData.lastSeenTime,

            lastSeenText: statusData.lastSeenText,

            battery: cow.battery || 0,
          };
        });

        setCows(cowArray);
      }
    });

    return () => unsubscribe();
  }, [refresh]);

  const enrichedCows = cows.map((cow) => ({
    ...cow,

    inside: isInsideBoundary(
      {
        lat: cow.lat,
        lng: cow.lng,
      },

      boundary,
    ),
  }));

  const addCow = (formData) => {
    setCows((prev) => [
      ...prev,

      {
        ...formData,

        cowId: formData.cowId,

        name: formData.name,

        battery: 100,

        status: "Online",

        lat: 0,

        lng: 0,
      },
    ]);
  };

  const deleteCow = (cowId) => {
    setCows((prev) => prev.filter((c) => c.cowId !== cowId));
  };

  return (
    <AppContext.Provider
      value={{
        boundary,
        deviceData,

        cows,

        enrichedCows,

        addCow,

        deleteCow,

        isInsideBoundary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
