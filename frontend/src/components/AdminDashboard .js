

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import UserGrowthChart from './UserGrowthChart';
import EngagementMetrics from './EngagementMetrics';
import { HiHome, HiUser, HiDocumentReport, HiChartBar, HiLogout } from 'react-icons/hi';
import TopUsers from './TopUsers';
import ActivityFeed from './ActivityFeed';
import { NavLink } from 'react-router-dom';
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/adminlogin');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/adminlogin');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/user-count/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}` // Corrected this line
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setTotalUsers(data.total_users);
        setTotalPosts(data.total_posts);
        setTotalComments(data.total_comments);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white shadow-lg fixed inset-y-0 left-0 flex flex-col">
            <div className="flex items-center justify-center h-20 text-2xl font-bold tracking-wider border-b border-indigo-500">
                Admin Panel
            </div>
            <nav className="flex-1 p-4 space-y-4">
                <NavLink 
                    to="/admin-dashboard" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiHome className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/admin-user" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiUser className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Users</span>
                </NavLink>
                <NavLink 
                    to="/activity-feed" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiUser className="w-6 h-6 mr-3" />
                    <span className="font-semibold">User Feed</span>
                </NavLink>
                <NavLink 
                    to="/reports" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiDocumentReport className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Reports</span>
                </NavLink>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left p-4 rounded-md hover:bg-red-600 transition-colors mt-auto"
                >
                    <HiLogout className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Logout</span>
                </button>
            </nav>
        </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 bg-gray-200 overflow-y-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome, {user?.email || 'Admin'}!</h2>
          <p className="text-gray-600">Here's an overview of your dashboard and recent activity.</p>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
            {loading ? (
              <p className="text-3xl font-bold text-blue-600">Loading...</p>
            ) : error ? (
              <p className="text-red-600">{error.message}</p>
            ) : (
              <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <h3 className="text-lg font-medium text-gray-700">Total Posts</h3>
            <p className="text-3xl font-bold text-green-600">{totalPosts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <h3 className="text-lg font-medium text-gray-700">Total Comments</h3>
            <p className="text-3xl font-bold text-green-600">{totalComments}</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* <div className="bg-white shadow-md rounded-lg p-4">
            <ActivityFeed />
          </div> */}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">User Growth Over Time</h2>
            <UserGrowthChart />
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Engagement Metrics</h2>
            <EngagementMetrics />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
