
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/download.png';
import {  Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    email: '',
    password: '',
    confirm_password: '',
    dob: '',
    mobile: '',
  });

  const [error, setError] = useState({});
  const dispatch = useDispatch();
  const { loading, error: reduxError, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[789]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errorMessages = {};

    if (!validatePassword(formData.password)) {
      errorMessages.password = 'Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (formData.password !== formData.confirm_password) {
      errorMessages.confirm_password = 'Passwords do not match.';
    }

    if (!formData.username) {
      errorMessages.username = 'Username is required.';
    }

    if (!formData.first_name) {
      errorMessages.first_name = 'Full Name is required.';
    }
    if (!formData.password) {
      errorMessages.first_name = 'Password is required.';
    }

    if (!validateMobile(formData.mobile)) {
      errorMessages.mobile = 'Mobile number must be 10 digits and start with 7, 8, or 9.';
    }

    if (!validateEmail(formData.email)) {
      errorMessages.email = 'Please enter a valid email address.';
    }

    if (Object.keys(errorMessages).length > 0) {
      setError(errorMessages);
      return;
    }

    setError({});

    const form = new FormData();
    form.append('username', formData.username);
    form.append('first_name', formData.first_name);
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('dob', formData.dob);
    form.append('mobile', formData.mobile);

    try {
      await dispatch(registerUser(form)).unwrap();
      navigate('/confirmation');
    } catch (err) {
      let errorMessages = {};
      if (err?.username) errorMessages.username = err.username.join(', ');
      if (err?.email) errorMessages.email = err.email.join(', ');
      if (err?.dob) errorMessages.dob = err.dob.join(', ');
      if (err?.password) errorMessages.password = err.password.join(', ');
      if (err?.mobile) errorMessages.mobile = err.mobile.join(', ');

      if (Object.keys(errorMessages).length === 0) {
        errorMessages.form = 'An unexpected error occurred.';
      }
      setError(errorMessages);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
         
        </div>
        <div className="text-center mb-6">
          <img src={logo} alt="TalkStream Logo" className="w-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Register</h1>
        </div>
        {/* <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Register</h1> */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="first_name"
              placeholder="Full Name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error.confirm_password && <p className="text-red-500 text-sm mt-1">{error.confirm_password}</p>}
          </div>
          <div className="mb-4">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error.dob && <p className="text-red-500 text-sm mt-1">{error.dob}</p>}
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error.mobile && <p className="text-red-500 text-sm mt-1">{error.mobile}</p>}
          </div>
          {error.form && <p className="text-red-500 text-sm mb-4">{error.form}</p>}
          {reduxError && <p className="text-red-500 text-sm mb-4">{reduxError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:opacity-50 transition-all"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link to="/" className="text-blue-500 hover:text-blue-700">
            Already SignIn?Sign In
          </Link>
       
        </div>
      </div>
    </div>
  );
};

export default Register;
