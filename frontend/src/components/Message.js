import React from 'react';

const Message = ({ message }) => {
    return (
        <div className="message">
            <strong>{message.sender.first_name}:</strong>
            {message.content && <span> {message.content}</span>}
            {message.image && (
                <img src={message.image} alt="message" style={{ width: '100px', height: 'auto' }} />
            )}
            {message.video && (
                <video controls width="300">
                    <source src={message.video} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            <span> - {new Date(message.timestamp).toLocaleString()}</span>
        </div>
    );
};

export default Message;
