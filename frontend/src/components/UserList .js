// UserList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const UserList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get('http://localhost:8000/api/users/'); // Update API endpoint for users
            setUsers(response.data);
        };

        fetchUsers();
    }, []);

    return (
        <List>
            {users.map((user) => (
                <ListItem key={user.id} component={Link} to={`/chat/${user.id}`}>
                    <ListItemText primary={user.username} />
                </ListItem>
            ))}
        </List>
    );
};

export default UserList;
