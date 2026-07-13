import React, { useState, createContext, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";

export const AppContext = createContext();

const ENABLE_DUMMY_DATA = true;

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

// Dummy cows for dashboard testing

const DUMMY_COWS = [
  {
    id: "COW02",
    cowId: "COW02-dummy",
    name: "Mala",
    breed: "Jersey",
    deviceId: "COW_002",
    lat: 6.8525,
    lng: 79.9035,
    battery: 85,
    speed: 0.4,
    satellites: 8,
    rssi: -35,
    snr: 10,
    packetID: 500,
    status: "Online",
    lastSeenText: "Just now",
    isDummy: true,
  },

  {
    id: "COW03",
    cowId: "COW03-dummy",
    name: "Nila",
    breed: "Holstein",
    deviceId: "COW_003",
    lat: 6.853,
    lng: 79.9048,
    battery: 65,
    speed: 0.2,
    satellites: 7,
    rssi: -40,
    snr: 9,
    packetID: 600,
    status: "Online",
    lastSeenText: "1 min ago",
    isDummy: true,
  },

  {
    id: "COW04",
    cowId: "COW04-dummy",
    name: "Ganga",
    breed: "Brown Swiss",
    deviceId: "COW_004",
    lat: 6.854,
    lng: 79.9039,
    battery: 45,
    speed: 0,
    satellites: 6,
    rssi: -45,
    snr: 8,
    packetID: 700,
    status: "Online",
    lastSeenText: "3 min ago",
    isDummy: true,
  },

  // OUTSIDE BOUNDARY COW
  {
    id: "COW05",
    cowId: "COW05-dummy",
    name: "Kamala",
    breed: "Sahiwal",
    deviceId: "COW_005",
    lat: 6.8565,
    lng: 79.9085,
    battery: 15,
    speed: 1.5,
    satellites: 5,
    rssi: -60,
    snr: 5,
    packetID: 800,
    status: "Online",
    lastSeenText: "Just now",
    isDummy: true,
  },
];

const AppContextProvider = ({ children }) => {
  const [deviceData, setDeviceData] = useState({});
  const [cows, setCows] = useState([]);
  const [boundary] = useState(INITIAL_BOUNDARY);
  const [refresh, setRefresh] = useState(0);

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

    let firebaseCows = [];

    const now = new Date();

    const currentDate = now.toLocaleDateString();

    const currentTime = now.toLocaleTimeString();


    if (data) {

      setDeviceData(data);

      firebaseCows = Object.keys(data).map((cowId) => {

        const cow = data[cowId];

        const statusData = getStatus(
          cow.receivedAt,
          cow.date,
          cow.time
        );


        return {

          id: cowId,

          cowId,

          name: cow.name || cowId,

          breed: cow.breed || "",

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


          date: cow.date || currentDate,

          time: cow.time || currentTime,


          receivedAt: cow.receivedAt || Date.now(),


          status: statusData.status,


          lastSeenDate:
            statusData.lastSeenDate !== "-"
              ? statusData.lastSeenDate
              : currentDate,


          lastSeenTime:
            statusData.lastSeenTime !== "-"
              ? statusData.lastSeenTime
              : currentTime,


          lastSeenText:
            statusData.lastSeenText !== "No Data"
              ? statusData.lastSeenText
              : "Just now",


          battery: cow.battery ?? 100,


          isDummy:false,
        };

      });

    }


    if (ENABLE_DUMMY_DATA) {

      setCows([
        ...firebaseCows,
        ...DUMMY_COWS
      ]);

    } else {

      setCows(firebaseCows);

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

        isDummy: true,
      },
    ]);
  };

  const deleteCow = (cowId) => {
    setCows((prev) => prev.filter((cow) => cow.cowId !== cowId));
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
