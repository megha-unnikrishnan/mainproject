import React, { useState } from 'react';

const MessageInput = ({ recipientId, onSendMessage }) => {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', content);
        if (imageFile) formData.append('image', imageFile);
        if (videoFile) formData.append('video', videoFile);
        formData.append('recipient', recipientId); // Include recipient

        // Send message to the server
        await onSendMessage(formData);
        setContent('');
        setImageFile(null);
        setVideoFile(null);
    };

    return (
        <form onSubmit={handleSubmit} className="message-input-form">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
            />
            <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
            />
            <button type="submit">Send</button>
        </form>
    );
};

export default MessageInput;
