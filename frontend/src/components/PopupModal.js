// src/components/PopupModal.js

import React from 'react';

const PopupModal = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`fixed inset-0 bg-gray-900 opacity-50`} onClick={onClose}></div>
      <div className={`relative p-6 bg-white rounded-lg shadow-lg w-1/3`}>
        <div className={`text-center ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          <p>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PopupModal;
