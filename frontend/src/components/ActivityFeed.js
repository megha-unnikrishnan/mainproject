


 
import axios from 'axios';
import { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiHome, HiUser, HiDocumentReport, HiLogout } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import TopUsers from './TopUsers';
import { NavLink } from 'react-router-dom';
const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const response = await axios.get('http://localhost:8000/api/activity-feed/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setActivities(response.data);
            } catch (err) {
                setError(err.response ? err.response.data.detail || err.message : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/adminlogin');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="loader"></div>
                <span className="text-gray-600 ml-3">Loading activities...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Section */}
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

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col lg:flex-row p-8 ml-64 space-y-8 lg:space-y-0 lg:space-x-8">
                {/* Activity Feed Section */}
                <div className="flex-1 bg-white shadow-lg rounded-lg p-8 lg:w-2/3 overflow-hidden">
                    <h2 className="text-3xl font-bold text-indigo-600 mb-6">User Activity Feed</h2>
                    {/* Scrollable Container with Hidden Scrollbar */}
                    <div className="h-[500px] overflow-y-scroll hide-scrollbar">
                        <ul className="space-y-6">
                            {activities.map(activity => (
                                <motion.li 
                                    key={activity.created_at} 
                                    className="p-6 bg-indigo-50 rounded-lg shadow hover:bg-indigo-100 transition duration-200"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-indigo-700">{activity.username}</span> 
                                            <span className="text-gray-600"> {activity.action}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(activity.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Top Users Section */}
                <div className="lg:w-1/3 bg-white shadow-lg rounded-lg p-8 overflow-y-scroll hide-scrollbar">
                    <h2 className="text-3xl font-bold text-indigo-600 mb-6">Top Users</h2>
                    <div className="space-y-6">
                        <TopUsers />
                    </div>
                </div>
            </div>

            {/* Custom CSS for hiding scrollbars */}
            <style>
                {`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                
                /* Hide scrollbar for IE, Edge and Firefox */
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                `}
            </style>
        </div>
    );
};

export default ActivityFeed;


