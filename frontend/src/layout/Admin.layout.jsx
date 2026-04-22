import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row font-sans pt-16">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-400">
            Admin Panel
          </h2>
        </div>
        <nav className="mt-4 flex flex-col space-y-2 px-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center transition-colors ${
                isActive ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-700 text-gray-300'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/movies"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center transition-colors ${
                isActive ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-700 text-gray-300'
              }`
            }
          >
            Movies Management
          </NavLink>
          <NavLink
            to="/admin/shows"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center transition-colors ${
                isActive ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-700 text-gray-300'
              }`
            }
          >
            Shows Management
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
