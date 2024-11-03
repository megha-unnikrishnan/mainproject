

import React from 'react';
import { useSelector } from 'react-redux'; // or your state management library
import { useNavigate } from 'react-router-dom'; // Add this import

const Confirmation = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // or your authentication state
  const isVerified = useSelector((state) => state.auth.isVerified); // or your verification state
  const navigate = useNavigate(); // Create a navigate function

  if (isAuthenticated && isVerified) {
    // Navigate to a different page
    navigate('/', { replace: true }); // Navigate to /dashboard
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">Check Your Email</h1>
        <p className="text-center text-gray-700 mb-4">A verification link has been sent to your email address.</p>
        <p className="text-center text-gray-700">Please check your email and follow the instructions to verify your account.</p>
      </div>
    </div>
  );
};

export default Confirmation;
