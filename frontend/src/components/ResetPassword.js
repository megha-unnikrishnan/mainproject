import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPasswordReset } from '../features/authSlice';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();  // Get token from URL params
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false); // State to manage popup visibility
  const [passwordMismatch, setPasswordMismatch] = useState(false); // State to manage password mismatch
  const [countdown, setCountdown] = useState(5); // Countdown timer state
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { loading, message, error } = useSelector((state) => state.auth);

  useEffect(() => {
    let timer;
    if (showPopup && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      navigate('/'); // Redirect to login page when countdown reaches 0
    }
    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, [showPopup, countdown, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);

    dispatch(confirmPasswordReset({ token, password }))
      .then((response) => {
        // Handle success: show popup and start countdown
        if (response.meta.requestStatus === 'fulfilled') {
          setShowPopup(true);
        }
      })
      .catch((err) => {
        // Handle error if necessary
        console.error('Password reset error:', err);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-4">TalkStream</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordMismatch && <p className="text-red-500 text-sm mt-1">Passwords do not match</p>}
          </div>
          {loading && <p className="text-blue-500">Resetting password...</p>}
          {message && <p className="text-green-500">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold mb-4 text-green-600">Password reset successfully!</p>
              <p className="mb-4 text-gray-700">You will be redirected to the login page in {countdown} seconds.</p>
              {/* Optional: Add a manual link to the login page */}
              {/* <a href="/login" className="text-blue-500 underline">Go to Login Page</a> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
