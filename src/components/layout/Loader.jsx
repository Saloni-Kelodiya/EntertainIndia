import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin mb-4"></div>
      
       <h2 className="text-xl md:text-2xl font-semibold tracking-wide">
        🎬 Loading <span className="text-red-500 font-bold">EntertainIndia</span>...
      </h2>
    </div>
  );
};

export default Loader;
