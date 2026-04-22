import React from "react";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/Auth.context";

const SettingsPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Account & Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800">
                  {user ? user.name || 'Not provided' : 'Guest User'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800">
                  {user ? user.email : 'Not signed in'}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-800">Email Updates</h3>
                  <p className="text-sm text-gray-500">Receive offers, recommendations and updates</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-red-500 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(SettingsPage);
