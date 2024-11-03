// UserListModal.js



import React from 'react';

const UserListModal = ({ users, onClose, onUserSelect }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-5">
                <h2 className="text-xl font-semibold mb-4">Select a User to Message</h2>
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    &times; {/* Close icon */}
                </button>
                <ul className="max-h-60 overflow-y-auto">
                    {users.map(user => (
                        <li
                            key={user.id}
                            onClick={() => onUserSelect(user)} // This function will be called when a user is selected
                            className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer transition"
                        >
                            <img
                                src={user.profile_picture} // Assuming the user object contains a profile_picture field
                                alt={user.username}
                                className="w-8 h-8 rounded-full mr-3"
                            />
                            {user.username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserListModal;
