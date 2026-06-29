import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import LiveMap from "./pages/LiveMap";
import Cows from "./pages/Cows";
import Alerts from "./pages/Alerts";
import Devices from "./pages/Devices";
import MobileSummaryBar from "./components/MobileSummaryBar";
import BottomNav from "./components/BottomNav";

const App = () => {
  return (
    <Routes>
      {/* Redirect */}
      <Route path="/" element={<Navigate to="/live-map" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />
      

      {/* Main Layout */}
      <Route
        path="/*"
        element={
          <div className="md:flex h-screen">

            {/* Sidebar */}
            <aside className="w-80 hidden md:block h-screen border-r border-gray-200 bg-white sticky top-0">
              <Sidebar />
            </aside>

             <div>
              <MobileSummaryBar />
            </div>
           

            {/* Right Section */}
            <div className="flex-1 relative">

              {/* Scrollable Content */}
              <main className="h-screen overflow-y-auto p-6 pb-20">
                <Routes>

                  <Route path="/live-map" element={<LiveMap />} />
                  <Route path="/cows" element={<Cows />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/devices" element={<Devices />} />

                </Routes>
              </main>

              {/* Bottom Navigation */}
              <footer className="hidden md:flex fixed bottom-0 left-80 right-0 h-14 bg-white border-t border-gray-200 shadow-md z-50">
                <Header />
              </footer>
              <footer>
                <BottomNav />
              </footer>


            </div>

          </div>
        }
      />
    </Routes>
  );
};

export default App;