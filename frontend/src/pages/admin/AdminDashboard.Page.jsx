import React, { useEffect, useState } from 'react';
import * as adminService from '../../services/admin.service';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} />
        <StatCard title="Movies in DB" value={stats?.totalMovies || 0} />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} />
        <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue || 0}`} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl backdrop-blur-lg flex flex-col items-center justify-center transition-transform hover:scale-105">
    <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">{title}</h3>
    <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-orange-400">
      {value}
    </p>
  </div>
);

export default AdminDashboard;
