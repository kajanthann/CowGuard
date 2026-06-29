import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import LiveMap from "./pages/LiveMap";
import Cows from "./pages/Cows";

const App = () => {
  return (
    <Routes>
      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Main Layout */}
      <Route
        path="/*"
        element={
          <div className="flex h-screen">

            {/* Sidebar */}
            <aside className="w-80 h-screen border-r border-gray-200 bg-white sticky top-0">
              <Sidebar />
            </aside>

            {/* Right Section */}
            <div className="flex-1 relative">

              {/* Scrollable Content */}
              <main className="h-screen overflow-y-auto p-6 pb-20">
                <Routes>

                  <Route path="/live-map" element={<LiveMap />} />
                  <Route path="/cows" element={<Cows />} />

                  {/* Future Pages */}
                  {/*  */}
                  {/* <Route path="/animals" element={<Animals />} /> */}
                  {/* <Route path="/add-animal" element={<AddAnimal />} /> */}
                  {/* <Route path="/boundary" element={<Boundary />} /> */}
                  {/* <Route path="/alerts" element={<Alerts />} /> */}
                  {/* <Route path="/history" element={<History />} /> */}
                  {/* <Route path="/settings" element={<Settings />} /> */}
                </Routes>
              </main>

              {/* Bottom Navigation */}
              <footer className="fixed bottom-0 left-80 right-0 h-14 bg-white border-t border-gray-200 shadow-md z-50">
                <Header />
              </footer>

            </div>

          </div>
        }
      />
    </Routes>
  );
};

export default App;