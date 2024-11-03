import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MessageUserList = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get('http://localhost:8000/api/user-view/'); // Adjust endpoint as needed
            setUsers(response.data);
        };
        fetchUsers();
    }, []);

    return (
        <div className="user-list">
            {users.map((user) => (
                <div key={user.id} onClick={() => onSelectUser(user)}>
                    {user.first_name}
                </div>
            ))}
        </div>
    );
};

export default MessageUserList;
