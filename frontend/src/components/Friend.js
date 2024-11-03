// FriendList.js or similar file
import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchUserProfile } from './authSlice';
import { useNavigate } from 'react-router-dom';

const FriendList = ({ friends }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleFriendClick = (userId) => {
    dispatch(fetchUserProfile(userId));  // Fetch friend's profile
    navigate(`/profileuser/${userId}`);  // Navigate to profile page
  };

  return (
    <div>
      {friends.map(friend => (
        <div key={friend.id} onClick={() => handleFriendClick(friend.id)}>
          <img src={friend.profile_picture} alt="Friend" />
          <p>{friend.first_name}</p>
        </div>
      ))}
    </div>
  );
};

export default FriendList;
