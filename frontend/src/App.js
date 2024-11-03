import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserLogin from './components/UserLogin';
import AdminLogin from './components/AdminLogin';
import Register from './components/Register';
import Confirmation from './components/Confirmation';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import FriendUserProfile from './components/FriendUserProfile';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard ';
import ActivityFeed from './components/ActivityFeed';
import UserManagement from './components/UserManagement';
import EditProfile from './components/EditProfile ';
import NotificationsList from './components/NotificationsList';
import FollowingPage from './components/FollowingPage';
import BookmarkedPostsList from './components/BookmarkedPostsList ';
import PostFeed from './components/PostFeed ';
import MessageUserList from './components/MessageUserList';
import HashtagPage from './components/HashtagPage';
import PostDetails from './components/PostDetails';
import AdminReportList from './components/AdminReportList';
import MessageIcon from './components/MessageIcon';
import ChatConversation from './components/ChatConversation';

import VideoCall from './components/VideoCall';
const App = () => {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
     
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/userprofile/:userId" element={<FriendUserProfile />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path='/register' element={<Register />} />
        <Route path='/admin-user' element={<UserManagement />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path="/notification" element={<NotificationsList />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/bookmarks" element={<BookmarkedPostsList />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/verify-email/:user_id/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:user_id/:token" element={<ResetPassword />} />
        <Route path="/fetch-all-posts" element={<PostFeed />} />
        <Route path="/reports" element={<AdminReportList />} />
        <Route path="/activity-feed" element={<ActivityFeed />} />
        <Route path="/message" element={<MessageIcon />} />
        <Route path="/videocall" element={<VideoCall />} />
        <Route path="/hashtag/:hashtag" element={<HashtagPage />} />
        <Route path="/posts/:id" element={<PostDetails />} />

        <Route path="/chat/:userId" element={<ChatConversation />} /> {/* Dynamic route for chat */}

    
     

       
      </Routes>
  
    </Router>
  );
};

export default App;
