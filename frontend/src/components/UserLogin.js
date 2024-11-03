

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import logo from '../assets/download.png';

const UserLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error: reduxError, token, status } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/fetch-all-posts');
        }
    }, [navigate]);

    useEffect(() => {
        if (status === 'succeeded' && token) {
            setSuccessMessage('Login successful! Redirecting to dashboard...');
            setTimeout(() => navigate('/fetch-all-posts'), 1000); // Reduced to 1 second
        }
    }, [status, navigate, token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({});
        setSuccessMessage('');

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }

        try {
            await dispatch(loginUser({ userData: formData, isAdmin: false })).unwrap();
            setSuccessMessage('Login successful! Redirecting to dashboard...');
            setTimeout(() => navigate('/fetch-all-posts'), 1000); // Reduced to 1 second
        } catch (err) {
            let errorMessages = {};
            if (err?.email) {
                errorMessages.email = Array.isArray(err.email) ? err.email.join(', ') : err.email;
            }
            if (err?.password) {
                errorMessages.password = Array.isArray(err.password) ? err.password.join(', ') : err.password;
            }
            if (err?.detail) {
                errorMessages.form = err.detail;
            }
            setError(errorMessages);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="bg-white shadow-lg rounded-lg p-8 w-96">
                <div className="text-center mb-6">
                    <img src={logo} alt="TalkStream Logo" className="w-24 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">TalkStream</h1>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login to Your Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
                    </div>
                    {error.form && <p className="text-red-500 text-sm mt-4">{error.form}</p>}
                    {reduxError && <p className="text-red-500 text-sm mt-4">{reduxError}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 flex justify-between text-sm">
                    <Link to="/register" className="text-blue-500 hover:text-blue-700">
                        Don't have an account? Sign up
                    </Link>
                    <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700">
                        Forgot password?
                    </Link>
                </div>
                <div className="mt-6 text-center">
                    {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">Login with Google</h2> */}
                    <div className="flex justify-center">
                        {/* <GoogleLoginButton /> */}
                    </div>
                </div>
            </div>

            {/* Success Popup */}
            {successMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-center py-2 px-4 rounded shadow-lg">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default UserLogin;
