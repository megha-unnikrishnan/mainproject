


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons

const MessageIcon = () => {
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/posts/users/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    

    const handleIconClick = () => {
        fetchUsers();
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleUserSelect = (user) => {
        navigate(`/chat/${user.id}`);
        setIsOpen(false);
    };

    const filteredUsers = users.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const scrollbarStyle = {
        maxHeight: '20rem',
        overflowY: 'auto',
        scrollbarWidth: 'none',
    };

    return (
        <div className="relative">
            <button
                onClick={handleIconClick}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
                <FontAwesomeIcon icon={faEnvelope} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold">Chats</h2>
                        <button onClick={handleClose} className="text-gray-600 hover:text-gray-800">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <div className="p-4 border-b">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                    </div>

                    <div style={scrollbarStyle} className="overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                                >
                                    <img
                                        src={user.profile_picture}
                                        alt={user.first_name}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <span className="text-gray-800">{user.first_name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-gray-500">No users found.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageIcon;
