





import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { useDispatch } from 'react-redux';
import { IoSearch } from 'react-icons/io5';
import { HiHome, HiUser, HiDocumentReport, HiLogout } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingBlock, setLoadingBlock] = useState(false);
    const [loadingUnblock, setLoadingUnblock] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers(); // Fetch all users on component mount
    }, []);

    useEffect(() => {
        filterUsers(); // Filter users whenever filter or users changes
    }, [filter, users]);

    useEffect(() => {
        searchUsers(); // Search users whenever searchTerm changes
    }, [searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/user-view/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedUsers = response.data.map(user => ({
                ...user,
                is_suspended: user.is_suspended !== undefined ? user.is_suspended : false,
            }));
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        if (!searchTerm) {
            // If no search term, reset filtered users to all users
            setFilteredUsers(users);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8000/api/user-list-find/?q=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFilteredUsers(response.data); // Set filtered users directly
        } catch (err) {
            console.error('Search Error:', err);
            setError('Failed to search users.');
        }
    };

    const filterUsers = () => {
        let result = users;

        if (filter === 'active') {
            result = result.filter(user => !user.is_suspended);
        } else if (filter === 'blocked') {
            result = result.filter(user => user.is_suspended);
        }

        if (searchTerm) {
            result = result.filter(user =>
                (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) || (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredUsers(result);
    };

    const handleBlock = async (userId) => {
        setLoadingBlock(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/users/${userId}/block/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map(user => (user.id === userId ? { ...user, is_suspended: true } : user)));
        } catch (err) {
            console.error('Block Error:', err);
            setError('Failed to block user.');
        } finally {
            setLoadingBlock(false);
        }
    };

    const handleUnblock = async (userId) => {
        setLoadingUnblock(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/users/${userId}/unblock/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map(user => (user.id === userId ? { ...user, is_suspended: false } : user)));
        } catch (err) {
            console.error('Unblock Error:', err);
            setError('Failed to unblock user.');
        } finally {
            setLoadingUnblock(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/adminlogin');
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
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
            <div className="flex-1 ml-64 p-6" style={{marginLeft:'20%'}}>
                <h1 className="text-2xl font-bold mb-4">User Management</h1>

                {/* Search and Filter Wrapper */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    {/* Search Input */}
                    {/* <div className="mb-4 md:mb-0 flex items-center">
                        <IoSearch className="mr-2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-400 transition-all duration-300 ease-in-out"
                        />
                    </div> */}

                    {/* Filter Dropdown */}
                    <div className="mb-4 md:mb-0">
                        <label htmlFor="filter" className="mr-2 font-semibold">Filter:</label>
                        <select
                            id="filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-400 transition-all duration-300 ease-in-out"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-left">
                            <th className="py-3 px-4 border-b">Name</th>
                            <th className="py-3 px-4 border-b">Username</th>
                            <th className="py-3 px-4 border-b">Email</th>
                            <th className="py-3 px-4 border-b">Status</th>
                            <th className="py-3 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b">{user.first_name}</td>
                                <td className="py-2 px-4 border-b">{user.username}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">{user.is_suspended ? 'Blocked' : 'Active'}</td>
                                <td className="py-2 px-4 border-b">
                                    {user.is_suspended ? (
                                        <button 
                                            onClick={() => handleUnblock(user.id)} 
                                            disabled={loadingUnblock}
                                            className={`text-green-600 hover:underline ${loadingUnblock ? 'cursor-not-allowed' : ''}`}
                                        >
                                            {loadingUnblock ? 'Unblocking...' : 'Unblock'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleBlock(user.id)} 
                                            disabled={loadingBlock}
                                            className={`text-red-600 hover:underline ${loadingBlock ? 'cursor-not-allowed' : ''}`}
                                        >
                                            {loadingBlock ? 'Blocking...' : 'Block'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
