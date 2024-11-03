// ChatWindow.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatWindow = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');

    const fetchMessages = async () => {
        const response = await axios.get(`http://localhost:8000/posts/messages/?recipient_id=${selectedUser.id}`);
        setMessages(response.data);
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (messageContent.trim()) {
            const newMessage = {
                recipient: selectedUser.id,
                content: messageContent,
            };

            await axios.post('http://localhost:8000/posts/messages/create/', newMessage);
            setMessageContent('');
            fetchMessages();  // Refresh messages after sending
        }
    };

    return (
        <div>
            <div className="messages">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <strong>{msg.sender.username}: </strong>{msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;
