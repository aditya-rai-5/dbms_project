import React from "react";
import DefaultlayoutHoc from "../layout/Default.layout";
import { Link } from "react-router-dom";

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-lg w-full text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Feature Coming Soon!</h1>
        <p className="text-gray-500 mb-8">
          We are working hard to bring this feature to you. Stay tuned for exciting updates.
        </p>
        <Link 
          to="/" 
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(ComingSoonPage);
