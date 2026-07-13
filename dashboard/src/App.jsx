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
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/live-map" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard Layout */}
      <Route
        path="/*"
        element={
          <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Desktop Sidebar */}
            <aside
              className="
              hidden
              md:block
              w-80
              h-screen
              bg-white
              border-r
              border-gray-200
              flex-shrink-0
              "
            >
              <Sidebar />
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Mobile Summary */}
              <div className="md:hidden">
                <MobileSummaryBar />
              </div>

              {/* Page Content */}
              <main
                className="
                flex-1
                overflow-y-auto
                p-3
                sm:p-4
                md:p-6
                pb-20
                md:pb-16
                "
              >
                <Routes>
                  <Route path="/live-map" element={<LiveMap />} />

                  <Route path="/cows" element={<Cows />} />

                  <Route path="/alerts" element={<Alerts />} />

                  <Route path="/devices" element={<Devices />} />
                </Routes>
              </main>

              {/* Desktop Bottom Header */}
              <footer
                className="
                hidden
                md:flex
                fixed
                bottom-0
                left-80
                right-0
                h-14
                bg-white
                border-t
                border-gray-200
                shadow-md
                z-50
                "
              >
                <Header />
              </footer>

              {/* Mobile Bottom Navigation */}
              <footer
                className="
                md:hidden
                fixed
                bottom-0
                left-0
                right-0
                h-16
                bg-white
                border-t
                border-gray-200
                shadow-lg
                z-50
                "
              >
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
