import React from "react";
import Boundary from "../components/Boundary";

const LiveMap = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-green-500">
          Live Map
        </h1>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-gray-300">
        <Boundary />
      </div>

    </div>
  );
};

export default LiveMap;