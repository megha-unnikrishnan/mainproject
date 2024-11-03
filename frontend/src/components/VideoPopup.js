import React from 'react';

const VideoPopup = ({ remoteVideoRef, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg overflow-hidden w-full max-w-3xl h-3/4 flex items-center justify-center relative">
                <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default VideoPopup;
