



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
    const [blockStatus, setBlockStatus] = useState(''); // To show block message to the user
    const [loadingBlock, setLoadingBlock] = useState(false);
    const [loadingUnblock, setLoadingUnblock] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const errors = useSelector((state) => state.auth.error);


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
            setFilteredUsers(users);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8000/api/user-list-find/?q=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFilteredUsers(response.data);
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
                (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                    <NavLink to="/admin-dashboard" className={({ isActive }) =>
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }>
                        <HiHome className="w-6 h-6 mr-3" />
                        <span className="font-semibold">Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin-user" className={({ isActive }) =>
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }>
                        <HiUser className="w-6 h-6 mr-3" />
                        <span className="font-semibold">Users</span>
                    </NavLink>
                    <NavLink to="/activity-feed" className={({ isActive }) =>
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }>
                        <HiUser className="w-6 h-6 mr-3" />
                        <span className="font-semibold">User Feed</span>
                    </NavLink>
                    <NavLink to="/reports" className={({ isActive }) =>
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }>
                        <HiDocumentReport className="w-6 h-6 mr-3" />
                        <span className="font-semibold">Reports</span>
                    </NavLink>
                    <button onClick={handleLogout} className="flex items-center w-full text-left p-4 rounded-md hover:bg-red-600 transition-colors mt-auto">
                        <HiLogout className="w-6 h-6 mr-3" />
                        <span className="font-semibold">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-6" style={{marginLeft:'20%'}}>
                <h1 className="text-2xl font-bold mb-4">User Management</h1>
                {blockStatus && <div className="text-center text-red-600">{blockStatus}</div>}

                {/* Remaining Code (Table, Filters, and Search) */}
                {/* ... */}
            </div>
        </div>
    );
};

export default UserList;

