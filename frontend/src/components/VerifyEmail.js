
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const VerifyEmail = () => {
  const { user_id, token } = useParams();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Define verifyEmail as a memoized callback
  const verifyEmail = useCallback(async (userId, token) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/api/verify-email/${userId}/${token}/`);
      console.log('Email verified successfully:', response.data);
      setMessage(response.data.message || 'Email verified successfully'); // Use the message from the response
      setTimeout(() => {
        navigate('/'); // Redirect after showing the message
      }, 2000);
    } catch (error) {
      console.error('Error verifying email:', error.response ? error.response.data : error.message);
      setMessage('Invalid or expired verification link.');
    }
  }, [navigate]);

  useEffect(() => {
    verifyEmail(user_id, token);
  }, [user_id, token, verifyEmail]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">Verification Status</h1>
        <p className="text-center text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
