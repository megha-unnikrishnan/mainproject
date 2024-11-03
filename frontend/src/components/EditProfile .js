


import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { updateProfile, fetchUserDetails, updatePassword, logout } from '../features/authSlice';
import Sidebar from './SideBar';
import MessageIcon from './MessageIcon';
import NotificationsList from './NotificationsList';

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const error = useSelector((state) => state.auth.error);
  const message = useSelector((state) => state.auth.message);
  const loading = useSelector((state) => state.auth.loading);

  const loggedInUser = useSelector((state) => state.auth.user); 
  const username = loggedInUser ? loggedInUser.first_name : null;
  console.log('user',user);
  
  const [formData, setFormData] = useState({
    firstName: '',
    username: '',
    email: '',
    bio: '',
    dob: '',
    mobileNumber: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('success'); 
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        dob: user.dob || '',
        mobileNumber: user.mobile || '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      if (error.non_field_errors) {
        setFormErrors({ general: error.non_field_errors.join(', ') });
      } else {
        setFormErrors({ general: 'An unexpected error occurred.' });
      }
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Trim spaces and validate firstName
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }
    
    // Trim spaces and validate username
    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    }
    
    // Trim spaces and validate bio
    if (!formData.bio.trim()) {
      errors.bio = "Bio is required.";
    }
    
    // Validate mobile number
    const mobilePattern = /^[6789]\d{9}$/;
    if (!mobilePattern.test(formData.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits long and start with 6, 7, 8, or 9.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // return true if no errors
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!validateForm()) {
      setPopupMessage('Please fix the errors in the form.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }

    const updatedProfile = {
      first_name: formData.firstName.trim(),
      username: formData.username.trim(),
      email: formData.email,
      bio: formData.bio.trim(),
      dob: formData.dob,
      mobile: formData.mobileNumber.trim(),
    };

    const isProfileUpdated = Object.keys(updatedProfile).some(
      (key) => updatedProfile[key] !== (user[key] || '')
    );

    if (!isProfileUpdated) {
      setPopupMessage('No changes made to the profile.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(updateProfile(updatedProfile)).unwrap();
      setPopupMessage('Profile updated successfully!');
      setPopupType('success');
    } catch {
      setPopupMessage('Failed to update profile.');
      setPopupType('error');
    } finally {
      setIsSubmitting(false);
      setShowPopup(true);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setPopupMessage('New passwords do not match.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }

    if (!formData.password || !formData.newPassword) {
      setPopupMessage('Please fill in all password fields.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }

    if (formData.newPassword.length < 8) {
      setPopupMessage('New password must be at least 8 characters long.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        updatePassword({
          oldPassword: formData.password,
          newPassword: formData.newPassword,
        })
      ).unwrap();
      setPopupMessage('Password updated successfully!');
      setPopupType('success');

      dispatch(logout()); 

      window.location.href = '/';
    } catch (error) {
      let errorMessage = 'Old password is incorrect.';
      if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors.join(', ');
      } else if (error.response?.status === 400) {
        errorMessage = 'Old password is incorrect.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setPopupMessage(errorMessage);
      setPopupType('error');
    } finally {
      setIsSubmitting(false);
      setShowPopup(true);
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <nav 
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg p-4 flex items-center justify-between fixed top-0 z-10 w-full" 
        style={{ height: '70px', marginLeft: '-3px' }}
      >
        <div className="flex items-center space-x-4 ml-auto">
          <h1 className="text-white text-xl font-bold">Welcome, {username}</h1>
          <NotificationsList />
          <MessageIcon />
        </div>
      </nav>
      <div className="flex h-screen bg-white-100">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900" style={{ marginTop: '5%' }}>Edit Profile</h1>
              <button
                onClick={() => navigate('/profile')} 
                className="py-1 px-2 bg-gray-600 text-white rounded-sm shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 ease-in-out text-xs inline-block"
              >
                Back
              </button>
            </div>

            {showPopup && (
              <div 
                className={`fixed top-20 right-4 py-1 px-2 rounded-sm shadow-lg transition duration-300 ${popupType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
              >
                {popupMessage}
              </div>
            )}

            {formErrors.general && (
              <div className="mb-4 text-red-600">{formErrors.general}</div>
            )}

            <form onSubmit={handleSubmitProfile} className="space-y-6 mb-8">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="firstName" className="text-base font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.firstName && (
                    <span className="text-red-600 text-sm">{formErrors.firstName}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="username" className="text-base font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.username && (
                    <span className="text-red-600 text-sm">{formErrors.username}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="bio" className="text-base font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md"
                    
                  />
                  {formErrors.bio && (
                    <span className="text-red-600 text-sm">{formErrors.bio}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="mobileNumber" className="text-base font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.mobileNumber && (
                    <span className="text-red-600 text-sm">{formErrors.mobileNumber}</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || isSubmitting}
                className={`py-2 px-4 rounded-md text-white ${loading || isSubmitting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading || isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </form>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6">Change Password</h2>

            <form onSubmit={handleSubmitPassword} className="space-y-6 mt-4">
              <div className="flex flex-col">
                <label htmlFor="password" className="text-base font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-md"
                  
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="newPassword" className="text-base font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-md"
                  
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="text-base font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-md"
                  
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || isSubmitting}
                className={`py-2 px-4 rounded-md text-white ${loading || isSubmitting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading || isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;
