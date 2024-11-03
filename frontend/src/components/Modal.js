import React from 'react';

const Modal = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white text-black p-6 rounded shadow-lg">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
