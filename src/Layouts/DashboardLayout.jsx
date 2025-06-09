import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <>
      <Navbar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </>
  );
};

export default DashboardLayout;
