import React from "react";
import DefaultlayoutHoc from "../layout/Default.layout";
import { BiBell } from "react-icons/bi";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BiBell className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No new notifications</h2>
          <p className="text-gray-500 mb-6 max-w-sm">
            You're all caught up! We'll let you know when there are updates on your bookings, exciting offers, or upcoming movies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(NotificationsPage);
