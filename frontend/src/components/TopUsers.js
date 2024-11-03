import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { motion } from 'framer-motion';

const TopUsers = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get('http://localhost:8000/api/top-users/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTopUsers(response.data);
            } catch (err) {
                setError(err.response ? err.response.data : 'An error occurred');
                console.error('Error fetching top users:', err);
            }
        };

        fetchTopUsers();
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-4 w-full max-w-lg mx-auto border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Top Users</h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <ul className="space-y-3">
                {topUsers.map(user => (
                    <motion.li 
                        key={user.id} 
                        className="flex justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 shadow-sm border border-gray-300 transition duration-150"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span className="font-medium text-gray-700">{user.username}</span>
                        <span className="text-gray-600 text-sm">Posts: {user.post_count}</span>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default TopUsers;
