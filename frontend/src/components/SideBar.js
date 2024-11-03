



import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/download.png'; // Update with your actual logo path
import { logout } from '../features/authSlice';
import NotificationsList from './NotificationsList'; // Assuming this is your notifications component
import MessageIcon from './MessageIcon'; // Assuming this is your messaging icon component

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false); // Sidebar is hidden initially on mobile
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const username = user ? user.username : 'Guest';

  const handleLogout = () => {
    dispatch(logout());
    // Optionally, you can redirect the user to a different page after logout
    window.location.href = '/'; // Example: redirect to the login page
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle sidebar visibility
  };

  return (
    <>
      {/* Hamburger Icon (visible on mobile) */}
      <button
        className="text-white bg-blue-500 p-2 rounded-md fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        <i className="bx bx-menu text-3xl"></i> {/* White Hamburger Icon */}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-gradient-to-br from-red-500 to-indigo-600 text-white shadow-lg p-6 transform transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0`}
      >
        <div className="flex items-center mb-8">
          <img src={logo} alt="App logo" className="w-14 h-14 rounded-full shadow-lg" />
          <span className="text-3xl font-bold ml-4">TalkStream</span>
        </div>
        <nav className="space-y-6">
          <NavLink
            to="/fetch-all-posts"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition duration-200 ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
            }
          >
            <i className="bx bx-home w-8 h-8 mr-3 text-white"></i>
            <span className="text-lg">Dashboard</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition duration-200 ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
            }
          >
            <i className="bx bx-user w-8 h-8 mr-3 text-white"></i>
            <span className="text-lg">Profile</span>
          </NavLink>
          <NavLink
            to="/bookmarks"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition duration-200 ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
            }
          >
            <i className="bx bx-bookmark w-8 h-8 mr-3 text-white"></i>
            <span className="text-lg">Save Posts</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-200 mt-auto"
          >
            <i className="bx bx-log-out w-8 h-8 mr-3 text-white"></i>
            <span className="text-lg">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Overlay to close the sidebar on mobile when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default SideBar;

