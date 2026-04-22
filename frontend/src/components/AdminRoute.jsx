import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/Auth.context';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user && user.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
